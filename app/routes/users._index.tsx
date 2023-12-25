import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

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

import { PlusCircleIcon } from "@heroicons/react/24/solid";

import { requireUserId } from "~/session.server";

import { getUserListItems } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const userListItems = await getUserListItems();

  return json({ userListItems });
};

export default function UsersIndexPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

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
          Nuevo usuario
        </Button>
      </Link>

      <Spacer y={4} />

      <Table layout="fixed" aria-label="Lista de materiales">
        <TableHeader>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>FECHA DE CREACION</TableColumn>
        </TableHeader>
        <TableBody>
          {data.userListItems.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("es-CL").format(
                  new Date(user.createdAt)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
