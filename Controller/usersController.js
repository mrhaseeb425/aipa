import jwt from "jsonwebtoken";
import multer from "multer";
import db from "../db/connection.js";
import { prisma } from "../libs/prisma.js";

// Get All users
export const getMyUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
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

// upload-profile-pic //
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }).single("image");

export const uploadProfilePic = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "File upload error: " + err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file selected" });
    }

    const userId = req.user?.id;

    console.log("USER FROM TOKEN:", req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated - Login again",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: { profile_pic: imageUrl },
      });

      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully!",
        imageUrl: imageUrl,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
        },
      });
    } catch (error) {
      console.error("Upload DB Error:", error.message);

      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: `User with ID ${userId} not found. Please log in again.`,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Database update failed",
        error: error.message,
      });
    }
  });
};

// delete user //
const deleteUserAccount = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userAssessments = await prisma.assessments.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    const assessmentIds = userAssessments.map((a) => a.id);

    if (assessmentIds.length > 0) {
      const details = await prisma.assessment_details.findMany({
        where: { client_id: { in: assessmentIds } }, 
        select: { id: true },
      });

      const detailIds = details.map((d) => d.id);

      if (detailIds.length > 0) {
        await prisma.assessment_images.deleteMany({
          where: { assessment_detail_id: { in: detailIds } }, 
        });
      }

      await prisma.assessment_details.deleteMany({
        where: { client_id: { in: assessmentIds } },
      });

      await prisma.assessment_categories.deleteMany({
        where: { assessments_id: { in: assessmentIds } },
      });

      await prisma.assessments.deleteMany({
        where: { user_id: userId },
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: "Account and all data deleted successfully.",
      action: "LOGOUT_USER",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account.",
      error: error.message,
    });
  }
};

export default {
  getMyUser,
  uploadProfilePic,
  deleteUserAccount,
};
