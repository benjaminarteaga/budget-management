import type { User, Material } from "@prisma/client";

import { prisma } from "~/db.server";

export function getMaterialListItems({ userId }: { userId: User["id"] }) {
  return prisma.material.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
}

export function getMaterialItem({
  userId,
  id,
}: {
  userId: User["id"];
  id?: string;
}) {
  if (id === undefined) {
    throw new Error("El campo 'id' es obligatorio.");
  }

  return prisma.material.findUnique({
    where: {
      id: +id,
    },
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

export function updateMaterial({
  id,
  name,
  stock,
  quantity,
  price,
  unitPrice,
  userId,
}: Pick<
  Material,
  "id" | "name" | "stock" | "quantity" | "price" | "unitPrice"
> & {
  userId: User["id"];
}) {
  return prisma.material.update({
    where: {
      id,
    },
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

export async function deleteMaterial(id: number) {
  await prisma.material.delete({
    where: {
      id,
    },
  });
}
