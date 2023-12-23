import { Outlet } from "@remix-run/react";

export default function Auth() {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
}
