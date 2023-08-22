import type { User, Material } from "@prisma/client";

import { prisma } from "~/db.server";

export function getMaterialListItems({ userId }: { userId: User["id"] }) {
  return prisma.material.findMany({
    where: { userId },
    // select: { id: true, name: true, price: true, stock: true },
    // orderBy: { updatedAt: "desc" },
  });
}

export function createMaterial({
  name,
  stock,
  quantity,
  price,
  unitPrice,
  userId,
}: Pick<Material, "name" | "stock" | "quantity" | "price" | "unitPrice"> & {
  userId: User["id"];
}) {
  return prisma.material.create({
    data: {
      name,
      stock,
      quantity,
      price,
      unitPrice,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
