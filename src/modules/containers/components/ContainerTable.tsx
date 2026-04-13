"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import type { ContainerWithMeta } from "@/shared/services/containers";
import { ContainerStatusBadge } from "./ContainerStatusBadge";
import { ContainerActionsMenu } from "./ContainerActionsMenu";
import { DescriptionCell } from "./DescriptionCell";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  data: ContainerWithMeta[];
}

export function ContainerTable({ data }: Props) {
  const columns = useMemo<ColumnDef<ContainerWithMeta>[]>(
    () => [
      {
        header: "Nome",
        accessorFn: (row) => row.Names[0]?.replace(/^\//, "") ?? row.Id.substring(0, 12),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-zinc-100">{getValue<string>()}</span>
        ),
      },
      {
        header: "Imagem",
        accessorKey: "Image",
        cell: ({ getValue }) => (
          <span className="text-sm text-zinc-400 font-mono truncate max-w-[200px] block">{getValue<string>()}</span>
        ),
      },
      {
        header: "Status",
        accessorKey: "State",
        cell: ({ getValue }) => <ContainerStatusBadge state={getValue<string>()} />,
      },
      {
        header: "Portas",
        accessorFn: (row) =>
          row.Ports?.filter((p) => p.PublicPort)
            .map((p) => `${p.PublicPort}→${p.PrivatePort}`)
            .join(", ") || "—",
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-500 font-mono">{getValue<string>()}</span>
        ),
      },
      {
        header: "Descrição",
        accessorKey: "description",
        cell: ({ row }) => (
          <DescriptionCell
            containerId={row.original.Id}
            value={row.original.description}
          />
        ),
      },
      {
        header: "Criado",
        accessorKey: "Created",
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date((getValue<number>()) * 1000), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ContainerActionsMenu
            id={row.original.Id}
            name={row.original.Names[0]?.replace(/^\//, "") ?? row.original.Id.substring(0, 12)}
            state={row.original.State}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-zinc-800 bg-zinc-900/50">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
