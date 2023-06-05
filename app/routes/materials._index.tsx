import type { LoaderArgs } from "@remix-run/server-runtime";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { requireUserId } from "~/session.server";
import { getMaterialListItems } from "~/models/material.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });
  console.log({ materialListItems });

  return json({ materialListItems });
};

export default function MaterialIndexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Link to="new" className="btn-success btn-rounded btn">
        <PlusCircleIcon className="h-6 w-6" /> Nuevo material
      </Link>

      <div className="my-6 flex w-full overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.materialListItems.map((material) => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.price}</td>
                <td>{material.stock}</td>
              </tr>
            ))}
            <tr>
              <th>1</th>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
