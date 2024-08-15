import { useMemo, useState } from "react";

import type { ActionArgs } from "@remix-run/node";
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

import { createTool } from "~/models/tool.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
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

  await createTool({
    name,
    quantity,
    unitPrice,
    totalPrice,
    userId,
  });

  return redirect("/tools");
}

export default function NewToolPage() {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

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
          <span className="text-3xl">🖨️</span> Nueva herramienta
        </h1>
      </CardHeader>
      <Divider />
      <CardBody>
        <Form method="post">
          <Input type="text" label="Nombre" name="name" />

          <Spacer y={4} />

          <Input
            type="text"
            label="Cantidad"
            name="quantity"
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />

          <Spacer y={4} />

          <Input
            type="text"
            label="Precio Unitario"
            name="unitPrice"
            onChange={(e) => setPrice(parseInt(e.target.value))}
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
