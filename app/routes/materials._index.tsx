import { useState } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";

import type { Prisma } from "@prisma/client";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

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
import {
  type getMaterialItem,
  getMaterialListItems,
} from "~/models/material.server";

import { formatCurrency, formatInt } from "~/utils";

export type Materials = Prisma.PromiseReturnType<typeof getMaterialItem>;

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const materialListItems = await getMaterialListItems({ userId });

  return typedjson(materialListItems);
};

export default function MaterialIndexPage() {
  const data = useTypedLoaderData<typeof loader>();

  const [toDelete, setToDelete] = useState<Materials>();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const fetcher = useFetcher();

  const handleOpenModal = (id: number) => {
    setToDelete(data.find((material) => material.id === id));
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
          Nuevo material
        </Button>
      </Link>

      <Spacer y={4} />

      <Table layout="fixed" aria-label="Lista de materiales">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>STOCK</TableColumn>
          <TableColumn>CANTIDAD INICIAL</TableColumn>
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>PRECIO UNITARIO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.name}</TableCell>
              <TableCell>{formatInt(material.stock)}</TableCell>
              <TableCell>{formatInt(material.quantity)}</TableCell>
              <TableCell>{formatCurrency(material.price)}</TableCell>
              <TableCell>{formatCurrency(material.unitPrice)}</TableCell>
              <TableCell>
                <Link to={`edit/${material.id}`}>
                  <Button isIconOnly color="success" size="sm" className="mr-2">
                    <PencilIcon className={"h-4 w-4 text-white"} />
                  </Button>
                </Link>

                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  onClick={() => handleOpenModal(material.id)}
                >
                  <TrashIcon className={"h-4 w-4"} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🗑️ Eliminar material
              </ModalHeader>
              <ModalBody>
                {fetcher.data && <p>{fetcher.data.message}</p>}
                {toDelete && (
                  <>
                    <p>Confirma que deseas eliminar el material:</p>
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
