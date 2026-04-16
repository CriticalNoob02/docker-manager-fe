"use client";

import type { SwarmService } from "@/shared/services/swarm";
import clsx from "clsx";
import { Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { useRemoveService, useScaleService } from "../hooks/useSwarm";
import { useToast } from "@/shared/hooks/useToast";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useState } from "react";
import Link from "next/link";

export function ServiceTable({ services }: { services: SwarmService[] }) {
  const { toast } = useToast();
  const scaleService = useScaleService();
  const removeService = useRemoveService();
  const [pendingRemove, setPendingRemove] = useState<SwarmService | null>(null);

  function handleScale(service: SwarmService, delta: number) {
    const current = service.replicas ?? 0;
    const next = Math.max(0, current + delta);
    scaleService.mutate(
      { id: service.id, replicas: next },
      { onSuccess: () => toast({ title: `${service.name}: ${next} réplicas` }) }
    );
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Imagem</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Modo</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Réplicas</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Portas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{svc.name}</td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs max-w-[200px] truncate" title={svc.image}>
                  {svc.image.split("@")[0]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs border capitalize",
                      svc.mode === "global"
                        ? "bg-purple-900/40 text-purple-400 border-purple-800"
                        : "bg-blue-900/40 text-blue-400 border-blue-800"
                    )}
                  >
                    {svc.mode}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {svc.mode === "replicated" ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "font-medium tabular-nums",
                          svc.running === svc.replicas ? "text-green-400" : "text-yellow-400"
                        )}
                      >
                        {svc.running}/{svc.replicas}
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleScale(svc, -1)}
                          disabled={scaleService.isPending}
                          className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleScale(svc, 1)}
                          disabled={scaleService.isPending}
                          className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-500">global</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {svc.ports.length > 0
                    ? svc.ports.map((p) => `${p.publishedPort}:${p.targetPort}`).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/swarm/services/${svc.id}`}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setPendingRemove(svc)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingRemove}
        onOpenChange={(open) => { if (!open) setPendingRemove(null); }}
        title="Remover serviço"
        description={`Remover o serviço "${pendingRemove?.name}" do Swarm?`}
        onConfirm={() => {
          if (pendingRemove) {
            removeService.mutate(pendingRemove.id, {
              onSuccess: () => toast({ title: `Serviço ${pendingRemove.name} removido` }),
            });
          }
          setPendingRemove(null);
        }}
      />
    </>
  );
}
