import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

// import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import Layout from "./_layout";

export default function NewBudgetPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded-lg bg-slate-200 shadow-lg">
        <div className="flex-auto p-5 lg:p-10">
          <Form method="post">
            <div className="relative mb-3 mt-8 w-full">
              <label className="mb-2 block text-sm font-bold uppercase text-slate-600">
                Nombre del presupuesto
              </label>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full rounded border-0 bg-white px-3 py-3 text-sm text-slate-600 placeholder-slate-300 shadow transition-all duration-150 ease-linear focus:outline-none focus:ring"
              />
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
