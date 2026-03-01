const db = require("../db/connection");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("../services/emailService");


//  login Users
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  console.log(email);
  

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    console.log(users);
    

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Login successful",
      user: user,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};


// 1. Create a helper function for the actual OTP logic
const generateAndSaveOtp = async (email) => {
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  // Ensure date is formatted for MySQL
  const expiryTime = new Date(Date.now() + 6 * 60 * 1000); 

  await db.execute(
    "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
    [generatedOtp, expiryTime, email]
  );
  return { generatedOtp, expiryTime };
};

// 2. Updated Register API
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Email, password and name required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const [existingUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert User
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, otp_success, otp, otp_expiry) VALUES (?, ?, ?, 0, NULL, NULL)",
      [normalizedEmail, hashedPassword, name]
    );

    // CALLING THE OTP LOGIC HERE
    // We call our helper function instead of the route handler
    const { generatedOtp } = await generateAndSaveOtp(normalizedEmail);

    // Render and Send Email (Logic simplified for brevity)
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/forget_password_email_template.ejs"),
      { title: "Welcome", otp: generatedOtp }
    );
    // await sendEmail({ to: normalizedEmail, subject: "Welcome!", html });

    res.status(201).json({
      success: true,
      message: "User registered and OTP sent",
      user: { id: result.insertId, email: normalizedEmail },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// 3. Updated sendPasswordResetOtp API (Uses the same helper)
exports.sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const { generatedOtp } = await generateAndSaveOtp(normalizedEmail);

    // Email logic here...
    
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Validate Otp
// const { email , otp } = req.body;

// otpValidator.js
// otpValidator.js
// checkOtpEmailRoute.js 
// mtable ek time one time- password-send kar
exports.checkOtpEmailRoute = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Request body for OTP verification:", req.body);

    if (!email || !otp) {
      console.log("Missing email or OTP");
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

 const [rows] = await db.execute(
  "SELECT otp, otp_expiry FROM users WHERE email = ?",
  [normalizedEmail]
);
    console.log("DB query result:", rows);


if (!rows || rows.length === 0) {
  console.log("No user found with this email:", normalizedEmail);
  return res
    .status(404)
    .json({ success: false, message: "Email not found" });
}

    const user = rows[0];

    // 2. Check if OTP exists in DB
    if (!user.otp) {
      return res.status(400).json({ success: false, message: "No active OTP found." });
    }

    // 3. Check Expiry
    const nows = new Date();
    const otpExpirys = new Date(user.otp_expiry);

    if (otpExpirys < nows) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    // 4. Verify OTP (Trim both to be safe)
    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 5. SUCCESS: Clear the OTP so it can't be reused
    await db.execute(
      "UPDATE users SET otp = NULL, otp_success = 1, otp_expiry = NULL WHERE email = ?",
      [normalizedEmail]
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

//   if (!user.otp || !user.otp_expiry) {
//   console.log("OTP or expiry missing for user:", normalizedEmail);
//   return res.status(400).json({
//     success: false,
//     message: "No OTP found. Please request a new one.",
//   });
// }

   
//     const now = Date.now();
//     const otpExpiry = new Date(user.otp_expiry).getTime();
//     console.log("Current time:", new Date(now).toLocaleString());
//     console.log("OTP expiry from DB:", new Date(otpExpiry).toLocaleString());
//     console.log("OTP in DB:", user.otp, "OTP from request:", otp);

//     if (otpExpiry < now) {
//       console.log("OTP has expired for user:", normalizedEmail);
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired. Please request a new one.",
//       });
//     }

//     console.log(user.otp);
// console.log(otp);
// console.log("otpotpotpotp");


//     if (String(otp).trim() !== String(user.otp).trim()) {
//       console.log("OTP mismatch for user:", normalizedEmail);
//       console.log("Entered OTP:", otp);
//      console.log("Database OTP:", user.otp);
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
// const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
// const expiryTime = new Date(Date.now() + 6 * 60 * 1000);
// const expiryTimeStr = expiryTime.toISOString().slice(0, 19).replace("T", " ");

//     // Clear OTP after successful verification
// await db.execute(
//   "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
//   [generatedOtp, expiryTimeStr, email]
// );
// console.log("Generated OTP:", generatedOtp, "Expiry:", expiryTimeStr);
//     console.log("OTP cleanup result:", result);

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//     });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ChangePassword
exports.changePassword = async (req, res) => {
  const verifyOtp = async (email, otp) => {
    try {
      const query = `SELECT otp, otp_expiry FROM users WHERE email = ?`;
      const [userRows] = await db.execute(query, [email]);
      if (!userRows[0]) {
        console.log("No user found for email:", email);
        return false;
      }
      const dbOtp = userRows[0].otp;
      const otpExpiry = new Date(userRows[0].otp_expiry).getTime();
      const now = Date.now();

      console.log("DB OTP:", dbOtp);
      console.log("DB Expiry:", otpExpiry);
      console.log("Current Time:", now);

      if (dbOtp !== otp) {
        console.log("OTP mismatch");
        return false;
      }

      if (now > otpExpiry) {
        console.log("OTP expired");
        return false;
      }
      return true;
    } catch (error) {
      console.error("verifyOtp Error:", error);
      return false;
    }
  };
  const updatePasswordInDb = async (email, hashedPassword) => {
    try {
      const query = `
     UPDATE users 
    SET password = ?, otp = NULL, otp_expiry = NULL 
    WHERE email = ?
    `;
      const [result] = await db.execute(query, [hashedPassword, email]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("updatePasswordInDb Error:", error);
      return false;
    }
  };
  try {
    const { email, otp, new_password, confirm_password } = req.body;
    console.log("Request Body:", req.body);
    console.log("Email:", email, "OTP:", otp);
    if (!email || !otp || !new_password || !confirm_password) {
      console.log("Missing Fields:", {
        email,
        otp,
        new_password,
        confirm_password,
      });
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    if (new_password !== confirm_password) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    const isValidOtp = await verifyOtp(email, otp);
    console.log("OTP Valid:", isValidOtp);
    if (!isValidOtp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or invalid" });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    console.log("Hashed Password:", hashedPassword);
    const result = await updatePasswordInDb(email, hashedPassword);
    console.log("DB Update Result:", result);
    if (result) {
      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//
