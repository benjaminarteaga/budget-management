import { useEffect, useRef, useState } from "react";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Spacer,
} from "@nextui-org/react";

import { requireUser } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { createUser, getUserByEmail } from "~/models/user.server";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json(user);
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect("/users");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email es inválido", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Contraseña es requerida" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Contraseña es muy corta" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "Este email ya está siendo usado por otro usuario",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  await createUser(email, password);

  return redirect(redirectTo);
};

export default function NewUserPage() {
  const actionData = useActionData<typeof action>();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Card className="mx-auto max-w-[400px]">
      <CardHeader className="flex gap-3">
        <h1 className="font-medium">
          <span className="text-3xl">👩‍💻👨‍💻</span> Nuevo usuario
        </h1>
      </CardHeader>
      <Divider />
      <CardBody>
        <Form method="post">
          <Input ref={emailRef} name="email" type="email" label="Email" />
          {actionData?.errors?.email && (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.email}
            </div>
          )}

          <Spacer y={4} />

          <Input
            ref={passwordRef}
            type={isVisible ? "text" : "password"}
            name="password"
            label="Contraseña"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeSlashIcon className="pointer-events-none h-6 w-6 text-2xl text-default-400" />
                ) : (
                  <EyeIcon className="pointer-events-none h-6 w-6 text-2xl text-default-400" />
                )}
              </button>
            }
          />
          {actionData?.errors?.password && (
            <div className="pt-1 text-red-700" id="password-error">
              {actionData.errors.password}
            </div>
          )}

          <Spacer y={4} />

          <Button
            type="submit"
            color="success"
            variant="shadow"
            className="text-white"
            fullWidth
            size="lg"
          >
            Guardar usuario
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
