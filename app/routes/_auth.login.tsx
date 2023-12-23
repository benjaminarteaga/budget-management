import { useEffect, useRef, useState } from "react";

import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";

import { Button, Input } from "@nextui-org/react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import logo from "~/resources/logo.png";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

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

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Email o contraseña son inválidos", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on",
    request,
    userId: user.id,
  });
};

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
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
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <img
          src={logo}
          alt="Camilili Design"
          className="mb-8 max-w-full object-contain"
        />

        <Form className="space-y-8" method="post">
          <div>
            <Input
              ref={emailRef}
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              label="Email"
              labelPlacement="outside"
              size="lg"
              variant="bordered"
              required
            />
            {actionData?.errors?.email && (
              <div className="pt-1 text-red-700" id="email-error">
                {actionData.errors.email}
              </div>
            )}
          </div>

          <div>
            <Input
              ref={passwordRef}
              type={isVisible ? "text" : "password"}
              name="password"
              label="Contraseña"
              labelPlacement="outside"
              size="lg"
              variant="bordered"
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
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <Button
            type="submit"
            variant="shadow"
            color="primary"
            size="lg"
            fullWidth
          >
            Iniciar Sesión
          </Button>
        </Form>
      </div>
    </div>
  );
}
