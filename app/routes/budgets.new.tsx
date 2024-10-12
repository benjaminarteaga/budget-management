import {
  type ChangeEvent,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { toast } from "sonner";

import {
  type Selection,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
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

import {
  TrashIcon,
  ArrowSmallRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import { requireUserId } from "~/session.server";
import { getMaterialListItems } from "~/models/material.server";
import { getToolListItems } from "~/models/tool.server";
import { createBudget } from "~/models/budget.server";

import { formatCurrency, formatInt } from "~/utils";

import type { Tool } from "@prisma/client";

type SelectedTools = {
  id: number;
  amount: number;
  selected?: boolean;
}[];

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const {
    name,
    materials,
    salesPrice,
    tools,
  }: {
    name: string;
    materials: MaterialList[];
    salesPrice: string;
    tools: SelectedTools;
  } = await request.json();

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        error: "Asignale un nombre a tu presupuesto",
      },
      { status: 400 }
    );
  }

  if (!materials || materials.length <= 0) {
    return json(
      {
        error: "Agrega al menos un material",
      },
      { status: 400 }
    );
  }

  if (!salesPrice || +salesPrice === 0) {
    return json(
      {
        error: "Agrega el precio de venta",
      },
      { status: 400 }
    );
  }

  await createBudget({
    name,
    materials,
    tools,
    salesPrice: +salesPrice,
    userId,
  });

  return redirect("/budgets");
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });
  const toolsListItems = await getToolListItems({ userId });

  return typedjson({ materialListItems, toolsListItems });
};

export default function NewBudgetPage() {
  const { materialListItems, toolsListItems } =
    useTypedLoaderData<typeof loader>();

  const error = useActionData<typeof action>();

  const [name, setName] = useState<string>("");

  const [materials, setMaterials] = useState<MaterialList[]>([]);

  const [selected, setSelected] = useState<Selection>(new Set([]));

  const [material, setMaterial] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("");

  const [salesPrice, setSalesPrice] = useState<string>("");

  const [editPrice, setEditPrice] = useState<boolean>(false);

  const [tools, setTools] = useState<SelectedTools>(
    toolsListItems.map((t) => ({ id: t.id, amount: 0, selected: false }))
  );

  const submit = useSubmit();

  useEffect(() => {
    if (error) {
      toast.error(error.error);
    }
  }, [error]);

  /**
   * @description
   * Table content of selected materials.
   */
  const rows = useMemo(
    () =>
      materials?.map(({ id, name, quantity, unitPrice }) => {
        return {
          key: id,
          material: name,
          quantity: formatInt(+quantity),
          unitPrice: formatCurrency(unitPrice),
          subtotal: formatCurrency(+quantity * unitPrice),
          actions: (
            <Button
              isIconOnly
              color="danger"
              radius="full"
              size="sm"
              onClick={() => handleDeleteMaterial(id)}
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
   * Table content of tools.
   */
  const rowsTools = toolsListItems?.map((t) => {
    const tool = tools.find((tool) => tool.id === t.id);

    return {
      key: t.id,
      actions: (
        <Checkbox
          isSelected={tool?.selected}
          onChange={() => handleCheckboxChange(t.id)}
        />
      ),
      name: t.name,
      quantity: formatInt(+t.quantity),
      unitPrice: formatCurrency(t.unitPrice),
      totalPrice: formatCurrency(t.totalPrice),
      amount: (
        <Input
          type="number"
          value={tool?.amount.toString() || ""}
          onChange={(e) => handleAmountChange(t.id, e.target.value)}
        />
      ),
      percent: `${calculatePercent(t).toFixed(2)}%`,
    };
  });

  /**
   * @description
   * Generate label for quantity, with or without stock.
   */
  const label = useMemo(() => {
    const idSelected = material;

    const mat = materialListItems.find((m) => m.id === +idSelected);

    const stock = mat ? ` (stock: ${mat.stock})` : "";

    return `Cantidad${stock}`;
  }, [material, materialListItems]);

  /**
   * @description
   * Get amount of available stock.
   */
  const stock = useMemo(() => {
    const idSelected = material;

    return materialListItems.find((m) => m.id === +idSelected)?.stock;
  }, [material, materialListItems]);

  /**
   * @description
   * Add material to actual budget.
   */
  const handleAddMaterial = () => {
    const invalid = validate();

    if (invalid) {
      return;
    }

    const idSelected = material;

    const exist = materials.find((m) => m.id === +idSelected);

    if (exist) {
      toast.error("Ya está incluido ese material");
      return;
    }

    const mat = materialListItems.find((m) => m.id === +idSelected);

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

  const handleCheckboxChange = (id: number) => {
    setTools((prev) => {
      const newTools = [...prev];

      newTools[id].selected = !newTools[id].selected;

      return newTools;
    });
  };

  const handleAmountChange = (id: number, amount: string) => {
    setTools((prev) => {
      const newTools = [...prev];

      const updatedTool = newTools.find((t) => t.id === id);

      if (updatedTool) {
        updatedTool.amount = parseInt(amount) || 0;
        updatedTool.selected = Boolean(parseInt(amount));
      }

      return newTools;
    });
  };

  function calculatePercent(tool: Tool) {
    const amount = tools.find((t) => t.id === tool.id)?.amount || 0;
    return (amount * 100) / tool.totalPrice || 0;
  }

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

  const handleSubmitForm = () => {
    const body = {
      name,
      materials,
      salesPrice,
      tools: tools
        .filter((t) => t.selected)
        .map((t) => ({
          id: t.id,
          amount: t.amount,
        })),
    };

    submit(body, {
      method: "post",
      encType: "application/json",
    });
  };

  const totalMaterials = useMemo(
    () =>
      materials.reduce(
        (sum, material) => sum + +material.quantity * material.unitPrice,
        0
      ),
    [materials]
  );

  const totalSelectedToolsAmount = useMemo(() => {
    return tools.reduce((total, tool, index) => {
      if (tool.selected) {
        return total + (tool.amount || 0);
      }
      return total;
    }, 0);
  }, [tools]);

  const total = useMemo(
    () => totalMaterials + totalSelectedToolsAmount,
    [totalMaterials, totalSelectedToolsAmount]
  );

  return (
    <Card className="mx-auto max-w-full">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">📑</span> Nuevo presupuesto
        </h1>
      </CardHeader>

      <Divider />

      <CardBody>
        <div className="flex gap-4">
          <Form method="post" className="flex-auto">
            <Input
              type="text"
              label="Nombre del presupuesto"
              name="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;

                setName(value);
              }}
            />

            <Spacer y={4} />

            <Divider />

            <Spacer y={4} />

            <Select
              label="Agregar material"
              placeholder="Selecciona..."
              items={materialListItems}
              onChange={handleSelectionChange}
              selectedKeys={selected}
            >
              {({ id, name }) => <SelectItem key={id}>{name}</SelectItem>}
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

            <input type="hidden" name="salesPrice" value={salesPrice ?? 0} />

            <Button
              color="success"
              variant="shadow"
              className="text-white"
              fullWidth
              size="lg"
              onClick={handleSubmitForm}
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
                    <span className="font-bold">MATERIALES</span>
                    <span className="font-bold">
                      {formatCurrency(totalMaterials)}
                    </span>
                  </div>

                  <div className="flex justify-between px-3">
                    <span className="font-bold">HERRAMIENTAS</span>
                    <span className="font-bold">
                      {formatCurrency(totalSelectedToolsAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between px-3">
                    <span className="font-bold">TOTAL</span>
                    <span className="font-bold">{formatCurrency(total)}</span>
                  </div>

                  <div className="flex items-center justify-between px-3">
                    <span className=" font-bold">PRECIO DE VENTA</span>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        color="success"
                        variant="shadow"
                        onClick={() => setEditPrice((prevState) => !prevState)}
                      >
                        <PencilSquareIcon className={"h-5 w-5 text-white"} />
                      </Button>
                      {editPrice && (
                        <Input
                          autoFocus
                          type="number"
                          size="sm"
                          variant="bordered"
                          value={salesPrice}
                          onBlur={() => setEditPrice(false)}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;

                            setSalesPrice(value);
                          }}
                          startContent={
                            <div className="pointer-events-none flex items-center">
                              <span className="text-small text-default-400">
                                $
                              </span>
                            </div>
                          }
                        />
                      )}

                      {!editPrice && (
                        <span className=" text-end font-bold">
                          {formatCurrency(+salesPrice || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between px-3">
                    <span className="font-bold">GANANCIA</span>
                    <span className="font-bold">
                      {formatCurrency(+salesPrice - total)}
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

          <Divider orientation="vertical" className="h-auto" />

          <div className="flex-auto">
            <Table
              aria-label="Example table with dynamic content"
              removeWrapper
            >
              <TableHeader columns={columnsTools}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={rowsTools}>
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
 * Table header of tools.
 */
const columnsTools = [
  {
    key: "actions",
    label: "",
  },
  {
    key: "name",
    label: "NOMBRE",
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
    key: "totalPrice",
    label: "PRECIO TOTAL",
  },
  {
    key: "amount",
    label: "CANTIDAD",
  },
  {
    key: "percent",
    label: "% DE RECUPERACIÓN",
  },
];
