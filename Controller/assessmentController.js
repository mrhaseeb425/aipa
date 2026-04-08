import { prisma } from "../libs/prisma.js";

// 1 Create Assessment
// export const createAssessment = async (req, res) => {
//   try {
//     const {
//       client_name,
//       email_address,
//       phone,
//       state,
//       zip_code,
//       address,
//       user_id,
//       category_ids,
//     } = req.body;

//     if (
//       !client_name ||
//       !user_id ||
//       !category_ids ||
//       category_ids.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing fields or no categories selected",
//       });
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const assessment = await tx.assessments.create({
//         data: {
//           client_name,
//           email_address: email_address.toLowerCase().trim(),
//           phone: Number(phone),
//           state,
//           zip_code: Number(zip_code),
//           address,
//           user_id: Number(user_id),
//         },
//       });

//       const linkData = category_ids.map((catId) => ({
//         assessments_id: assessment.id,
//         category_id: Number(catId),
//       }));

//       await tx.assessment_categories.createMany({
//         data: linkData,
//       });

//       return assessment;
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Assessment successfully created with categories!",
//       data: result,
//     });
//   } catch (error) {
//     console.error("CreateAssessment Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Database error",
//       error: error.message,
//     });
//   }
// };

export const createAssessment = async (req, res) => {
  try {
    const {
      client_name,
      email_address,
      phone,
      state,
      zip_code,
      address,
      category_ids,
    } = req.body;

    // Body se user_id nikalne ki bajaye req.user se lein (Token se)
    const userIdFromToken = req.user.id;

    if (
      !client_name ||
      !userIdFromToken ||
      !category_ids ||
      category_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing fields or no categories selected",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Assessment create karein
      const assessment = await tx.assessments.create({
        data: {
          client_name,
          email_address: email_address?.toLowerCase().trim(),
          phone: Number(phone),
          state,
          zip_code: Number(zip_code),
          address,
          user_id: Number(userIdFromToken), // Token wali ID yahan use hogi
        },
      });

      // 2. Categories link karein
      const linkData = category_ids.map((catId) => ({
        assessments_id: assessment.id,
        category_id: Number(catId),
      }));

      await tx.assessment_categories.createMany({
        data: linkData,
      });

      return assessment;
    });

    return res.status(201).json({
      success: true,
      message: "Assessment successfully created with categories!",
      data: result,
    });
  } catch (error) {
    console.error("CreateAssessment Error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category_id. Please check if categories exist in the database.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

//Fill Assessment Answers
export const fillAssessmentAnswers = async (req, res) => {
  try {
    const { assessment_id } = req.body;
    let answers = req.body.answers;

    const fullBaseUrl = `${req.protocol}://${req.get("host")}`;

    if (answers && !Array.isArray(answers)) {
      answers = Object.values(answers);
    }

    if (!assessment_id || !answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID and answers.* fields are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const savedDetails = [];

      for (let i = 0; i < answers.length; i++) {
        const item = answers[i];

        const qId = Number(item.question_id);
        const cId = Number(item.category_id);
        const aId = Number(assessment_id);

        const newDetail = await tx.assessment_details.upsert({
          where: {
            client_id_question_id: {
              client_id: aId,
              question_id: qId,
            },
          },
          update: {
            answer: String(item.answer || ""),
            concern_level: Number(item.concern_level || 0),
            notes: item.notes || "",
            category_id: cId,
          },
          create: {
            client_id: aId,
            question_id: qId,
            category_id: cId,
            answer: String(item.answer || ""),
            concern_level: Number(item.concern_level || 0),
            notes: item.notes || "",
          },
        });

        const targetKey = `answers[${i}][pics]`;
        const relevantFiles = req.files
          ? req.files.filter((f) => f.fieldname === targetKey)
          : [];

        if (relevantFiles.length > 0) {
          await tx.assessment_images.deleteMany({
            where: { assessment_detail_id: newDetail.id },
          });

          const imageEntries = relevantFiles.map((file) => ({
            assessment_detail_id: newDetail.id,
            image_url: `${fullBaseUrl}/uploads/${file.filename}`,
            answer: String(item.answer || ""),
          }));

          await tx.assessment_images.createMany({
            data: imageEntries,
          });
        }
        savedDetails.push(newDetail);
      }
      return savedDetails;
    });

    return res.status(200).json({
      success: true,
      message: "Data successfully synced",
      data: result,
    });
  } catch (error) {
    console.error("Upsert Error Details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "There is an issue with the server.",
    });
  }
};

// Get Single Assessment
export const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessments = await prisma.assessments.findMany({
      where: {
        id: parseInt(id),
      },
      include: {
        details: { include: { assessment_images: true } },
        categories_links: {
          include: { category: { include: { questions: true } } },
        },
      },
      orderBy: { id: "desc" },
    });

    if (!assessments || assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No assessment found with Primary ID: ${id}`,
        data: [],
      });
    }

    const formattedData = assessments.map((assessment) => {
      const detailsMap = {};
      (assessment.details || []).forEach((d) => {
        detailsMap[Number(d.question_id)] = d;
      });

      let totalQuestions = 0;
      let answeredCount = assessment.details?.length || 0;

      const assessmentData = assessment.categories_links.map((link) => {
        const cat = link.category;
        const questions = (cat.questions || []).map((q) => {
          totalQuestions++;
          const detail = detailsMap[Number(q.id)];

          return {
            question_id: q.id,
            question: q.question,
            answer_data: detail
              ? {
                  id: detail.id,
                  answer: detail.answer,
                  concern_level: detail.concern_level,
                  notes: detail.notes,
                  images: (detail.assessment_images || []).map(
                    (img) => img.image_url,
                  ),
                }
              : null,
          };
        });

        return {
          category_id: cat.id,
          category_name: cat.name,
          questions,
        };
      });

      return {
        id: assessment.id,
        client_name: assessment.client_name,
        progress_label: `${answeredCount}/${totalQuestions}`,
        percentage:
          totalQuestions > 0
            ? Math.round((answeredCount / totalQuestions) * 100)
            : 0,
        categories: assessmentData.map((c) => c.category_name),
        assessment_details: assessmentData,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Assessment fetched successfully using Primary ID",
      data: formattedData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Assessments //
export const getAllAssessmentsWithDetails = async (req, res) => {
  try {
    const rawUserId = req.user?.id;

    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login again.",
      });
    }

    const loggedInUserId = Number(rawUserId);

    const result = await prisma.assessments.findMany({
      where: {
        user_id: loggedInUserId,
      },
      include: {
        details: true,
        categories_links: {
          include: {
            category: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedData = result.map((assessment) => {
      const selectedCategories = assessment.categories_links
        .map((cl) => cl.category?.name)
        .filter(Boolean);

      let totalQuestionsInCategories = 0;
      assessment.categories_links.forEach((cl) => {
        totalQuestionsInCategories += cl.category?.questions?.length || 0;
      });

      const answeredCount = assessment.details?.length || 0;

      const progressPercentage =
        totalQuestionsInCategories > 0
          ? Math.round((answeredCount / totalQuestionsInCategories) * 100)
          : 0;

      return {
        id: assessment.id,
        client_name: assessment.client_name,
        email: assessment.email_address,
        user_id: assessment.user_id,
        progress_label: `${answeredCount}/${totalQuestionsInCategories}`,
        percentage: progressPercentage,
        status: progressPercentage === 100 ? "Completed" : "In Process",
        categories: selectedCategories,
        createdAt: assessment.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "User-specific assessments fetched successfully",
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

//  Update Assessment
export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, email_address, phone, state, zip_code, address } =
      req.body;

    const updated = await prisma.assessments.update({
      where: { id: Number(id) },
      data: {
        client_name,
        email_address: email_address
          ? email_address.toLowerCase().trim()
          : undefined,
        phone: phone ? Number(phone) : undefined,
        zip_code: zip_code ? Number(zip_code) : undefined,
        state,
        address,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully", data: updated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Update failed", error: error.message });
  }
};

// Make Delete
export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessmentId = Number(id);

    if (isNaN(assessmentId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const existing = await prisma.assessments.findUnique({
      where: { id: assessmentId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Assessment ${id} not found`,
      });
    }

    await prisma.$transaction([
      prisma.assessment_images.deleteMany({
        where: {
          assessment_detail: {
            client_id: assessmentId,
          },
        },
      }),

      prisma.assessment_details.deleteMany({
        where: { client_id: assessmentId },
      }),

      prisma.assessment_categories.deleteMany({
        where: { assessments_id: assessmentId },
      }),

      prisma.assessments.delete({
        where: { id: assessmentId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Assessment ${id} and all related data (images, details) deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Concern level  Action-List//
export const getAssessmentReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Assessment ID is required" });
    }

    const assessment = await prisma.assessments.findUnique({
      where: { id: parseInt(id) },
      include: {
        details: {
          include: { question: true, category: true, assessment_images: true },
          orderBy: { question_id: "asc" },
        },
        categories_links: { include: { category: true } },
      },
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `No assessment found with ID: ${id}`,
      });
    }

    const uniqueCategories = [
      ...new Set(
        assessment.categories_links
          .map((cl) => cl.category?.name)
          .filter(Boolean),
      ),
    ];
    const concernCount = (assessment.details || []).filter(
      (d) => d.concern_level > 0,
    ).length;

    const categoriesMap = {};
    const actionsMap = {};

    (assessment.details || []).forEach((detail) => {
      const catId = detail.category_id;
      const catName = detail.category?.name || "Unknown";

      const questionData = {
        question_id: detail.question_id,
        question: detail.question?.question || "Question text not found",
        answer_data: {
          id: detail.id,
          answer: detail.answer || null,
          concern_level: detail.concern_level,
          is_concern: detail.concern_level > 0,
          notes: detail.notes || "",
          createdAt: detail.createdAt,
          images: (detail.assessment_images || []).map((img) => ({
            id: img.id,
            url: img.image_url,
          })),
        },
      };

      if (detail.concern_level === 0) {
        if (!categoriesMap[catId]) {
          categoriesMap[catId] = {
            category_id: catId,
            category_name: catName,
            questions: [],
          };
        }
        categoriesMap[catId].questions.push(questionData);
      } else {
        if (!actionsMap[catId]) {
          actionsMap[catId] = {
            category_id: catId,
            category_name: catName,
            questions: [],
          };
        }
        actionsMap[catId].questions.push(questionData);
      }
    });

    const formattedResponse = {
      id: assessment.id,
      client_name: assessment.client_name,
      email_address: assessment.email_address,
      phone: assessment.phone,
      state: assessment.state,
      zip_code: assessment.zip_code,
      address: assessment.address,
      createdAt: assessment.createdAt,
      action_summary: {
        points: uniqueCategories.length,
        categories: uniqueCategories,
        message: `You have ${concernCount} checklist points that have a concern level of 1 or higher`,
      },
      assessment_data: Object.values(categoriesMap),
      action_data: Object.values(actionsMap),
    };

    return res.status(200).json({
      success: true,
      message: "Assessment report fetched successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("GetAssessmentReport Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export default {
  createAssessment,
  getAssessment,
  updateAssessment,
  fillAssessmentAnswers,
  getAllAssessmentsWithDetails,
  deleteAssessment,
  getAssessmentReport,
};
