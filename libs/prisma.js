import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(" Prisma connected successfully");
  } catch (err) {
    console.error(" Prisma connection error:", err);
    process.exit(1);
  }
};