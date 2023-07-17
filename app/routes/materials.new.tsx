import { Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createMaterial } from "~/models/material.server";
import { requireUserId } from "~/session.server";
import type { ActionArgs } from "@remix-run/node";
import { useState } from "react";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const price = +(formData.get("price") as string);
  const stock = +(formData.get("stock") as string);
  const unitPrice = +(formData.get("unitPrice") as string);

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, title: "Nombre es requerido" } },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || price <= 0) {
    return json(
      { errors: { body: null, title: "Precio es requerido" } },
      { status: 400 }
    );
  }

  if (typeof stock !== "number" || stock <= 0) {
    return json(
      { errors: { body: null, title: "Cantidad es requerido" } },
      { status: 400 }
    );
  }

  if (typeof unitPrice !== "number" || unitPrice <= 0) {
    return json(
      { errors: { body: null, title: "Precio unitario es requerido" } },
      { status: 400 }
    );
  }

  const material = await createMaterial({
    name,
    price,
    unitPrice,
    stock,
    userId,
  });

  return redirect("/materials");
}

export default function NewMaterialPage() {
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);

  return (
    <>
      <div className="card mx-auto bg-slate-50">
        <div className="card-body">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-semibold">Nuevo material</h1>
              {/* <p className="text-sm">Sign in to access your account</p> */}
            </div>
            <Form method="post" className="form-group">
              <div className="form-field">
                <label className="form-label">Nombre</label>

                <input
                  placeholder="Hojas"
                  type="text"
                  className="input max-w-full"
                  name="name"
                />
                {/* <label className="form-label">
                  <span className="form-label-alt">
                    Please enter a valid email.
                  </span>
                </label> */}
              </div>

              <div className="form-field">
                <label className="form-label">Cantidad</label>
                <div className="form-control">
                  <input
                    placeholder="0"
                    type="text"
                    className="input max-w-full"
                    name="stock"
                    onChange={(e) => setStock(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Precio</label>
                <div className="form-control">
                  <input
                    placeholder="0000"
                    type="text"
                    className="input max-w-full"
                    name="price"
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Precio Unitario</label>
                <div className="form-control">
                  <input
                    placeholder="0000"
                    type="text"
                    className="input max-w-full"
                    name="unitPrice"
                    value={price / stock}
                    readOnly
                  />
                </div>
              </div>

              {/* <div className="form-field">
                <label className="form-label">Tipo</label>
                <div className="form-control">
                  <select className="select">
                    <option>Unidad</option>
                    <option>Paquete</option>
                  </select>
                </div>
              </div> */}

              <div className="form-field pt-5">
                <div className="form-control justify-between">
                  <button type="submit" className="btn-success btn w-full">
                    Guardar material
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>

      {/* <div className="mx-auto max-w-xl">
        <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded-lg bg-slate-200 shadow-lg">
          <div className="flex-auto p-5 lg:p-10">
            <Form method="post">
              <div className="relative mb-3 mt-8 w-full">
                <label className="mb-2 block text-sm font-bold uppercase text-slate-600">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  className="w-full rounded border-0 bg-white px-3 py-3 text-sm text-slate-600 placeholder-slate-300 shadow transition-all duration-150 ease-linear focus:outline-none focus:ring"
                />
              </div>
              <div className="relative mb-3 mt-8 w-full">
                <label className="mb-2 block text-sm font-bold uppercase text-slate-600">
                  Precio
                </label>
                <input
                  type="text"
                  name="price"
                  placeholder="Precio"
                  className="w-full rounded border-0 bg-white px-3 py-3 text-sm text-slate-600 placeholder-slate-300 shadow transition-all duration-150 ease-linear focus:outline-none focus:ring"
                />
              </div>
              <div className="relative mb-3 mt-8 w-full">
                <label className="mb-2 block text-sm font-bold uppercase text-slate-600">
                  Stock
                </label>
                <input
                  type="text"
                  name="stock"
                  placeholder="Stock"
                  className="w-full rounded border-0 bg-white px-3 py-3 text-sm text-slate-600 placeholder-slate-300 shadow transition-all duration-150 ease-linear focus:outline-none focus:ring"
                />
              </div>

              <div className="relative mb-3 mt-8 w-full">
                <button
                  className="mb-1 mr-1 rounded-full bg-green-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-green-600"
                  type="submit"
                >
                  Guardar
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div> */}
    </>
  );
}
