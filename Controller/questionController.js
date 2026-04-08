import { prisma } from "../libs/prisma.js";

// create-Question //
export const createQuestion = async (req, res) => {
  try {
    const { question, category_id } = req.body;
    const catId = Number(category_id);

    if (!question || !catId) {
      return res.status(400).json({
        success: false,
        message: "Question text and Category ID are required!",
      });
    }

    const categoryExists = await prisma.categories.findUnique({
      where: { id: catId },
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: `Category ID ${catId} does not exist. Please create category first or use a valid ID.`,
      });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question: question,
        category_id: catId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Success! Question created.",
      data: newQuestion,
    });
  } catch (error) {
    console.error("CreateQuestion Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database error during question creation",
      error: error.message,
    });
  }
};

// get-Question //
export const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID. Please provide a numeric category ID.",
      });
    }

    const categoryData = await prisma.categories.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        questions: true,
      },
    });

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found. Make sure to insert data first!`,
      });
    }

    return res.status(200).json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    console.error("PRISMA ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error_debug: error.message,
    });
  }
};

// get All user //
// controllers/question.controller.js

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: true,
      },
    });

    const formatted = questions.map(q => ({
      id: q.id,
      question: q.question,
      category_id: q.category_id,
      category_name: q.category.name
    }));

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: formatted,
    });
  } catch (error) {
    console.error("GetAllQuestions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

// Questions-category //
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format. Please provide a number.",
      });
    }

    const questions = await prisma.question.findMany({
      where: {
        category_id: categoryId,
      },
      include: {
        category: true,
      },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category ID ${categoryId} ke liye koi sawal nahi mila.`,
        data: [],
      });
    }

    const formattedData = questions.map((q) => ({
      id: q.id,
      question: q.question,
      category_id: q.category_id,
      category_name: q.category?.name || "Unknown",
    }));

    return res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error_debug: error.message,
    });
  }
};

// delete- Question //
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    await prisma.$transaction([
      prisma.assessment_details.deleteMany({
        where: { question_id: questionId },
      }),
      prisma.question.delete({
        where: { id: questionId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Question and all related answers deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database error during deletion",
      error_debug: error.message,
    });
  }
};

export default {
  createQuestion,
  getQuestion,
  getQuestionsByCategory,
  deleteQuestion,
  getAllQuestions,
};
