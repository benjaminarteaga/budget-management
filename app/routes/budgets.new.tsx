import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

// import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
// import { useUser } from "~/utils";
// import Layout from "./_layout";

import { PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { getMaterialListItems } from "~/models/material.server";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
  Spacer,
} from "@nextui-org/react";
import { v4 as uuid } from "uuid";
import { createBudget } from "~/models/budget.server";

type Material = {
  uuid: string;
};

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

  return redirect("/budget");
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });

  return json(materialListItems);
};

export default function NewBudgetPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  const [materials, setMaterials] = useState<Material[]>([]);

  const handleAddMaterial = () => {
    const id = uuid();

    setMaterials((prevState) => [...prevState, { uuid: id }]);
  };

  return (
    <Card className="mx-auto max-w-[400px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">📑</span> Nuevo presupuesto
        </h1>
      </CardHeader>

      <Divider />

      <CardBody>
        <Form method="post">
          <Input type="text" label="Nombre del presupuesto" name="name" />

          <Spacer y={4} />

          <Divider />

          <Spacer y={4} />

          {materials.map((material, index) => (
            <div key={material.uuid}>
              <Select
                label="Agregar material"
                placeholder="Selecciona..."
                name={`materials[]`}
              >
                {data.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </Select>

              <Spacer y={4} />

              <Input type="number" label="Cantidad" name={`quantity[]`} />

              <Spacer y={4} />

              <Divider />

              <Spacer y={4} />
            </div>
          ))}

          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              color="success"
              radius="full"
              className="text-white"
              aria-label="Like"
              onClick={handleAddMaterial}
              size="sm"
            >
              <PlusIcon />
            </Button>
            <span>Agregar material</span>
          </div>

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
      </CardBody>
    </Card>
  );
}
