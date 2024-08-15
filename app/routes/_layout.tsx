import type { V2_MetaFunction } from "@remix-run/node";
import { Link, useMatches } from "@remix-run/react";

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";

import { useUser } from "~/utils";
import logo from "~/resources/logo.png";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const matches = useMatches();

  const isActive = (url: string) =>
    matches.some(({ pathname }) => pathname.includes(url));

  const renderMenuItems = () => {
    const items = [
      { name: "Materiales", url: "/materials" },
      { name: "Herramientas", url: "/tools" },
      { name: "Presupuestos", url: "/budgets" },
      { name: "Ventas", url: "/sales" },
      { name: "Usuarios", url: "/users" },
    ];

    return items.map(({ name, url }) => (
      <NavbarItem
        key={name}
        className={
          isActive(url)
            ? " border-b-2 border-amber-500 font-bold text-amber-500"
            : "hover:text-amber-500"
        }
      >
        <Link to={url}>{name}</Link>
      </NavbarItem>
    ));
  };

  return (
    <div className="bg-background text-foreground light">
      <Navbar
        maxWidth="full"
        isBordered
        classNames={{ base: "bg-white drop-shadow" }}
      >
        <NavbarBrand>
          <Link to="/">
            <img src={logo} alt="Camilili Design" className="max-h-11" />
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden gap-4 sm:flex" justify="center">
          {renderMenuItems()}
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?img=37"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Sesión iniciada como</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>

              <DropdownItem key="logout">
                <form method="POST" action="/logout">
                  <button>Cerrar Sesión</button>
                </form>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main>{children}</main>
    </div>
  );
}
