import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/session.server";
import Layout from "./_layout";

import logo from "~/resources/logo.png";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json(user);
};

export default function Index() {
  return (
    <Layout>
      <div className="m-auto">
        <img
          src={logo}
          alt="Camilili Design"
          className="max-h-96 max-w-full object-contain"
        />
      </div>
    </Layout>
  );
}
