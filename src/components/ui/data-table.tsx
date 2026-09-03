"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/ui/cn";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  card?: boolean;
  className?: string;
  numeric?: boolean;
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  renderCardTitle: (row: T) => ReactNode;
  renderCardStatus?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  action?: ReactNode;
  pageSize?: number;
  className?: string;
}

function paginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", totalPages] as const;
  if (currentPage >= totalPages - 2)
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages] as const;
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ] as const;
}

export function DataTable<T>({
  title,
  data,
  columns,
  getRowId,
  renderCardTitle,
  renderCardStatus,
  onRowClick,
  toolbar,
  action,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = useMemo(
    () => data.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, data, pageSize],
  );
  const start = data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, data.length);
  const cardColumns = columns.filter((column) => column.card !== false);

  function activateRow(row: T) {
    onRowClick?.(row);
  }

  return (
    <section
      data-slot="data-table"
      className={cn(
        "overflow-hidden rounded-app border border-border bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-xl leading-7 font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-4 text-muted">
            {data.length} registro{data.length === 1 ? "" : "s"}
          </p>
        </div>
        {action}
      </div>
      {toolbar ? (
        <div
          data-slot="data-table-toolbar"
          className="border-b border-border px-5 py-3"
        >
          {toolbar}
        </div>
      ) : null}
      <div className="hidden overflow-x-auto lg:block">
        <table>
          <caption className="sr-only">{title}</caption>
          <thead className="bg-surface-subtle">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs leading-4 font-semibold text-muted",
                    column.numeric && "text-right",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowId(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => activateRow(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          activateRow(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-t border-border text-sm text-foreground",
                  onRowClick &&
                    "cursor-pointer hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-3 align-middle",
                      column.numeric && "text-right tabular-nums",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden sm:grid-cols-2">
        {rows.map((row) => (
          <article
            key={getRowId(row)}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => activateRow(row) : undefined}
            onKeyDown={
              onRowClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activateRow(row);
                    }
                  }
                : undefined
            }
            className={cn(
              "rounded-app border border-border p-4",
              onRowClick &&
                "cursor-pointer hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-foreground">
                {renderCardTitle(row)}
              </h3>
              {renderCardStatus?.(row)}
            </div>
            <dl className="mt-4 grid gap-3">
              {cardColumns.map((column) => (
                <div key={column.id} className="grid gap-1">
                  <dt className="text-xs leading-4 text-muted">
                    {column.header}
                  </dt>
                  <dd
                    className={cn(
                      "text-sm text-foreground",
                      column.numeric && "tabular-nums",
                    )}
                  >
                    {column.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs leading-4 text-muted" aria-live="polite">
          Mostrando {start}–{end} de {data.length} registros
        </p>
        <nav
          aria-label="Paginação da tabela"
          className="flex items-center gap-1"
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Página anterior"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {paginationItems(currentPage, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="grid size-8 place-items-center text-muted"
              >
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <Button
                key={item}
                variant={item === currentPage ? "primary" : "ghost"}
                size="icon"
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`Página ${item}`}
                onClick={() => setPage(item)}
              >
                {item}
              </Button>
            ),
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próxima página"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      </footer>
    </section>
  );
}
