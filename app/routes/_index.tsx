import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { requireUser } from "~/session.server";

import logo from "~/resources/logo.png";

import Layout from "./_layout";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json(user);
};

export default function Index() {
  return (
    <Layout>
      <img
        src={logo}
        alt="Camilili Design"
        className="mx-auto my-32 max-h-96 max-w-full object-contain"
      />
    </Layout>
  );
}
