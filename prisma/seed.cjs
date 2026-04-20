const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  try {
    const adminEmail = "admin@aipe.com";

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      console.log("Admin missing! Re-creating Admin...");
      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: "admin123",
          role: "ADMIN",
          gender: "Male",
          phone: 1234567890,
        },
      });
      console.log("Admin Restored Successfully.");
    } else {
      console.log("ℹAdmin already exists. No need to create.");
    }

    await prisma.user.deleteMany({
      where: {
        NOT: { email: adminEmail },
      },
    });
    console.log("All other users cleared.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
