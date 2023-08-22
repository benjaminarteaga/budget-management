import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "ba@gmail.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("123456789", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.material.create({
    data: {
      name: "Hojas",
      price: 4500,
      unitPrice: 9,
      stock: 500,
      userId: user.id,
    },
  });

  await prisma.material.create({
    data: {
      name: "Tapas",
      price: 10000,
      unitPrice: 500,
      stock: 20,
      userId: user.id,
    },
  });

  await prisma.material.create({
    data: {
      name: "Resortes",
      price: 2800,
      unitPrice: 10,
      stock: 280,
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
