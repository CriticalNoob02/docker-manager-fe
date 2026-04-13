"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Play, Square, RotateCcw, Trash2, FileText, BarChart2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useContainerAction } from "../hooks/useContainerAction";
import { useToast } from "@/shared/hooks/useToast";

interface Props {
  id: string;
  name: string;
  state: string;
}

export function ContainerActionsMenu({ id, name, state }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useContainerAction();
  const { toast } = useToast();

  const isRunning = state === "running";

  const run = (action: "start" | "stop" | "restart") => {
    mutate(
      { id, action },
      {
        onSuccess: () => toast({ title: `Container ${action === "start" ? "iniciado" : action === "stop" ? "parado" : "reiniciado"}`, variant: "success" }),
        onError: () => toast({ title: "Erro ao executar ação", variant: "error" }),
      }
    );
  };

  const handleRemove = () => {
    mutate(
      { id, action: "remove" },
      {
        onSuccess: () => toast({ title: "Container removido", variant: "success" }),
        onError: () => toast({ title: "Erro ao remover container", variant: "error" }),
      }
    );
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={isPending}
            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[160px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-1"
            side="bottom"
            align="end"
          >
            {!isRunning && (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded cursor-pointer outline-none"
                onSelect={() => run("start")}
              >
                <Play className="w-3.5 h-3.5 text-green-400" />
                Iniciar
              </DropdownMenu.Item>
            )}
            {isRunning && (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded cursor-pointer outline-none"
                onSelect={() => run("stop")}
              >
                <Square className="w-3.5 h-3.5 text-yellow-400" />
                Parar
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded cursor-pointer outline-none"
              onSelect={() => run("restart")}
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              Reiniciar
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-zinc-700" />

            <DropdownMenu.Item asChild>
              <Link
                href={`/containers/${id}/logs`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded cursor-pointer outline-none"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                Logs
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href={`/containers/${id}/stats`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded cursor-pointer outline-none"
              >
                <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
                Stats
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-zinc-700" />

            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded cursor-pointer outline-none"
              onSelect={() => setConfirmOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover container"
        description={`Tem certeza que deseja remover o container "${name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={handleRemove}
      />
    </>
  );
}
