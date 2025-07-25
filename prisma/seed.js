const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create or update user safely using upsert
  await prisma.user.upsert({
    where: { email: "swathi@example.com" },
    update: {}, // If user already exists, do nothing
    create: {
      name: "Swathi",
      email: "swathi@example.com",
    }
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
