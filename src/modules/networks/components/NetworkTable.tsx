"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { NetworkInspectInfo } from "dockerode";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useRemoveNetwork } from "../hooks/useNetworks";
import { useToast } from "@/shared/hooks/useToast";
import clsx from "clsx";

// Networks that cannot be removed
const SYSTEM_NETWORKS = ["bridge", "host", "none"];

interface Props {
  data: NetworkInspectInfo[];
}

export function NetworkTable({ data }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState<string>("");
  const { mutate } = useRemoveNetwork();
  const { toast } = useToast();

  const handleRemoveClick = (id: string, name: string) => {
    setConfirmId(id);
    setConfirmName(name);
  };

  const handleRemove = () => {
    if (!confirmId) return;
    mutate(confirmId, {
      onSuccess: () => toast({ title: "Rede removida", variant: "success" }),
      onError: () => toast({ title: "Erro ao remover rede", variant: "error" }),
    });
    setConfirmId(null);
  };

  const columns = useMemo<ColumnDef<NetworkInspectInfo>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "Name",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-zinc-100">{getValue<string>()}</span>
        ),
      },
      {
        header: "Driver",
        accessorKey: "Driver",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-zinc-400">{getValue<string>()}</span>
        ),
      },
      {
        header: "Escopo",
        accessorKey: "Scope",
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-400 capitalize">{getValue<string>()}</span>
        ),
      },
      {
        header: "Containers",
        accessorFn: (row) => Object.keys(row.Containers ?? {}).length,
        cell: ({ getValue }) => {
          const count = getValue<number>();
          return (
            <span className={clsx("text-xs font-mono", count > 0 ? "text-green-400" : "text-zinc-600")}>
              {count}
            </span>
          );
        },
      },
      {
        header: "Subnet",
        accessorFn: (row) => row.IPAM?.Config?.[0]?.Subnet ?? "—",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-zinc-500">{getValue<string>()}</span>
        ),
      },
      {
        header: "Criado",
        accessorKey: "Created",
        cell: ({ getValue }) => {
          const val = getValue<string | undefined>();
          if (!val) return <span className="text-xs text-zinc-600">—</span>;
          try {
            return (
              <span className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(val), { addSuffix: true, locale: ptBR })}
              </span>
            );
          } catch {
            return <span className="text-xs text-zinc-600">—</span>;
          }
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isSystem = SYSTEM_NETWORKS.includes(row.original.Name ?? "");
          return (
            <button
              onClick={() => handleRemoveClick(row.original.Id!, row.original.Name!)}
              disabled={isSystem}
              title={isSystem ? "Redes de sistema não podem ser removidas" : "Remover"}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <>
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

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Remover rede"
        description={`Tem certeza que deseja remover a rede "${confirmName}"? Containers conectados serão desconectados.`}
        confirmLabel="Remover"
        onConfirm={handleRemove}
      />
    </>
  );
}
