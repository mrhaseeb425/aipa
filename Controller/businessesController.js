import { prisma } from "../libs/prisma.js";

// create api //
export const createBusiness = async (req, res) => {
  try {
    const {
      business_name,
      email,
      phone_number,
      state,
      zip_code,
      address,
      logo_url,
      user_id,
    } = req.body;

    if (!business_name || !email || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Business name, email, and user_id are required!",
      });
    }

    const newBusiness = await prisma.businesses.create({
      data: {
        business_name,
        email: email.toLowerCase().trim(),
        phone_number: phone_number ? phone_number.toString() : null,
        zip_code: zip_code ? zip_code.toString() : "",
        state: state || "",
        address: address || "",
        logo_url: logo_url || "",
        user_id: Number(user_id),
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
    const {
      business_name,
      email,
      phone_number,
      state,
      zip_code,
      address,
      logo_url,
    } = req.body;

    const updateResult = await prisma.businesses.update({
      where: {
        id: Number(id),
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

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
      data: updateResult,
    });
  } catch (error) {
    console.error("UpdateBusiness Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Business record not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// Get all businesses
// export const getAllBusinesses = async (req, res) => {
//   try {
//     const businesses = await prisma.businesses.findMany({
//       select: {
//         id: true,
//         business_name: true,
//         email: true,
//         phone_number: true,
//         state: true,
//         zip_code: true,
//         address: true,
//         logo_url: true,
//         user_id: true,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       data: businesses,
//     });
//   } catch (error) {
//     console.error("Backend Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Businesses fetching failed",
//       error: error.message,
//     });
//   }
// };

// export const getAllBusinesses = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.max(1, parseInt(req.query.limit) || 10);
//     const skip = (page - 1) * limit;

//     const [businesses, totalItems] = await prisma.$transaction([
//       prisma.businesses.findMany({
//         // Check karein aapke table ka naam 'businesses' hai ya 'business'
//         skip,
//         take: limit,
//         orderBy: { id: "desc" },
//       }),
//       prisma.businesses.count(),
//     ]);

//     const formattedData = businesses.map((item) => ({
//       id: item.id,
//       // Database screenshot ke mutabiq keys use karein
//       business_name: item.business_name || "N/A",
//       contact_email: item.email || "N/A",
//       phone: item.phone_number || "N/A", // Screenshot mein 'phone_number' hai
//       state: item.state || "N/A",
//       zip_code: item.zip_code || "N/A",
//       address: item.address || "N/A",
//       logo: item.logo_url || null,
//       created_at: item.createdAt,
//     }));

//     return res.status(200).json({
//       success: true,
//       data: formattedData,
//       pagination: {
//         totalItems,
//         totalPages: Math.ceil(totalItems / limit),
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("BUSINESS_FETCH_ERROR:", error.message);
//     return res.status(500).json({
//       success: false,
//       error: "Error fetching business records",
//     });
//   }
// };

export const getAllBusinesses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [businesses, totalItems] = await prisma.$transaction([
      prisma.businesses.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.businesses.count(),
    ]);

    const formattedData = businesses.map((item) => ({
      id: item.id,
      business_name: item.business_name || "N/A",
      email: item.email || "N/A",
      phone_number: item.phone_number || "N/A",
      address: item.address || "N/A",
      state: item.state || "N/A",
      zip_code: item.zip_code || "N/A",
      logo_url: item.logo_url || null,
      createdAt: item.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("BUSINESS_FETCH_ERROR:", error.message);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};
// Delete Business
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const businessExists = await prisma.businesses.findUnique({
      where: { id: parseInt(id) },
    });

    if (!businessExists) {
      return res.status(404).json({
        success: false,
        message: "Business not found with this ID",
      });
    }

    const deletedBusiness = await prisma.businesses.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Business deleted successfully!",
      data: deletedBusiness,
    });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: error.message,
    });
  }
};

export default {
  createBusiness,
  statesBusinesses,
  updateBusiness,
  getAllBusinesses,
  deleteBusiness,
};
