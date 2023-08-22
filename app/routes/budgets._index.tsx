import type { LoaderArgs } from "@remix-run/node";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
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
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getBudgetListItems } from "~/models/budget.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const budgetListItems = await getBudgetListItems({ userId });

  return json({ budgetListItems });
};

export default function BudgetIndexPage() {
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
          Nuevo presupuesto
        </Button>
      </Link>

      <Spacer y={4} />

      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>MATERIALES</TableColumn>
          <TableColumn>CANTIDAD</TableColumn>
          <TableColumn>DETALLE</TableColumn>
        </TableHeader>
        <TableBody>
          {data.budgetListItems.map((budget) => {
            const { id, name, materials } = budget;

            const materialsArray = materials.map((material) => {
              return {
                name: material.material.name,
                quantity: material.quantity,
              };
            });

            return (
              <TableRow key={id}>
                <TableCell rowSpan={materials.length}>{name}</TableCell>
                <TableCell>
                  {materialsArray.map(({ name }) => (
                    <>
                      {name}
                      <br />
                    </>
                  ))}
                </TableCell>
                <TableCell>
                  {materialsArray.map(({ quantity }) => (
                    <>
                      {quantity}
                      <br />
                    </>
                  ))}
                </TableCell>
                <TableCell>
                  <Link to={`/budgets/${id}`}>
                    <Button color="secondary" size="sm">
                      Ver detalle
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
