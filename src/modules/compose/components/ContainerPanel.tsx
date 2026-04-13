"use client";

import { useContainers } from "@/modules/containers/hooks/useContainers";
import { ContainerStatusBadge } from "@/modules/containers/components/ContainerStatusBadge";
import { GripVertical, Plus } from "lucide-react";
import type { ContainerWithMeta } from "@/shared/services/containers";

export interface DraggedContainer {
  id: string;
  name: string;
  image: string;
  ports: string[];
}

function parsePorts(c: ContainerWithMeta): string[] {
  return (c.Ports ?? [])
    .filter((p) => p.PublicPort)
    .map((p) => `${p.PublicPort}:${p.PrivatePort}`);
}

interface Props {
  usedIds: Set<string>;
  onAddBlank: () => void;
}

export function ContainerPanel({ usedIds, onAddBlank }: Props) {
  const { data: containers = [] } = useContainers();

  function onDragStart(e: React.DragEvent, c: ContainerWithMeta) {
    const payload: DraggedContainer = {
      id: c.Id,
      name: c.Names[0]?.replace(/^\//, "") ?? c.Id.substring(0, 12),
      image: c.Image,
      ports: parsePorts(c),
    };
    e.dataTransfer.setData("application/compose-container", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/60 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-3 border-b border-zinc-800 shrink-0">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Containers
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5">Arraste para o canvas</p>
      </div>

      {/* Container list */}
      <div className="flex-1 p-2 flex flex-col gap-1">
        {containers.length === 0 && (
          <p className="text-xs text-zinc-600 italic px-1 mt-2">
            Nenhum container encontrado
          </p>
        )}
        {containers.map((c) => {
          const name = c.Names[0]?.replace(/^\//, "") ?? c.Id.substring(0, 12);
          const alreadyAdded = usedIds.has(c.Id);
          return (
            <div
              key={c.Id}
              draggable={!alreadyAdded}
              onDragStart={(e) => !alreadyAdded && onDragStart(e, c)}
              className={`
                flex items-center gap-2 px-2 py-2 rounded-lg border text-xs
                transition-colors select-none
                ${alreadyAdded
                  ? "border-zinc-800 bg-zinc-900/40 opacity-40 cursor-not-allowed"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/60 cursor-grab active:cursor-grabbing"
                }
              `}
            >
              <GripVertical className="w-3 h-3 text-zinc-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-zinc-200 truncate">{name}</p>
                <p className="text-zinc-600 truncate">{c.Image}</p>
              </div>
              <ContainerStatusBadge state={c.State} />
            </div>
          );
        })}
      </div>

      {/* Add blank service */}
      <div className="p-2 border-t border-zinc-800 shrink-0">
        <button
          onClick={onAddBlank}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Serviço em branco
        </button>
      </div>
    </div>
  );
}
