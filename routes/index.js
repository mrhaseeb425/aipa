const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const getUsersController = require("../Controller/usersController");

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});
router.get("/test-email", function (req, res) {
  res.render("forget_password_email_template", {
    title: "Express",
    otp: "16764",
    expiry: 5,
  });
});
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", getUsersController.getMyUser);
router.use("/email", require("./email"));

module.exports = router;
