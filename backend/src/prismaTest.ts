import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const createdTournament = await prisma.tournament.create({
    data: {
      name: "Test Tournament",
      theme: "Integration Check",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2025-12-01"),
    },
  });

  console.log("✅ Created tournament:", createdTournament);

  // 2️⃣ Δες αν μπορείς να τη διαβάσεις πίσω
  const tournaments = await prisma.tournament.findMany();
  console.log("📋 All tournaments in DB:", tournaments);
}

main()
  .then(() => {
    console.log("🎉 Prisma test completed successfully!");
  })
  .catch((e) => {
    console.error("❌ Prisma test failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
