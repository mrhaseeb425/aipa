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

// SINGLE CATEGORY CREATE
export const singleCreateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Received Name:", name);

    const newCategory = await prisma.categories.create({
      data: { name: name },
    });

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CATEGORIES

export const getAllCategories = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [categories, totalCategories] = await prisma.$transaction([
      prisma.categories.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.categories.count(),
    ]);

    return res.status(200).json({
      success: true,
      categories,
      pagination: {
        totalItems: totalCategories,
        totalPages: Math.ceil(totalCategories / limit) || 1,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// deleteCategory
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Please send a valid ID." });
    }

    const modelName = Object.keys(prisma).find(
      (key) =>
        key.toLowerCase() === "category" || key.toLowerCase() === "categories",
    );

    if (!modelName) {
      console.log("Available Prisma Models:", Object.keys(prisma));
      return res.status(500).json({
        success: false,
        message:
          "No suitable model found in Prisma client for 'Category' or 'Categories'",
      });
    }

    await prisma[modelName].delete({
      where: { id: categoryId },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Please send a valid ID." });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because it is referenced by other records.",
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Please send a valid ID." });
    }

    const categoryId = parseInt(id);

    const existingCategory = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Please send a valid ID." });
    }

    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name || existingCategory.name,
        description: description || existingCategory.description,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category successfully updated",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createCategories,
  getAllCategories,
  getCategories,
  deleteCategory,
  updateCategory,
  singleCreateCategory,
};
