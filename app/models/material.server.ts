import type { User, Material } from "@prisma/client";

import { prisma } from "~/db.server";

export function getMaterialListItems({ userId }: { userId: User["id"] }) {
  return prisma.material.findMany({
    where: { userId },
    select: { id: true, name: true, price: true, stock: true },
    // orderBy: { updatedAt: "desc" },
  });
}

export function createMaterial({
  name,
  price,
  unitPrice,
  stock,
  userId,
}: Pick<Material, "name" | "price" | "unitPrice" | "stock"> & {
  userId: User["id"];
}) {
  return prisma.material.create({
    data: {
      name,
      price,
      unitPrice,
      stock,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}