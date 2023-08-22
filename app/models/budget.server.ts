import type { User, Budget } from "@prisma/client";

import { prisma } from "~/db.server";

export function getBudgetListItems({ userId }: { userId: User["id"] }) {
  return prisma.budget.findMany({
    include: {
      materials: {
        include: {
          material: true,
        },
      },
    },
  });
}

export function createBudget({
  name,
  materials,
  userId,
}: Pick<Budget, "name"> & {
  userId: User["id"];
  materials: {
    id: FormDataEntryValue;
    quantity: FormDataEntryValue;
  }[];
}) {
  const materialsArray = materials.map((material) => ({
    quantity: +material.quantity,
    assignedAt: new Date(),
    material: {
      connect: {
        id: +material.id,
      },
    },
  }));

  return prisma.budget.create({
    data: {
      name,
      materials: {
        create: materialsArray,
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
