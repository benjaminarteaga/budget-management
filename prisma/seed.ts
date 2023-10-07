import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createBudget } from "~/models/budget.server";

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

  await prisma.budgetStatus.createMany({
    data: [
      {
        name: "Por confirmar",
      },
      {
        name: "Confirmado",
      },
      {
        name: "Rechazado",
      },
    ],
  });

  await prisma.material.createMany({
    data: [
      {
        name: "Hojas",
        stock: 500,
        quantity: 500,
        price: 4500,
        unitPrice: 9,
        userId: user.id,
      },
      {
        name: "Tapas",
        stock: 20,
        quantity: 20,
        price: 10000,
        unitPrice: 500,
        userId: user.id,
      },
      {
        name: "Resortes",
        stock: 20,
        quantity: 20,
        price: 2800,
        unitPrice: 10,
        userId: user.id,
      },
    ],
  });

  await createBudget({
    name: "Presupuesto de prueba",
    materials: [
      {
        id: 1,
        quantity: "50",
      },
      {
        id: 2,
        quantity: "2",
      },
      {
        id: 3,
        quantity: "1",
      },
    ],
    salesPrice: 12000,
    userId: 1,
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
