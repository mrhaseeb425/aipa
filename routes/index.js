const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const getUsersController = require("../Controller/usersController");
const { sendEmail } = require("../services/emailService");
/* GET home page. */

router.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});
router.get("/test-email", function (req, res) {
  res.render("forget_password_email_template", {
    title: "Express",
    otp: "167642",
    expiry: 6,
  });
});
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", getUsersController.getMyUser);
router.use("/email", require("./email"));
router.post("/resendPasswordResetOtp", authController.resendPasswordResetOtp);
router.post("/checkOtpEmailRoute", authController.checkOtpEmailRoute);
router.post("/changePassword", authController.changePassword);
router.post("/forgotPassword", authController.forgotPassword);
router.get("/user/:id", authController.getUserById);
router.patch("/user/:id", authController.updateUser);
router.delete("/user/:id", authController.deleteUser);
router.post("/upload-image", authController.uploadImage);
module.exports = router;
