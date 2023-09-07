import type { LoaderArgs } from "@remix-run/node";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Chip,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useState } from "react";
import BudgetDetail from "~/components/BudgetDetail";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { getBudgetListItems, type getBudgetItem } from "~/models/budget.server";
import type { Prisma } from "@prisma/client";

export type BudgetWithRelations = Prisma.PromiseReturnType<
  typeof getBudgetItem
>;

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const budgetListItems = await getBudgetListItems({ userId });

  return typedjson(budgetListItems);
};

export default function BudgetIndexPage() {
  const data = useTypedLoaderData<typeof loader>();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [detail, setDetail] = useState<BudgetWithRelations>();

  const handleShowDetail = (id: number) => {
    if (isOpen) {
      setIsOpen(false);
      setDetail(null);
      return;
    }

    setIsOpen(true);
    setDetail(data.find((budget) => budget.id === id));
  };

  return (
    <div className="flex gap-6">
      <div className="grow">
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
            <TableColumn>ESTADO</TableColumn>
            <TableColumn>DETALLE</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((budget) => {
              const { id, name, materials } = budget;

              const materialsArray = materials.map((material) => {
                return {
                  name: material.material.name,
                  quantity: material.quantity,
                };
              });

              const chipColor = STATUS_COLOR[budget.status.id - 1];

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
                    <Chip radius="full" variant="flat" color={chipColor}>
                      {budget.status.name}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => handleShowDetail(id)}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className={isOpen ? "show" : "hide"}>
        {detail && <BudgetDetail data={detail} />}
      </div>
    </div>
  );
}

const STATUS_COLOR: Status[] = ["primary", "success", "danger"];

type Status = "primary" | "success" | "danger";
