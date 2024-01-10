import { type ActionArgs, json } from "@remix-run/node";

import { updateStatusBudget } from "~/models/budget.server";

export async function action({ params, request }: ActionArgs) {
  const { id } = params;

  const { statusId }: { statusId: number } = await request.json();

  await updateStatusBudget(Number(id), statusId);

  return json({ status: 200, message: "Estado del presupuesto actualizado" });
}
