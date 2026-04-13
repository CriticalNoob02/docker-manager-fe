"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { VolumeInspectInfo } from "dockerode";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useRemoveVolume } from "../hooks/useVolumes";
import { useToast } from "@/shared/hooks/useToast";

interface Props {
  data: VolumeInspectInfo[];
}

export function VolumeTable({ data }: Props) {
  const [confirmName, setConfirmName] = useState<string | null>(null);
  const { mutate } = useRemoveVolume();
  const { toast } = useToast();

  const handleRemove = () => {
    if (!confirmName) return;
    mutate(confirmName, {
      onSuccess: () => toast({ title: "Volume removido", variant: "success" }),
      onError: () => toast({ title: "Erro ao remover volume", variant: "error" }),
    });
    setConfirmName(null);
  };

  const columns = useMemo<ColumnDef<VolumeInspectInfo>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "Name",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-zinc-100 max-w-[240px] block truncate">
            {getValue<string>()}
          </span>
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
        header: "Mountpoint",
        accessorKey: "Mountpoint",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-zinc-500 max-w-[280px] block truncate">
            {getValue<string>()}
          </span>
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
        header: "Criado",
        accessorKey: "CreatedAt",
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
        cell: ({ row }) => (
          <button
            onClick={() => setConfirmName(row.original.Name)}
            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ),
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
        open={!!confirmName}
        onOpenChange={(open) => !open && setConfirmName(null)}
        title="Remover volume"
        description={`Tem certeza que deseja remover o volume "${confirmName}"? Os dados armazenados serão perdidos permanentemente.`}
        confirmLabel="Remover"
        onConfirm={handleRemove}
      />
    </>
  );
}
