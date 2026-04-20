import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { prisma } from "../libs/prisma.js";

// Get All users

export const getMyUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile_pic: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.status(200).json({
      success: true,
      message: "Authorized user",
      user: user,
    });
  } catch (error) {
    console.log("JWT VERIFICATION ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
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
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (userToDelete && userToDelete.email === "smith@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Admin user cannot be deleted.",
      });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// updateUser //
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// getAllUsers
// export const getAllUsers = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorised: No token provided",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

//     if (!secret) {
//       console.log(" Error: .env mein ACCESS_TOKEN_SECRET missing hai!");
//       return res.status(500).json({
//         success: false,
//         message: "Server configuration error (Secret missing)",
//       });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, secret);
//       console.log(" Token Verified for Admin:", decoded.email || "Admin");
//     } catch (jwtError) {
//       console.log(" JWT Error:", jwtError.message);
//       return res.status(401).json({
//         success: false,
//         message: "Session expired or invalid token. Please login again.",
//         error: jwtError.message,
//       });
//     }

//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         profile_pic: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     console.log(`🚀 Success: ${users.length} users fetched from DB`);

//     return res.status(200).json(users);
//   } catch (error) {
//     console.error(" Critical Server Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

export const getAllUsers = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error (Secret missing)",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid token.",
      });
    }

    // --- PAGINATION LOGIC START ---
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Ek page par kitne users
    const skip = (page - 1) * limit;

    // 1. Data fetch karein limit ke sath
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        profile_pic: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Total users count nikaalein taake frontend ko total pages pata chalein
    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    console.log(`🚀 Success: Page ${page} fetched (${users.length} users)`);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
    // --- PAGINATION LOGIC END ---
  } catch (error) {
    console.error(" Critical Server Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get user by id //
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} was not found in the database.`,
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GET USER ERROR:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// create user //

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Email are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash("User@123", 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("DETAILED ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export default {
  getMyUser,
  uploadProfilePic,
  getAllUsers,
  adminDeleteUser,
  updateUser,
  getUserById,
  createUser,
};
