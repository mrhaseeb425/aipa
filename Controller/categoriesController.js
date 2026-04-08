import { prisma } from "../libs/prisma.js";

// post-categories //
export const createCategories = async (req, res) => {
  try {
    const { categoriesList } = req.body;

    if (!categoriesList || !Array.isArray(categoriesList)) {
      return res.status(400).json({
        success: false,
        message: "Categories list must be an array of names",
      });
    }

    const createdCategories = await prisma.categories.createMany({
      data: categoriesList.map((name) => ({
        name: name,
      })),
      skipDuplicates: true,
    });

    return res.status(201).json({
      success: true,
      message: `${createdCategories.count} Categories created successfully!`,
    });
  } catch (error) {
    console.error("Seed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// get-categories getCategories //
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "asc" }, 
    });

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories found in database",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default {
  createCategories,
  getAllCategories,
};
