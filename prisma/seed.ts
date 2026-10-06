import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  const ada = await prisma.user.create({
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      notes: {
        create: [
          {
            title: "Analytical Engine notes",
            content: "The engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.",
            published: true,
          },
          {
            title: "Draft",
            content: "Unpublished sketch of a calculation method.",
            published: false,
          },
        ],
      },
    },
  });

  const grace = await prisma.user.create({
    data: {
      name: "Grace Hopper",
      email: "grace@example.com",
      notes: {
        create: [
          {
            title: "Debugging",
            content: "A moth was removed from Relay 70, Panel F.",
            published: true,
          },
        ],
      },
    },
  });

  console.log(`Seeded users: ${ada.email}, ${grace.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
