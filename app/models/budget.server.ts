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
      status: true,
    },
  });
}

export function getBudgetItem({
  userId,
  id,
}: {
  userId: User["id"];
  id?: string;
}) {
  if (id === undefined) {
    throw new Error("El campo 'id' es obligatorio.");
  }

  return prisma.budget.findUnique({
    where: {
      id: +id,
    },
    include: {
      materials: {
        include: {
          material: true,
        },
      },
      status: true,
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

  const decrementMaterials = materials.map((m) =>
    prisma.material.update({
      where: {
        id: +m.id,
      },
      data: {
        stock: {
          decrement: +m.quantity,
        },
      },
    })
  );

  const createBudget = prisma.budget.create({
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

  return prisma.$transaction([...decrementMaterials, createBudget]);
}
