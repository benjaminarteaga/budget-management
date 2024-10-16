import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import type { LoaderArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import type { Prisma } from "@prisma/client";

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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@nextui-org/react";

import { PencilIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { requireUserId } from "~/session.server";
import {
  getBudgetResults,
  getBudgetListItems,
  type getBudgetItem,
  getBudgetStatusList,
} from "~/models/budget.server";

import BudgetDetail from "~/components/BudgetDetail";

import { formatCurrency, formatInt } from "~/utils";

export type BudgetItemType = Prisma.PromiseReturnType<typeof getBudgetItem>;

export type BudgetResultsType = Prisma.PromiseReturnType<
  typeof getBudgetResults
>;

export type BudgetWithRelations = BudgetItemType & {
  result: Omit<BudgetResultsType[number], "budgetId">;
};

type ChangeStatusParams = {
  budgetId: number;
  statusId: number;
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const budgetListItems = await getBudgetListItems({ userId });
  const budgetStatusList = await getBudgetStatusList();
  const budgetResults = await getBudgetResults({ userId });

  const budgets = budgetListItems.map((budget) => {
    const defaultResult = {
      budgetId: budget.id,
      salesPrice: budget.salesPrice,
      totalMaterialCost: 0,
      totalToolAssigned: 0,
      profit: 0,
    };

    const { budgetId, ...resultWithoutBudgetId } =
      budgetResults.find((result) => result.budgetId === budget.id) ||
      defaultResult;

    return {
      ...budget,
      result: resultWithoutBudgetId,
    };
  });

  return typedjson({ budgets, budgetStatusList });
};

export default function BudgetIndexPage() {
  const { budgets, budgetStatusList } = useTypedLoaderData<typeof loader>();

  const [detail, setDetail] = useState<BudgetWithRelations | null>();

  const [toDelete, setToDelete] = useState<BudgetWithRelations | null>();

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterValue, setFilterValue] = useState("");

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

    setDetail(budgets.find((budget) => budget.id === id));
  };

  const handleOpenModal = (id: number) => {
    setToDelete(budgets.find((budget) => budget.id === id));
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

  const handleChangeStatus = ({ budgetId, statusId }: ChangeStatusParams) => {
    fetcher.submit(
      { statusId: statusId },
      {
        method: "post",
        action: `status/${budgetId}`,
        encType: "application/json",
      }
    );
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

  const filteredBudgets = useMemo(() => {
    let filteredItems = [...budgets];

    if (hasSearchFilter) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredItems;
  }, [budgets, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredBudgets.length / rowsPerPage);

  const budgetListPage = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredBudgets.slice(start, end);
  }, [page, rowsPerPage, filteredBudgets]);

  const rowsOptions = [
    { value: 5 },
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 50 },
  ];

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
                      {budgetListPage.length} de {filteredBudgets.length}
                    </span>{" "}
                    presupuestos
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
              {budgetListPage.map(
                ({ id, name, materials, salesPrice, status, result }) => {
                  const materialsArray = materials.map((material) => ({
                    name: material.material.name,
                    quantity: material.quantity,
                  }));

                  const chipColor = STATUS_COLOR[status.id - 1];

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
                        {formatCurrency(
                          result.totalMaterialCost + result.totalToolAssigned
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(salesPrice)}
                      </TableCell>
                      <TableCell className="text-end text-green-500">
                        {formatCurrency(result.profit)}
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Chip
                              radius="full"
                              variant="flat"
                              color={chipColor}
                              className="outline-none transition-transform"
                              as="button"
                            >
                              {status.name}
                            </Chip>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Profile Actions"
                            variant="flat"
                          >
                            {budgetStatusList.map((status) => (
                              <DropdownItem
                                key={status.id}
                                className="group outline-none data-[hover=true]:bg-transparent"
                              >
                                <Chip
                                  radius="full"
                                  variant="flat"
                                  color={STATUS_COLOR[status.id - 1]}
                                  className="outline-none transition-all group-hover:px-6"
                                  as="button"
                                  onClick={() =>
                                    handleChangeStatus({
                                      budgetId: id,
                                      statusId: status.id,
                                    })
                                  }
                                >
                                  {status.name}
                                </Chip>
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
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
                }
              )}
            </TableBody>
          </Table>
        </div>

        <div className={detail ? "show flex-[30%]" : "hide"} id="two">
          {detail && <BudgetDetail data={detail} />}
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {() => (
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

const STATUS_COLOR: Status[] = ["primary", "success", "danger"];

type Status = "primary" | "success" | "danger";
