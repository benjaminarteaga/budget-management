import { type ActionArgs, json } from "@remix-run/node";

import { deleteUser } from "~/models/user.server";

export async function action({ params }: ActionArgs) {
  const { id } = params;

  await deleteUser(Number(id));

  return json({ status: 200, message: "Usuario eliminado" });
}
