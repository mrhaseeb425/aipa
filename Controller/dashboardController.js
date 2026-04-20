import db from "../db/connection.js";
import { prisma } from "../libs/prisma.js";


// Dashboard statistics endpoint
export const getDashboardStats = async (req, res) => {
  try {
    const [
      userCount,
      categoryCount,
      questionCount,
      assessmentCount,
      businessCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.categories.count(),
      prisma.question.count(),
      prisma.assessments.count(),
      prisma.businesses.count(),
    ]);

    res.json({
      users: userCount,
      categories: categoryCount,
      questions: questionCount,
      assessments: assessmentCount,
      businesses: businessCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
    getDashboardStats,
}