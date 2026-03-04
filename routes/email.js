const express = require("express");
const router = express.Router();
const { sendEmail } = require("../services/emailService");
const ejs = require("ejs");
const path = require("path");

// sendUserEmail
router.post("/send", async (req, res) => {
  const { to, subject, message } = req.body;
  console.log(req.body);

  if (!to || !subject || !message) {
    console.log(to);
    console.log(subject);
    console.log(message);

    return res.status(400).json({
      success: false,
      error: "Missing fields: to, subject, message",
    });
  }
  try {
    const dynamicOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(dynamicOTP);
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/forget_password_email_template.ejs"),
      {
        title: "Express",
        otp: dynamicOTP,
        expiry: 6,
      },
    );
    const result = await sendEmail({ to, subject, html });
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Email sent",
      otpSent: dynamicOTP,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Email Failed",
      detail: error.message,
    });
  }
});
module.exports = router;
