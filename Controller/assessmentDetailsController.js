import { prisma } from "../libs/prisma.js";

// post // save assessment details
export const saveAssessmentDetails = async (req, res) => {
  try {
    const { assessment_id, answers } = req.body;

    if (
      !assessment_id ||
      !answers ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "assessment_id and answers array are required",
      });
    }

    const assessmentExists = await prisma.assessments.findUnique({
      where: { id: Number(assessment_id) },
    });

    if (!assessmentExists) {
      return res.status(404).json({
        success: false,
        message: `Assessment ID ${assessment_id} not found`,
      });
    }

    const questionIds = answers
      .map((a) => (a.question_id ? Number(a.question_id) : null))
      .filter((id) => id !== null);

    if (questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question_ids provided in the answers array",
      });
    }

    const existingQuestions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      select: { id: true, category_id: true },
    });

    const existingIds = existingQuestions.map((q) => q.id);
    const invalidIds = questionIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `These question_ids do not exist: ${invalidIds.join(",")}`,
      });
    }

    const questionMap = {};
    existingQuestions.forEach((q) => {
      questionMap[q.id] = q.category_id;
    });

    const dataToInsert = answers.map((item) => ({
      client_id: Number(assessment_id),
      question_id: Number(item.question_id),
      category_id: questionMap[Number(item.question_id)],
      answer: String(item.answer || ""),
      concern_level: Number(item.concern_level || 0),
      notes: item.notes || "",
    }));

    const result = await prisma.assessment_details.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    return res.status(200).json({
      success: true,
      message: `${result.count} records saved successfully!`,
      count: result.count,
    });
  } catch (error) {
    console.error("SAVE_DETAILS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get All user assessments details
export const getAllAssessments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [details, totalItems] = await prisma.$transaction([
      prisma.assessment_details.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          question: {
            select: { question: true },
          },
          assessment: true, 
        },
        orderBy: { id: "desc" },
      }),
      prisma.assessment_details.count(),
    ]);

    const formattedData = details.map((item) => ({
      id: item.id,
      user_name: item.assessment?.client_name || "N/A",
      user_email: item.assessment?.email_address || "N/A",
      phone: item.assessment?.phone || "N/A",
      address: item.assessment?.address || "N/A",
      zip_code: item.assessment?.zip_code || "N/A",

      category_name: item.category?.name || "General",
      question_text: item.question?.question || "N/A",
      answer: item.answer || "No Answer",
      score: item.score || 0,
      notes: item.notes || "No Notes",
      created_at: item.assessment?.createdAt, 
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
    console.error("PRISMA_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Database fetching error",
    });
  }
};

// update assessment
const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      client_name,
      email_address,
      phone,
      state,
      zip_code,
      address,
      category_id,
      answer,
      concern_level,
      notes,
    } = req.body;

    const updatedData = {
      "assessment.client_name": client_name,
      "assessment.email_address": email_address,
      "assessment.phone": phone,
      "assessment.state": state,
      "assessment.zip_code": zip_code,
      "assessment.address": address,
      "assessment.concern_level": concern_level,
      "assessment.notes": notes,
      category_id: category_id, // ✅ FIXED
      answer: answer,
    };

    const result = await AssessmentLog.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true },
    )
      .populate("category")
      .populate("assessment.user");

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

// delete assessment detail by id
export const deleteAssessmentDetail = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.assessment_details.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Assessment detail deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete or record not found",
    });
  }
};

export default {
  saveAssessmentDetails,
  getAllAssessments,
  deleteAssessmentDetail,
  updateAssessment,
};
