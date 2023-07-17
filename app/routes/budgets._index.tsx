import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";

export default function BudgetIndexPage() {
  return (
    <>
      <Link to="new" className="btn-rounded btn-success btn">
        <PlusCircleIcon className="h-6 w-6" /> Nuevo presupuesto
      </Link>
    </>
  );
}
