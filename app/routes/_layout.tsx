import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

// import { useUser } from "~/utils";
import logo from "~/resources/logo.png";
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

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  // const user = useUser();

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
          <NavbarItem>
            <Link to="/materials" color="foreground">
              Materiales
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/budgets" color="foreground">
              Presupuestos
            </Link>
          </NavbarItem>
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
              {/* <img src="https://i.pravatar.cc/150?img=37" alt="avatar" /> */}
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">zoey@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main>{children}</main>

      {/* <div className="flex h-full min-h-screen flex-col">
        <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <Link
            to="/"
            className="text-white-500 flex text-3xl font-bold hover:text-gray-100"
          >
            <img src={logo} alt="Camilili Design" className="max-h-11" />
          </Link>

          <div className="flex items-center">
            <Link
              to="/articles"
              className="text-white-400 mr-4 hover:text-gray-100"
            >
              Artículos
            </Link>
            <Link
              to="/budgets"
              className="text-white-400 mr-4 hover:text-gray-100"
            >
              Presupuestos
            </Link>
          </div>
          <div className="flex items-center">
            <p className="mr-4 text-gray-400">{user.email}</p>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-full bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <main className="flex h-full">{children}</main>
      </div> */}
    </div>
  );
}
