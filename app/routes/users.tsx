import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { requireUserId } from "~/session.server";

import Layout from "./_layout";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  return json({ userId });
};

export default function UsersPage() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </Layout>
  );
}
