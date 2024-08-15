import { useMemo, useState } from "react";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Spacer,
} from "@nextui-org/react";

import { getToolItem, updateTool } from "~/models/tool.server";
import { requireUserId } from "~/session.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const { id } = params;

  const tool = await getToolItem({
    userId,
    id,
  });

  return typedjson({ tool });
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = +(formData.get("id") as string);
  const name = formData.get("name");
  const quantity = +(formData.get("quantity") as string);
  const unitPrice = +(formData.get("unitPrice") as string);
  const totalPrice = +(formData.get("totalPrice") as string);

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, title: "Nombre es requerido" } },
      { status: 400 }
    );
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    return json(
      { errors: { body: null, title: "Cantidad es requerido" } },
      { status: 400 }
    );
  }

  if (typeof unitPrice !== "number" || unitPrice <= 0) {
    return json(
      { errors: { body: null, title: "Precio unitario es requerido" } },
      { status: 400 }
    );
  }

  if (typeof totalPrice !== "number" || totalPrice <= 0) {
    return json(
      { errors: { body: null, title: "Precio total es requerido" } },
      { status: 400 }
    );
  }

  await updateTool({
    id,
    name,
    quantity,
    unitPrice,
    totalPrice,
    userId,
  });

  return redirect("/tools");
}

export default function EditToolPage() {
  const { tool } = useTypedLoaderData<typeof loader>();

  const [quantity, setQuantity] = useState(tool?.quantity || 0);

  const [price, setPrice] = useState(tool?.unitPrice || 0);

  const totalPrice = useMemo(() => {
    if (quantity > 0 && price > 0) {
      return quantity * price + "";
    }
    return "0";
  }, [quantity, price]);

  return (
    <Card className="mx-auto max-w-[400px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">🖨️</span> Editar herramienta
        </h1>
      </CardHeader>
      <Divider />
      <CardBody>
        <Form method="post">
          <Input
            type="text"
            label="Nombre"
            name="name"
            defaultValue={tool?.name}
          />

          <Spacer y={4} />

          <Input
            type="text"
            label="Cantidad"
            name="quantity"
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            value={quantity.toString()}
          />

          <Spacer y={4} />

          <Input
            type="text"
            label="Precio Unitario"
            name="unitPrice"
            onChange={(e) => setPrice(parseInt(e.target.value))}
            value={price.toString()}
          />

          <Spacer y={4} />

          <Input
            type="text"
            label="Precio Total"
            name="totalPrice"
            value={totalPrice || ""}
            readOnly
          />

          <Spacer y={4} />

          <input type="hidden" name="id" value={tool?.id.toString()} />

          <Button
            type="submit"
            color="success"
            variant="shadow"
            className="text-white"
            fullWidth
            size="lg"
          >
            Guardar herramienta
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
