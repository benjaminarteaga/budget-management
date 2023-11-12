import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { requireUserId } from "~/session.server";

import Layout from "./_layout";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  return userId;
};

export default function BudgetPage() {
  return (
    <Layout>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </Layout>
  );
}
