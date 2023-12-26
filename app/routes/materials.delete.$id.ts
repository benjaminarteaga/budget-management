import { type ActionArgs, json } from "@remix-run/node";

import { deleteMaterial } from "~/models/material.server";

export async function action({ params }: ActionArgs) {
  const { id } = params;

  await deleteMaterial(Number(id));

  return json({ status: 200, message: "Material eliminado" });
}
