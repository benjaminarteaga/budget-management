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

import type { BudgetWithRelations } from "~/routes/budgets._index";

import { formatCurrency, formatInt } from "~/utils";

export default function BudgetDetail({
  data,
}: {
  data: BudgetWithRelations | undefined;
}) {
  const columnsMaterials = [
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

  const columnsTools = [
    {
      key: "tool",
      label: "HERRAMIENTA",
    },
    {
      key: "totalCost",
      label: "COSTO",
    },
    {
      key: "amount",
      label: "MONTO",
    },
    {
      key: "percentage",
      label: "PORCENTAJE",
    },
  ];

  const rowsMaterials = data?.materials?.map((m, index) => {
    return {
      key: index,
      material: m.material.name,
      quantity: formatInt(+m.quantity),
      unitPrice: formatCurrency(m.material.unitPrice),
      subtotal: formatCurrency(+m.quantity * m.material.unitPrice),
    };
  });

  const rowsTools = data?.tools?.map((m, index) => {
    return {
      key: index,
      tool: m.tool.name,
      totalCost: formatCurrency(m.tool.totalPrice),
      amount: formatCurrency(m.quantity),
      percentage: `${((m.quantity * 100) / m.tool.totalPrice).toFixed(2)}%`,
    };
  });

  const totalMaterialCost = data?.result.totalMaterialCost || 0;

  const totalToolAssigned = data?.result.totalToolAssigned || 0;

  const total = totalMaterialCost + totalToolAssigned;

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
                <span className="font-semibold">Total Materiales</span>
                <span className="font-semibold">
                  {totalMaterialCost && formatCurrency(totalMaterialCost)}
                </span>
              </div>

              <Divider />
            </>
          }
          aria-label="Materials on budget"
        >
          <TableHeader columns={columnsMaterials}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={rowsMaterials}>
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

        <Spacer y={4} />

        <Table
          removeWrapper
          layout="fixed"
          classNames={{
            th: "text-center",
            emptyWrapper: "h-24",
          }}
          bottomContent={
            <>
              <Divider />

              <div className="flex justify-between px-3">
                <span className="font-semibold">Total Herramientas</span>
                <span className="font-semibold">
                  {totalToolAssigned && formatCurrency(totalToolAssigned)}
                </span>
              </div>

              <Divider />
            </>
          }
          aria-label="Tools on budget"
        >
          <TableHeader columns={columnsTools}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={rowsTools}
            emptyContent={"No se asignaron herramientas."}
          >
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => (
                  <TableCell className={columnKey !== "tool" ? "text-end" : ""}>
                    {getKeyValue(item, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="my-4 flex justify-between px-3">
          <span className="font-bold">TOTAL GASTO</span>
          <span className="font-bold">{total && formatCurrency(total)}</span>
        </div>
      </CardBody>
    </Card>
  );
}
