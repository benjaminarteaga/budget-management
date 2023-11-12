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
  Switch,
} from "@nextui-org/react";

import { createMaterial } from "~/models/material.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const quantity = +(formData.get("quantity") as string);
  const stock = formData.get("stock")
    ? +(formData.get("stock") as string)
    : quantity;
  const price = +(formData.get("price") as string);
  const unitPrice = +(formData.get("unitPrice") as string);

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

  if (typeof stock !== "number" || stock <= 0) {
    return json(
      { errors: { body: null, title: "Stock es requerido" } },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || price <= 0) {
    return json(
      { errors: { body: null, title: "Precio es requerido" } },
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
    stock,
    quantity,
    price,
    unitPrice,
    userId,
  });

  return redirect("/materials");
}

export default function NewMaterialPage() {
  const [quantity, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [isSelected, setIsSelected] = useState(true);

  const unitPrice = useMemo(() => {
    if (quantity > 0 && price > 0) {
      return price / quantity + "";
    }
    return "0";
  }, [quantity, price]);

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
            name="quantity"
            onChange={(e) => setStock(parseInt(e.target.value))}
          />

          <Spacer y={4} />

          <Switch
            isSelected={isSelected}
            onValueChange={setIsSelected}
            size="sm"
            color="secondary"
          >
            Stock inicial igual a la cantidad
          </Switch>

          {!isSelected && (
            <>
              <Spacer y={4} />

              <Input type="text" label="Stock inicial" name="stock" />
            </>
          )}

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
