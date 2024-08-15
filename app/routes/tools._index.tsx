import { useEffect, useState } from "react";

import type { LoaderArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import type { Prisma } from "@prisma/client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";

import {
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import { requireUserId } from "~/session.server";
import { type getToolItem, getToolListItems } from "~/models/tool.server";

import { formatCurrency, formatInt } from "~/utils";

export type Tools = Prisma.PromiseReturnType<typeof getToolItem>;

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const toolListItems = await getToolListItems({ userId });

  return typedjson({ toolListItems });
};

export default function ToolIndexPage() {
  const { toolListItems } = useTypedLoaderData<typeof loader>();

  const [toDelete, setToDelete] = useState<Tools>();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const fetcher = useFetcher();

  useEffect(() => {
    setToDelete(null);
    setTimeout(() => onClose(), 2000);
  }, [fetcher.data, onClose]);

  const handleOpenModal = (id: number) => {
    setToDelete(toolListItems.find((material) => material.id === id));
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
      <Link to="new">
        <Button
          color="success"
          disableRipple
          startContent={<PlusCircleIcon className="h-6 w-6" />}
          variant="shadow"
          className="text-white"
        >
          Nueva herramienta
        </Button>
      </Link>

      <Spacer y={4} />

      <Table layout="fixed" aria-label="Lista de herramientas">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>CANTIDAD</TableColumn>
          <TableColumn>PRECIO UNITARIO</TableColumn>
          <TableColumn>PRECIO TOTAL</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {toolListItems.map(
            ({ id, name, quantity, unitPrice, totalPrice }) => (
              <TableRow key={id}>
                <TableCell>{name}</TableCell>
                <TableCell>{formatInt(quantity)}</TableCell>
                <TableCell>{formatCurrency(unitPrice)}</TableCell>
                <TableCell>{formatCurrency(totalPrice)}</TableCell>
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
            )
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🗑️ Eliminar herramienta
              </ModalHeader>
              <ModalBody>
                {fetcher.data && <p>{fetcher.data.message}</p>}
                {toDelete && (
                  <>
                    <p>Confirma que deseas eliminar la herramienta:</p>
                    <p>
                      Nombre: <strong>{toDelete?.name}</strong>
                    </p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {fetcher.state === "idle" && toDelete && (
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
