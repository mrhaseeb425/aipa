const nodemailer = require("nodemailer");

let transporter;

if (process.env.NODE_ENV === "development") {
  // Dev: Log emails instead of sending
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  console.log("Dev mode: Emails will be logged, not sent");
} else {
  // Production: Real SMTP
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("SMTP Error:", error);
    } else {
      console.log("Email Service Ready");
    }
  });
}

//sendUserEmail
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Email Content:\n", info.message);
    }

    return {
      success: true,
      messageId: info.messageId || "dev-message",
    };
  } catch (error) {
    console.error("Send Email Error:", error);
    throw error;
  }
};

module.exports = { sendEmail };
