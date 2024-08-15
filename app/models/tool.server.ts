import type { User, Tool } from "@prisma/client";

import { prisma } from "~/db.server";

export function getToolListItems({ userId }: { userId: User["id"] }) {
  return prisma.tool.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
}

export function getToolItem({
  userId,
  id,
}: {
  userId: User["id"];
  id?: string;
}) {
  if (id === undefined) {
    throw new Error("El campo 'id' es obligatorio.");
  }

  return prisma.tool.findUnique({
    where: {
      id: +id,
    },
  });
}

export function createTool({
  name,
  quantity,
  unitPrice,
  totalPrice,
  userId,
}: Pick<Tool, "name" | "quantity" | "unitPrice" | "totalPrice"> & {
  userId: User["id"];
}) {
  return prisma.tool.create({
    data: {
      name,
      quantity,
      unitPrice,
      totalPrice,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateTool({
  id,
  name,
  quantity,
  unitPrice,
  totalPrice,
  userId,
}: Pick<Tool, "id" | "name" | "quantity" | "unitPrice" | "totalPrice"> & {
  userId: User["id"];
}) {
  return prisma.tool.update({
    where: {
      id,
    },
    data: {
      name,
      quantity,
      unitPrice,
      totalPrice,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function deleteTool(id: number) {
  await prisma.tool.delete({
    where: {
      id,
    },
  });
}
