import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import Layout from "./_layout";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  return json({ userId });
};

export default function MaterialsPage() {
  const data = useLoaderData<typeof loader>();
  // const user = useUser();

  return (
    <Layout>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </Layout>
  );
}