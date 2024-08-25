import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import type { LoaderArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import type { Prisma } from "@prisma/client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterValue, setFilterValue] = useState("");

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

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const filteredTools = useMemo(() => {
    let filteredItems = [...toolListItems];

    if (hasSearchFilter) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredItems;
  }, [toolListItems, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredTools.length / rowsPerPage);

  const toolListPage = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredTools.slice(start, end);
  }, [page, rowsPerPage, filteredTools]);

  const rowsOptions = [
    { value: 5 },
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 50 },
  ];

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

      <Table
        layout="fixed"
        aria-label="Lista de herramientas"
        topContent={
          <div className="flex flex-col gap-4">
            <Input
              isClearable
              className="w-max"
              placeholder="Buscar por nombre..."
              startContent={<MagnifyingGlassIcon className={"h-4 w-4"} />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />

            <div className="flex items-end justify-between gap-6">
              <span>
                Mostrando{" "}
                <span className="font-bold">
                  {toolListPage.length} de {filteredTools.length}
                </span>{" "}
                herramientas
              </span>

              <Select
                classNames={{
                  base: "w-max",
                  label: "mr-6",
                }}
                size="sm"
                label="Items por página"
                placeholder="Selecciona..."
                items={rowsOptions}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setRowsPerPage(+e.target.value);
                }}
                selectedKeys={[String(rowsPerPage)]}
              >
                {({ value }) => (
                  <SelectItem key={value}>{String(value)}</SelectItem>
                )}
              </Select>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex w-full justify-center gap-6">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>CANTIDAD</TableColumn>
          <TableColumn>PRECIO UNITARIO</TableColumn>
          <TableColumn>PRECIO TOTAL</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {toolListPage.map(({ id, name, quantity, unitPrice, totalPrice }) => (
            <TableRow key={id}>
              <TableCell>{name}</TableCell>
              <TableCell>{formatInt(quantity)}</TableCell>
              <TableCell>{formatCurrency(unitPrice)}</TableCell>
              <TableCell>{formatCurrency(totalPrice)}</TableCell>
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
