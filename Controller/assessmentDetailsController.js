import { prisma } from "../libs/prisma.js";

// post //
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

    const questionIds = answers.map((a) => Number(a.question_id));

    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, category_id: true },
    });

    const existingIds = existingQuestions.map((q) => q.id);
    const invalidIds = questionIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `These question_ids do not exist in database: ${invalidIds.join(",")}`,
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
    console.error("SAVE_DETAILS_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save assessment details",
      error: error.message,
    });
  }
};

// get All user
export const getAllAssessments = async (req, res) => {
  try {
    const allData = await prisma.assessment_details.findMany({
      include: {
        assessment: true,
        question: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (error) {
    console.log("FULL ERROR:", error);

    const backupData = await prisma.assessment_details.findMany();

    return res.status(200).json({
      success: true,
      message: "Showing data without relations due to consistency error",
      data: backupData,
    });
  }
};

export default {
  saveAssessmentDetails,
  getAllAssessments,
};
