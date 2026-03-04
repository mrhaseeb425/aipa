const db = require("../db/connection");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("../services/emailService");
const crypto = require("crypto");
const multer = require("multer");

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
// Create a helper function for the actual OTP logic
const generateAndSaveOtp = async (email) => {
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryTime = new Date(Date.now() + 6 * 60 * 1000);
  await db.execute("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?", [
    generatedOtp,
    expiryTime,
    email,
  ]);
  return { generatedOtp, expiryTime };
};

// Updated Register API
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password and name required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail],
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, otp, otp_expiry) VALUES (?, ?, ?, NULL, NULL)",
      [normalizedEmail, hashedPassword, name],
    );

    // CALLING THE OTP LOGIC HERE
    // We call our helper function instead of the route handler
    const { generatedOtp } = await generateAndSaveOtp(normalizedEmail);

    // Render and Send Email (Logic simplified for brevity)
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/forget_password_email_template.ejs"),
      { title: "Welcome", otp: generatedOtp },
    );
    // await sendEmail({ to: normalizedEmail, subject: "Welcome!", html });

    res.status(201).json({
      success: true,
      message: "User registered and OTP sent",
      user: { id: result.insertId, email: normalizedEmail },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

//Updated resendPasswordResetOtp API (Uses the same helper)
// Updated API to send password reset OTP using the shared helper function
exports.resendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [
      normalizedEmail,
    ]);
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
// Validate OTP sent to user's email
// Extract email and OTP from request body
// Ensures only one active OTP exists per user at a time
exports.checkOtpEmailRoute = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Request body for OTP verification:", req.body);

    if (!email || !otp) {
      console.log("Missing email and OTP");
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.execute(
      "SELECT otp, otp_expiry FROM users WHERE email = ?",
      [normalizedEmail],
    );
    console.log("DB query result:", rows);

    if (!rows || rows.length === 0) {
      console.log("No user found with this email:", normalizedEmail);
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const user = rows[0];

    if (!user.otp) {
      return res
        .status(400)
        .json({ success: false, message: "No active OTP found." });
    }

    const nows = new Date();
    const otpExpiry = new Date(user.otp_expiry);

    if (otpExpiry < nows) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await db.execute(
      "UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?",
      [normalizedEmail],
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ChangePassword
// Verify OTP and update user password
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

// Forgot Password - Reset link email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered, a password reset link has been sent.",
      });
    }
    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [hashedToken, tokenExpiry, user.id],
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    console.log(`Password reset link for ${email}: ${resetLink}`);

    return res.status(200).json({
      success: true,
      message: "The password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all users id
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, password } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];

    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await db.query("UPDATE users SET name = ?, password = ? WHERE id = ?", [
      name || user.name,
      hashedPassword,
      userId,
    ]);

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload Image

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  console.log("File received:", file);

  const allowedExtensions = /jpeg|jpg|png|gif/;
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif)/;

  const extName = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedMimeTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter }).single("image");

exports.uploadImage = (req, res) => {
  upload(req, res, function (err) {
    console.log("Headers:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (err) {
      console.log(err);

      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const webPath = req.file.path.replace(/\\/g, "/");
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      filename: req.file.filename,
      path: webPath,
      url: `http://localhost:3000/${webPath}`
    });
  });
};
