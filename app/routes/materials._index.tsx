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
import { formatCurrency, formatInt } from "~/utils";

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

      <Table layout="fixed" aria-label="Lista de materiales">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>STOCK</TableColumn>
          <TableColumn>CANTIDAD INICIAL</TableColumn>
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>PRECIO UNITARIO</TableColumn>
        </TableHeader>
        <TableBody>
          {data.materialListItems.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.name}</TableCell>
              <TableCell>{formatInt(material.stock)}</TableCell>
              <TableCell>{formatInt(material.quantity)}</TableCell>
              <TableCell>{formatCurrency(material.price)}</TableCell>
              <TableCell>{formatCurrency(material.unitPrice)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
