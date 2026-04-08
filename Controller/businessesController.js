import { prisma } from "../libs/prisma.js";

// create api //
export const createBusiness = async (req, res) => {
  try {
    const userId = req.user?.id || req.user;

    const {
      business_name,
      email,
      phone_number,
      state,
      zip_code,
      address,
      logo_url,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const newBusiness = await prisma.businesses.create({
      data: {
        business_name,
        email: email.toLowerCase().trim(),
        phone_number: Number(phone_number),
        state,
        zip_code: String(zip_code),
        address,
        logo_url: logo_url || "",
        user_id: Number(userId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Business successfully created!",
      business: newBusiness,
    });
  } catch (error) {
    console.error("CreateBusiness Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// States api //
export const statesBusinesses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile_pic: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const businesses = await prisma.businesses.findMany({
      where: { user_id: Number(userId) },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Data successfully fetched",
      user: user,
      businesses: businesses,
    });
  } catch (error) {
    console.error("StatesBusinesses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// update //
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const {
      business_name,
      email,
      phone_number,
      state,
      zip_code,
      address,
      logo_url,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updateResult = await prisma.Businesses.updateMany({
      where: {
        id: Number(id),
        user_id: Number(userId),
      },
      data: {
        business_name,
        email: email ? email.toLowerCase().trim() : undefined,
        phone_number: phone_number ? Number(phone_number) : undefined,
        state,
        zip_code,
        address,
        logo_url,
      },
    });

    if (updateResult.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Business record not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
    });
  } catch (error) {
    console.error("UpdateBusiness Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};
export default {
  createBusiness,
  statesBusinesses,
  updateBusiness,
};
