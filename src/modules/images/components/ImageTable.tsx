"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { ImageInfo } from "dockerode";
import { Trash2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useRemoveImage } from "../hooks/useImages";
import { useToast } from "@/shared/hooks/useToast";
import { RunContainerModal } from "./RunContainerModal";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

interface Props {
  data: ImageInfo[];
}

export function ImageTable({ data }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [runImage, setRunImage] = useState<string | null>(null);
  const { mutate } = useRemoveImage();
  const { toast } = useToast();

  const handleRemove = () => {
    if (!confirmId) return;
    mutate(confirmId, {
      onSuccess: () => toast({ title: "Imagem removida", variant: "success" }),
      onError: () => toast({ title: "Erro ao remover imagem", variant: "error" }),
    });
    setConfirmId(null);
  };

  const columns = useMemo<ColumnDef<ImageInfo>[]>(
    () => [
      {
        header: "Repositório",
        accessorFn: (row) => row.RepoTags?.[0]?.split(":")?.[0] ?? "<none>",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-zinc-100">{getValue<string>()}</span>
        ),
      },
      {
        header: "Tag",
        accessorFn: (row) => row.RepoTags?.[0]?.split(":")?.[1] ?? "<none>",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-zinc-400">{getValue<string>()}</span>
        ),
      },
      {
        header: "ID",
        accessorFn: (row) => row.Id.replace("sha256:", "").substring(0, 12),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-zinc-500">{getValue<string>()}</span>
        ),
      },
      {
        header: "Tamanho",
        accessorKey: "Size",
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-400">{formatBytes(getValue<number>())}</span>
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
        cell: ({ row }) => {
          const tag = row.original.RepoTags?.[0] ?? row.original.Id.replace("sha256:", "").substring(0, 12);
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRunImage(tag)}
                className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-green-400 transition-colors"
                title="Executar container"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConfirmId(row.original.Id)}
                className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remover imagem"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
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
        title="Remover imagem"
        description="Tem certeza que deseja remover esta imagem? Containers usando-a não serão afetados."
        confirmLabel="Remover"
        onConfirm={handleRemove}
      />

      {runImage && (
        <RunContainerModal
          open={!!runImage}
          onOpenChange={(open) => !open && setRunImage(null)}
          image={runImage}
        />
      )}
    </>
  );
}
