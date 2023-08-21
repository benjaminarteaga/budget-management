import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Button, Spacer } from "@nextui-org/react";
import { Link } from "@remix-run/react";

export default function BudgetIndexPage() {
  return (
    <>
      <Link to="new">
        <Button
          color="success"
          disableRipple
          startContent={<PlusCircleIcon className="h-6 w-6" />}
          variant="shadow"
          className="text-white"
        >
          Nuevo presupuesto
        </Button>
      </Link>

      <Spacer y={4} />
    </>
  );
}
