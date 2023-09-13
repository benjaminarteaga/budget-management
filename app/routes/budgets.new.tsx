import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { requireUserId } from "~/session.server";

import { type ChangeEvent, useState, useMemo, useCallback } from "react";
import { getMaterialListItems } from "~/models/material.server";
import {
  type Selection,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";
import { createBudget } from "~/models/budget.server";
import { formatCurrency, formatInt } from "~/utils";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { TrashIcon, ArrowSmallRightIcon } from "@heroicons/react/24/outline";

import { toast } from "sonner";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const name = formData.get("name");
  const materials = formData.getAll("materials[]");
  const quantity = formData.getAll("quantity[]");

  const materialsArray = [];

  for (let i = 0; i < materials.length; i++) {
    const material = {
      id: materials[i],
      quantity: quantity[i],
    };

    materialsArray.push(material);
  }

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, title: "Asignale un nombre a tu presupuesto" } },
      { status: 400 }
    );
  }

  if (!materials || materials.length <= 0) {
    return json(
      {
        errors: {
          body: null,
          title: "Agrega al menos un material o valida el nombre",
        },
      },
      { status: 400 }
    );
  }

  if (!quantity || quantity.length <= 0) {
    return json(
      {
        errors: {
          body: null,
          title: "Agrega al menos un material o valida la cantidad",
        },
      },
      { status: 400 }
    );
  }

  if (materials.length !== quantity.length) {
    return json(
      {
        errors: {
          body: null,
          title: "El total de materiales y cantidades no coinciden",
        },
      },
      { status: 400 }
    );
  }

  await createBudget({
    name,
    materials: materialsArray,
    userId,
  });

  return redirect("/budgets");
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });

  return typedjson(materialListItems);
};

export default function NewBudgetPage() {
  const data = useTypedLoaderData<typeof loader>();

  const [materials, setMaterials] = useState<MaterialList[]>([]);

  const [selected, setSelected] = useState<Selection>(new Set([]));

  const [material, setMaterial] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("");

  /**
   * @description
   * Table header of selected materials.
   */
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
    {
      key: "actions",
      label: "",
    },
  ];

  /**
   * @description
   * Table content of selected materials.
   */
  const rows = useMemo(
    () =>
      materials?.map((m) => {
        return {
          key: m.id,
          material: m.name,
          quantity: formatInt(+m.quantity),
          unitPrice: formatCurrency(m.unitPrice),
          subtotal: formatCurrency(+m.quantity * m.unitPrice),
          actions: (
            <Button
              isIconOnly
              color="danger"
              radius="full"
              size="sm"
              onClick={() => handleDeleteMaterial(m.id)}
            >
              <TrashIcon className={"h-5 w-5"} />
            </Button>
          ),
        };
      }),
    [materials]
  );

  /**
   * @description
   * Generate label for quantity, with or without stock.
   */
  const label = useMemo(() => {
    const [idSelected] = material;

    const mat = data.find((m) => m.id === +idSelected);

    const stock = mat ? ` (stock: ${mat.stock})` : "";

    return `Cantidad${stock}`;
  }, [material, data]);

  /**
   * @description
   * Get amount of available stock.
   */
  const stock = useMemo(() => {
    const [idSelected] = material;

    return data.find((m) => m.id === +idSelected)?.stock;
  }, [material, data]);

  /**
   * @description
   * Add material to actual budget.
   */
  const handleAddMaterial = () => {
    const invalid = validate();

    if (invalid) {
      return;
    }

    const [idSelected] = material;

    const exist = materials.find((m) => m.id === +idSelected);

    if (exist) {
      toast.error("Ya está incluido ese material");
      return;
    }

    const mat = data.find((m) => m.id === +idSelected);

    if (!mat) {
      toast.error("Hay un error con este material");
      return;
    }

    setMaterials((prevState) => [
      ...prevState,
      {
        id: mat.id,
        name: mat.name,
        unitPrice: mat.unitPrice,
        quantity,
      },
    ]);

    setSelected(new Set([]));

    setMaterial("");

    setQuantity("");
  };

  /**
   * @description
   * Remove material from actual budget.
   */
  const handleDeleteMaterial = (id: number) => {
    setMaterials((prevMaterials) => prevMaterials.filter((m) => m.id !== id));
  };

  /**
   * @description
   * Handle select onChange action.
   */
  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(new Set([e.target.value]));
    setMaterial(e.target.value);
  };

  const validate = useCallback(() => {
    const errors = [];

    if (!material) {
      errors.push("Selecciona un material");
    }

    if (!quantity) {
      errors.push("Ingresa la cantidad");
    }

    if (errors.length) {
      const string = errors.map((e, index) => <li key={index}>{e}</li>);

      toast.error(<ul>{string}</ul>);
      return true;
    }
  }, [material, quantity]);

  const total = materials.reduce(
    (sum, material) => sum + +material.quantity * material.unitPrice,
    0
  );

  return (
    <Card className="mx-auto max-w-[800px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">📑</span> Nuevo presupuesto
        </h1>
      </CardHeader>

      <Divider />

      <CardBody>
        <div className="flex gap-4">
          <Form method="post" className="flex-auto">
            <Input type="text" label="Nombre del presupuesto" name="name" />

            <Spacer y={4} />

            <Divider />

            <Spacer y={4} />

            <Select
              label="Agregar material"
              placeholder="Selecciona..."
              items={data}
              onChange={handleSelectionChange}
              selectedKeys={selected}
            >
              {(material) => (
                <SelectItem key={material.id}>{material.name}</SelectItem>
              )}
            </Select>

            <Spacer y={4} />

            <Input
              type="number"
              label={label}
              value={quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;

                if (!stock || +value > stock) {
                  return;
                }

                setQuantity(e.target.value);
              }}
            />

            <Spacer y={4} />

            <Button
              color="warning"
              variant="shadow"
              onClick={handleAddMaterial}
              endContent={<ArrowSmallRightIcon className="h-5 w-5" />}
              fullWidth={true}
              className="justify-self-end text-white"
            >
              Agregar material
            </Button>

            <Spacer y={4} />

            <Divider />

            <Spacer y={8} />

            <Button
              type="submit"
              color="success"
              variant="shadow"
              className="text-white"
              fullWidth
              size="lg"
            >
              Guardar presupuesto
            </Button>
          </Form>

          <Divider orientation="vertical" className="h-auto" />

          <div className="flex-auto">
            <Table
              aria-label="Example table with dynamic content"
              removeWrapper
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
                      <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

type MaterialList = {
  id: number;
  name: string;
  unitPrice: number;
  quantity: string;
};
