import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";

import { requireUserId } from "~/session.server";
import { getBudgetItem } from "~/models/budget.server";

import { formatCurrency, formatInt } from "~/utils";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { id } = params;
  const userId = await requireUserId(request);
  const budgetItem = await getBudgetItem({ userId, id });

  return json(budgetItem);
};

export default function NewBudgetPage() {
  const data = useLoaderData<typeof loader>();

  const columns = [
    {
      key: "material",
      label: "MATERIAL",
    },
    {
      key: "quantity",
      label: "CANTIDAD",
    },
    {
      key: "unitPrice",
      label: "PRECIO UNITARIO",
    },
    {
      key: "subtotal",
      label: "SUBTOTAL",
    },
  ];

  const rows = data?.materials?.map((m, index) => {
    return {
      key: index,
      material: m.material.name,
      quantity: formatInt(+m.quantity),
      unitPrice: formatCurrency(m.material.unitPrice),
      subtotal: formatCurrency(+m.quantity * m.material.unitPrice),
    };
  });

  const total = data?.materials.reduce(
    (sum, material) => sum + +material.quantity * material.material.unitPrice,
    0
  );

  return (
    <Card className="mx-auto max-w-[600px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">📖</span> Detalle del presupuesto
        </h1>
      </CardHeader>

      <Divider />

      <CardBody>
        <h2 className="text-lg font-semibold">{data?.name}</h2>

        <Spacer y={4} />

        <Divider />

        <Spacer y={4} />

        <Table
          removeWrapper
          layout="fixed"
          classNames={{
            th: "text-center",
          }}
          bottomContent={
            <>
              <Divider />

              <div className="flex justify-between px-3">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold">
                  {total && formatCurrency(total)}
                </span>
              </div>
            </>
          }
          aria-label="Materials on budget"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={rows}>
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => (
                  <TableCell
                    className={columnKey !== "material" ? "text-end" : ""}
                  >
                    {getKeyValue(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
