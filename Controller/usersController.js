const jwt = require("jsonwebtoken");
const db = require("../db/connection");
// Get All users
exports.getMyUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    db.query(
      "SELECT id, email FROM users WHERE id = ?",
      [decoded.id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({
          message: "Authorized user",
          user_data: decoded,
          user: result[0],
        });
      },
    );
  } catch (error) {
    console.log("JWT FULL ERROR:", error);
    return res.status(401).json({ message: error.message });
  }
};
