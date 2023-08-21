import type { LoaderArgs } from "@remix-run/server-runtime";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { requireUserId } from "~/session.server";
import { getMaterialListItems } from "~/models/material.server";
import { json } from "@remix-run/node";
import {
  Button,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

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
      <Link to="new">
        <Button
          color="success"
          disableRipple
          startContent={<PlusCircleIcon className="h-6 w-6" />}
          variant="shadow"
          className="text-white"
        >
          Nuevo material
        </Button>
      </Link>

      <Spacer y={4} />

      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>STOCK</TableColumn>
        </TableHeader>
        <TableBody>
          {data.materialListItems.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.name}</TableCell>
              <TableCell>{material.price}</TableCell>
              <TableCell>{material.stock}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
