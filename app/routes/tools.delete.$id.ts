import { type ActionArgs, json } from "@remix-run/node";

import { deleteTool } from "~/models/tool.server";

export async function action({ params }: ActionArgs) {
  const { id } = params;

  await deleteTool(Number(id));

  return json({ status: 200, message: "Herramienta eliminada" });
}
