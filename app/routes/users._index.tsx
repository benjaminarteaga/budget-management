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

import { type getUserById, getUserListItems } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const userListItems = await getUserListItems();

  return typedjson({ userListItems });
};

export type User = Prisma.PromiseReturnType<typeof getUserById>;

export default function UsersIndexPage() {
  const { userListItems } = useTypedLoaderData<typeof loader>();

  const [toDelete, setToDelete] = useState<User>();

  const fetcher = useFetcher();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    setToDelete(null);
    setTimeout(() => onClose(), 2000);
  }, [fetcher.data, onClose]);

  const handleOpenModal = (id: number) => {
    setToDelete(userListItems.find((user) => user.id === id));
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
    <div className="mx-auto max-w-screen-md">
      <Link to="new">
        <Button
          color="success"
          disableRipple
          startContent={<PlusCircleIcon className="h-6 w-6" />}
          variant="shadow"
          className="text-white"
        >
          Nuevo usuario
        </Button>
      </Link>

      <Spacer y={4} />

      <Table layout="fixed" aria-label="Lista de materiales">
        <TableHeader>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>FECHA DE CREACION</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {userListItems.map(({ id, email, createdAt }) => (
            <TableRow key={id}>
              <TableCell>{email}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("es-CL").format(new Date(createdAt))}
              </TableCell>
              <TableCell>
                <Link to={`edit/${id}`}>
                  <Button isIconOnly color="success" size="sm" className="mr-2">
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
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🗑️ Eliminar usuario
              </ModalHeader>
              <ModalBody>
                {fetcher.data && <p>{fetcher.data.message}</p>}
                {toDelete && (
                  <>
                    <p>Confirma que deseas eliminar el presupuesto:</p>
                    <p>
                      Email: <strong>{toDelete?.email}</strong>
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
    </div>
  );
}
