import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import ejs from "ejs";
import jwt from "jsonwebtoken";
import path from "path";
import { prisma } from "../libs/prisma.js";
dotenv.config();
const env = process.env;

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateAndSaveOtp = async (email) => {
  const generatedOtp = Math.floor(100000 + Math.random() * 900000);

  const expiryTime = new Date(Date.now() + 6 * 60 * 1000);

  try {
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        otp: generatedOtp.toString(),
        otp_expiry: expiryTime,
      },
    });
    return { generatedOtp, expiryTime };
  } catch (error) {
    console.error("DATABASE UPDATE ERROR:", error);
    throw new Error("Failed to save OTP to database");
  }
};

//  REGISTER //
export const register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, name and role are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role.toUpperCase(),
        phone: phone ? parseInt(phone) : null,
        profile_pic: "",
        otp: null,
        otp_expiry: null,
      },
    });

    const { generatedOtp } = await generateAndSaveOtp(normalizedEmail);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered and OTP sent",
      token,
      user: {
        id: newUser.id,
        email: normalizedEmail,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Register Error Details:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
      error: error.message,
    });
  }
};

// LOGIN //
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Only administrators are allowed to log in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_pic: user.profile_pic,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// RESEND OTP //
export const resendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const { generatedOtp } = await generateAndSaveOtp(normalizedEmail);

    const html = await ejs.renderFile(
      path.join(path.resolve(), "views/forget_password_email_template.ejs"),
      { title: "Resend OTP", otp: generatedOtp },
    );

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

//  CHECK OTP //
export const checkOtpEmailRoute = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please resend.",
      });
    }

    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        otp: null,
        otp_expiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now proceed.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//  CHANGE PASSWORD //
export const changePassword = async (req, res) => {
  try {
    const { email, otp, new_password, confirm_password } = req.body;

    if (!email || !otp || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (email, otp, new_password, confirm_password) are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isOtpValid =
      user.otp && String(user.otp).trim() === String(otp).trim();
    const isOtpExpired =
      user.otp_expiry && new Date(user.otp_expiry) < new Date();

    if (!isOtpValid || isOtpExpired) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        otp: null,
        otp_expiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//  FORGOT PASSWORD //
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 15 Minutes expiry
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        reset_token: hashedToken,
        // FIX: .toISOString() lagaya taake ye String ban jaye aur Schema se match kare
        reset_token_expiry: tokenExpiry.toISOString(),
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${normalizedEmail}`;

    console.log(`--- Password Reset Link for ${normalizedEmail} ---`);
    console.log(resetLink);

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
      error: error.message,
    });
  }
};

//  GET USER //
export const getUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found in token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile_pic: true,
        phone: true,
        gender: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetUser Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};


export default {
  register,
  login,
  resendPasswordResetOtp,
  checkOtpEmailRoute,
  changePassword,
  forgotPassword,
  getUser,
};
