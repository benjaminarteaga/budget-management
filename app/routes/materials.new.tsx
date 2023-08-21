import { Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createMaterial } from "~/models/material.server";
import { requireUserId } from "~/session.server";
import type { ActionArgs } from "@remix-run/node";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Spacer,
} from "@nextui-org/react";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const price = +(formData.get("price") as string);
  const stock = +(formData.get("stock") as string);
  const unitPrice = +(formData.get("unitPrice") as string);

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, title: "Nombre es requerido" } },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || price <= 0) {
    return json(
      { errors: { body: null, title: "Precio es requerido" } },
      { status: 400 }
    );
  }

  if (typeof stock !== "number" || stock <= 0) {
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

  await createMaterial({
    name,
    price,
    unitPrice,
    stock,
    userId,
  });

  return redirect("/materials");
}

export default function NewMaterialPage() {
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);

  const unitPrice = useMemo(() => {
    if (stock > 0 && price > 0) {
      return price / stock + "";
    }
    return "0";
  }, [stock, price]);

  return (
    <Card className="mx-auto max-w-[400px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">📚</span> Nuevo material
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
            name="stock"
            onChange={(e) => setStock(parseInt(e.target.value))}
          />
          <Spacer y={4} />
          <Input
            type="text"
            label="Precio"
            name="price"
            onChange={(e) => setPrice(parseInt(e.target.value))}
          />
          <Spacer y={4} />
          <Input
            type="text"
            label="Precio Unitario"
            name="unitPrice"
            value={unitPrice || ""}
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
            Guardar material
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
