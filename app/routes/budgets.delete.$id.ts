import { type ActionArgs, json } from "@remix-run/node";
import { deleteBudget } from "~/models/budget.server";

export async function action({ params }: ActionArgs) {
  const { id } = params;

  await deleteBudget(Number(id));

  return json({ status: 200, message: "Presupuesto eliminado" });
}
