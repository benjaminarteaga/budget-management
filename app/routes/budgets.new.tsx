import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

// import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import Layout from "./_layout";
import Autocomplete from "~/components/Autocomplete";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { getMaterialListItems } from "~/models/material.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });

  return json(materialListItems);
};

export default function NewBudgetPage() {
  const data = useLoaderData<typeof loader>();

  const [inputsAutocomplete, setInputsAutocomplete] = useState<any[]>([]);

  const handleNewMaterial = () => {
    const random = Math.random().toString(6);

    setInputsAutocomplete([
      ...inputsAutocomplete,
      <div className="relative mb-3 mt-8 w-full" key={random} id={random}>
        <hr />
        {/* <label className="mb-2 block text-sm font-bold uppercase text-slate-600">
          
        </label> */}
        <Autocomplete data={data} />
        <input type="text" />
      </div>,
    ]);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded-lg bg-slate-100 shadow-lg">
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

            <h3>Materiales</h3>

            {inputsAutocomplete.map((input) => input)}

            <div className="relative mb-3 mt-8 w-full">
              <button
                type="button"
                className="btn-circle btn-solid-success btn"
                onClick={handleNewMaterial}
              >
                <PlusIcon />
              </button>
              <label>Agregar material</label>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
