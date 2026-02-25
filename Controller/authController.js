const db = require("../db/connection");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();
const jwt = require("jsonwebtoken");

// register
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Email and password required" });
  }
  console.log("Register body:", req.body); // Debug: check password
  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0)
          return res.status(400).json({ message: "User already exists" });

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.query(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            [email, hashedPassword, name],
            (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({
                message: "User registered successfully",
                user: { id: result.insertId, email },
              });
            },
          );
        } catch (hashErr) {
          return res.status(500).json({ error: hashErr.message });
        }
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  login Users
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0)
          return res.status(400).json({ message: "Invalid email or password" });

        const user = results[0];

        try {
          const match = await bcrypt.compare(password, user.password);
          if (!match)
            return res
              .status(400)
              .json({ message: "Invalid email or password" });

          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" },
          );

          res.status(200).json({
            message: "Login successful",
            token,
          });
        } catch (bcryptErr) {
          return res.status(500).json({ error: bcryptErr.message });
        }
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// request forget pass
// param email: get user form email than plot the 6 digit code on the user and than send otp through email

// const html = await ejs.renderFile(
//       path.join(__dirname, "views/forget_password_email_template.ejs"),
//       {
//         title: "Express",
//         otp: "16764",
//         expiry: 5,
//       },
//     );
//     const result = await sendEmail({ to, subject, html });

// validate otp
// change forget pass



