import type { LoaderArgs } from "@remix-run/node";
import { PencilIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
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
import { formatCurrency, formatInt } from "~/utils";
import { TrashIcon } from "@heroicons/react/24/outline";

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
      <div className="flex-[70%]">
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

        <Table
          layout="fixed"
          classNames={{ th: "text-center", td: "text-center" }}
        >
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>MATERIALES</TableColumn>
            <TableColumn>CANTIDAD</TableColumn>
            <TableColumn>COSTO</TableColumn>
            <TableColumn>PRECIO DE VENTA</TableColumn>
            <TableColumn>GANANCIA</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn>DETALLE</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((budget) => {
              const { id, name, materials, salesPrice } = budget;

              let cost = 0;

              const materialsArray = materials.map((material) => {
                cost += material.material.unitPrice * material.quantity;

                return {
                  name: material.material.name,
                  quantity: material.quantity,
                };
              });

              const chipColor = STATUS_COLOR[budget.status.id - 1];

              return (
                <TableRow key={id}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    {materialsArray.map(({ name }) => (
                      <>
                        {name}
                        <br />
                      </>
                    ))}
                  </TableCell>
                  <TableCell className="text-end">
                    {materialsArray.map(({ quantity }) => (
                      <>
                        {formatInt(quantity)}
                        <br />
                      </>
                    ))}
                  </TableCell>
                  <TableCell className="text-end">
                    {formatCurrency(cost)}
                  </TableCell>
                  <TableCell className="text-end">
                    {formatCurrency(salesPrice)}
                  </TableCell>
                  <TableCell className="text-end text-green-500">
                    {formatCurrency(salesPrice - cost)}
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

                  <TableCell>
                    <Link to={`edit/${id}`}>
                      <Button
                        isIconOnly
                        color="success"
                        size="sm"
                        className="mr-2"
                      >
                        <PencilIcon className={"h-4 w-4 text-white"} />
                      </Button>
                    </Link>

                    <Button isIconOnly color="danger" size="sm">
                      <TrashIcon className={"h-4 w-4"} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className={isOpen ? "show flex-[30%]" : "hide"} id="two">
        {detail && <BudgetDetail data={detail} />}
      </div>
    </div>
  );
}

const STATUS_COLOR: Status[] = ["primary", "success", "danger"];

type Status = "primary" | "success" | "danger";
