import { Link } from "@remix-run/react";

export default function BudgetIndexPage() {
  return (
    <>
      <Link
        to="new"
        className="mb-1 mr-1 rounded-full bg-green-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-green-600"
      >
        ➕ Nuevo presupuesto
      </Link>
    </>
  );
}
