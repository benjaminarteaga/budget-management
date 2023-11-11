import type { LoaderArgs } from "@remix-run/node";
import { PencilIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Chip,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Link, useFetcher } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useEffect, useState } from "react";
import BudgetDetail from "~/components/BudgetDetail";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { getBudgetListItems, type getBudgetItem } from "~/models/budget.server";
import type { Prisma } from "@prisma/client";
import { formatCurrency, formatInt } from "~/utils";
import { TrashIcon } from "@heroicons/react/24/outline";

export type BudgetWithRelations = Prisma.PromiseReturnType<
  typeof getBudgetItem
>;

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const budgetListItems = await getBudgetListItems({ userId });

  return typedjson(budgetListItems);
};

export default function BudgetIndexPage() {
  const data = useTypedLoaderData<typeof loader>();

  const [detail, setDetail] = useState<BudgetWithRelations>();

  const [toDelete, setToDelete] = useState<BudgetWithRelations>();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const fetcher = useFetcher();

  useEffect(() => {
    setToDelete(null);
    setTimeout(() => onClose(), 2000);
  }, [fetcher.data, onClose]);

  const handleShowDetail = (id: number) => {
    if (detail && detail.id === id) {
      setDetail(null);
      return;
    }

    setDetail(data.find((budget) => budget.id === id));
  };

  const handleOpenModal = (id: number) => {
    setToDelete(data.find((budget) => budget.id === id));
    onOpen();
  };

  const handleCloseModal = () => {
    setToDelete(null);
    onClose();
  };

  const handleConfirmDelete = () => {
    toDelete &&
      fetcher.submit({}, { method: "post", action: `delete/${toDelete?.id}` });
  };

  return (
    <>
      <div className="flex gap-6">
        <div className="flex-[70%]">
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

          <Table
            layout="fixed"
            classNames={{ th: "text-center", td: "text-center" }}
          >
            <TableHeader>
              <TableColumn>NOMBRE</TableColumn>
              <TableColumn>MATERIALES</TableColumn>
              <TableColumn>CANTIDAD</TableColumn>
              <TableColumn>COSTO</TableColumn>
              <TableColumn>PRECIO DE VENTA</TableColumn>
              <TableColumn>GANANCIA</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>DETALLE</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {data.map((budget) => {
                const { id, name, materials, salesPrice } = budget;

                let cost = 0;

                const materialsArray = materials.map((material) => {
                  cost += material.material.unitPrice * material.quantity;

                  return {
                    name: material.material.name,
                    quantity: material.quantity,
                  };
                });

                const chipColor = STATUS_COLOR[budget.status.id - 1];

                return (
                  <TableRow key={id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      {materialsArray.map(({ name }) => (
                        <>
                          {name}
                          <br />
                        </>
                      ))}
                    </TableCell>
                    <TableCell className="text-end">
                      {materialsArray.map(({ quantity }) => (
                        <>
                          {formatInt(quantity)}
                          <br />
                        </>
                      ))}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(cost)}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(salesPrice)}
                    </TableCell>
                    <TableCell className="text-end text-green-500">
                      {formatCurrency(salesPrice - cost)}
                    </TableCell>
                    <TableCell>
                      <Chip radius="full" variant="flat" color={chipColor}>
                        {budget.status.name}
                      </Chip>
                    </TableCell>

                    <TableCell>
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={() => handleShowDetail(id)}
                      >
                        Ver detalle
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Link to={`edit/${id}`}>
                        <Button
                          isIconOnly
                          color="success"
                          size="sm"
                          className="mr-2"
                        >
                          <PencilIcon className={"h-4 w-4 text-white"} />
                        </Button>
                      </Link>

                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        onClick={() => handleOpenModal(id)}
                      >
                        <TrashIcon className={"h-4 w-4"} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className={detail ? "show flex-[30%]" : "hide"} id="two">
          {detail && <BudgetDetail data={detail} />}
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🗑️ Eliminar presupuesto
              </ModalHeader>
              <ModalBody>
                {fetcher.data && <p>{fetcher.data.message}</p>}
                {toDelete && (
                  <>
                    <p>Confirma que deseas eliminar el presupuesto:</p>
                    <p>
                      Nombre: <strong>{toDelete?.name}</strong>
                    </p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {fetcher.state === "idle" && fetcher.data === undefined && (
                  <>
                    <Button
                      color="default"
                      variant="light"
                      onPress={handleCloseModal}
                    >
                      Cancelar
                    </Button>
                    <Button color="danger" onClick={handleConfirmDelete}>
                      Eliminar
                    </Button>
                  </>
                )}
                {fetcher.state !== "idle" && "Cargando..."}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const STATUS_COLOR: Status[] = ["primary", "success", "danger"];

type Status = "primary" | "success" | "danger";
