import { prisma } from "../libs/prisma.js";

// create-Question //

export const createQuestion = async (req, res) => {
  try {
    const { question, category_id } = req.body;
    const catId = parseInt(category_id);

    if (!question || isNaN(catId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Question text and Category ID are required!",
      });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question: question,

        category: {
          connect: { id: catId },
        },
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Success! Question created.",
      data: newQuestion,
    });
  } catch (error) {
    console.error("FULL PRISMA ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
// export const getAllQuestions = async (req, res) => {
//   try {
//     const questions = await prisma.question.findMany({
//       include: {
//         category: true,
//       },
//     });

//     const formatted = questions.map((q) => ({
//       id: q.id,
//       question: q.question,
//       category_id: q.category_id,
//       category_name: q.category.name,
//     }));

//     return res.status(200).json({
//       success: true,
//       count: questions.length,
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("GetAllQuestions Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching questions",
//       error: error.message,
//     });
//   }
// };

export const getAllQuestions = async (req, res) => {
  try {
    // 1. Pagination Params (Frontend se page aur limit lena)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // 2. Transaction (Data aur Total Count ek saath fetch karna)
    const [questions, totalQuestions] = await prisma.$transaction([
      prisma.question.findMany({
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { id: "asc" },
      }),
      prisma.question.count(),
    ]);

    // 3. Data Formatting
    const formatted = questions.map((q) => ({
      id: q.id,
      question: q.question,
      category_id: q.category_id,
      category_name: q.category?.name || "Uncategorized", // Safe check
    }));

    // 4. Standard Response Structure (Jo table expect kar raha hai)
    return res.status(200).json({
      success: true,
      data: formatted, // Frontend categories ki tarah yahan 'data' check karega
      pagination: {
        totalItems: totalQuestions,
        totalPages: Math.ceil(totalQuestions / limit) || 1,
        currentPage: page,
        limit,
      },
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

    const questionId = Number(id);

    if (isNaN(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format provided",
      });
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: `Question with ID ${questionId} not found in database`,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.assessment_details.deleteMany({
        where: { question_id: questionId },
      });

      await tx.question.delete({
        where: { id: questionId },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Question and all related data deleted successfully",
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

// get-Questions //
export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: true,
      },
    });

    const formatted = questions.map((q) => ({
      id: q.id,
      text: q.text || q.question || q.question_text || "",
      category_id: q.categoryId,
      category_name: q.category?.name || "NO CATEGORY",
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions" });
  }
};
// update-question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, categoryId } = req.body;

    const updated = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        question: text,
        category_id: categoryId ? Number(categoryId) : null,
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error: Update failed",
    });
  }
};

export default {
  createQuestion,
  getQuestion,
  getQuestionsByCategory,
  deleteQuestion,
  getAllQuestions,
  getQuestions,
  updateQuestion,
};
