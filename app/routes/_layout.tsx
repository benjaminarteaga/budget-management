import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useUser } from "~/utils";
import logo from "~/resources/logo.png";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  return (
    <>
      <header className="navbar">
        <div className="navbar-start">
          {/* <a className="navbar-item">Ripple UI</a> */}
          <Link
            to="/"
            // className="text-white-500 flex text-3xl font-bold hover:text-gray-100"
            className="navbar-item"
          >
            <img src={logo} alt="Camilili Design" className="max-h-11" />
          </Link>
        </div>
        <div className="navbar-center">
          {/* <a className="navbar-item">Home</a>
          <a className="navbar-item">About</a>
          <a className="navbar-item">Contact</a> */}
          <Link
            to="/materials"
            // className="text-white-400 mr-4 hover:text-gray-100"
            className="navbar-item"
          >
            Materiales
          </Link>
          <Link
            to="/budgets"
            // className="text-white-400 mr-4 hover:text-gray-100"
            className="navbar-item"
          >
            Presupuestos
          </Link>
        </div>
        <div className="navbar-end">
          {/* <a className="navbar-item">Home</a> */}
          <div className="avatar-ring avatar avatar-md">
            <div className="dropdown-container">
              <div className="dropdown">
                <label
                  className="btn-ghost btn flex cursor-pointer px-0"
                  tabIndex={0}
                >
                  <img src="https://i.pravatar.cc/150?img=37" alt="avatar" />
                </label>
                <div className="dropdown-menu-bottom-left dropdown-menu">
                  {/* <a className="dropdown-item text-sm">Logout</a> */}
                  <form action="/logout" method="post">
                    <button type="submit" className="dropdown-item text-sm">
                      Logout
                    </button>
                  </form>
                  {/* <a tabIndex="-1" className="dropdown-item text-sm">Account settings</a>
                  <a tabIndex="-1" className="dropdown-item text-sm">Subscriptions</a> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* <div className="flex h-full min-h-screen flex-col">
        <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <Link
            to="/"
            className="text-white-500 flex text-3xl font-bold hover:text-gray-100"
          >
            <img src={logo} alt="Camilili Design" className="max-h-11" />
          </Link>

          <div className="flex items-center">
            <Link
              to="/articles"
              className="text-white-400 mr-4 hover:text-gray-100"
            >
              Artículos
            </Link>
            <Link
              to="/budgets"
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
      </div> */}
    </>
  );
}
