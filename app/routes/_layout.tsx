import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useUser } from "~/utils";
import logo from "~/resources/logo.png";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <Link
          to="/"
          className="text-white-500 flex text-3xl font-bold hover:text-gray-100"
        >
          <img src={logo} alt="Camilili Design" className="max-h-11" />
        </Link>

        <div className="flex items-center">
          <Link
            to="/article"
            className="text-white-400 mr-4 hover:text-gray-100"
          >
            Artículos
          </Link>
          <Link
            to="/budget"
            className="text-white-400 mr-4 hover:text-gray-100"
          >
            Presupuestos
          </Link>
        </div>
        <div className="flex items-center">
          <p className="mr-4 text-gray-400">{user.email}</p>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-full bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="flex h-full">{children}</main>
    </div>
  );
}
