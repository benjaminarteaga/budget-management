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
    where: {
      userId: +userId,
      statusId: {
        not: 2,
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

export function getSalesListItems({ userId }: { userId: User["id"] }) {
  return prisma.budget.findMany({
    include: {
      materials: {
        include: {
          material: true,
        },
      },
      status: true,
    },
    where: {
      userId: +userId,
      statusId: 2,
    },
    orderBy: {
      id: "desc",
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
  salesPrice,
  userId,
}: Pick<Budget, "name"> & {
  materials: {
    id: number;
    quantity: string;
  }[];
  salesPrice: number;
  userId: User["id"];
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

  const saveBudget = prisma.budget.create({
    data: {
      name,
      salesPrice,
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

  return prisma.$transaction([...decrementMaterials, saveBudget]);
}

export function updateBudget({
  id,
  name,
  oldMaterials,
  materials,
  salesPrice,
  userId,
}: Pick<Budget, "id" | "name"> & {
  oldMaterials: {
    id: number;
    quantity: string;
  }[];
  materials: {
    id: number;
    quantity: string;
  }[];
  salesPrice: number;
  userId: User["id"];
}) {
  const removeMaterials = prisma.materialsOnBudgets.deleteMany({
    where: {
      budgetId: id,
    },
  });

  const materialsArray = materials.map((material) => ({
    quantity: Number(material.quantity),
    assignedAt: new Date(),
    material: {
      connect: {
        id: Number(material.id),
      },
    },
  }));

  const filteredOldMaterials = materials.filter((m) =>
    oldMaterials.some((oldMaterial) => m.id === oldMaterial.id)
  );

  const decrementMaterials = filteredOldMaterials.map((m) => {
    const old = oldMaterials.find((oldMaterial) => m.id === oldMaterial.id);
    const quantityCalculated = Number(m.quantity) - Number(old?.quantity);

    return prisma.material.update({
      where: {
        id: Number(m.id),
      },
      data: {
        stock: {
          decrement: quantityCalculated,
        },
      },
    });
  });

  const updateBudget = prisma.budget.update({
    where: {
      id,
    },
    data: {
      name,
      salesPrice,
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

  return prisma.$transaction([
    removeMaterials,
    ...decrementMaterials,
    updateBudget,
  ]);
}

export async function deleteBudget(id: number) {
  const getMaterials = await prisma.materialsOnBudgets.findMany({
    where: {
      budgetId: id,
    },
  });

  const deleteBudget = prisma.budget.delete({
    where: {
      id,
    },
  });

  const restoreMaterialsQuantity = getMaterials.map((material) => {
    return prisma.material.update({
      where: {
        id: material.materialId,
      },
      data: {
        stock: {
          increment: material.quantity,
        },
      },
    });
  });

  return prisma.$transaction([deleteBudget, ...restoreMaterialsQuantity]);
}

export function getBudgetStatusList() {
  return prisma.budgetStatus.findMany();
}

export async function updateStatusBudget(id: number, statusId: number) {
  return prisma.budget.update({
    where: {
      id,
    },
    data: {
      statusId,
    },
  });
}
