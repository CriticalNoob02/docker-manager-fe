"use client";

import type { SwarmNode } from "@/shared/services/swarm";
import clsx from "clsx";
import { Crown, Trash2 } from "lucide-react";
import { useRemoveNode, useUpdateNode } from "../hooks/useSwarm";
import { useToast } from "@/shared/hooks/useToast";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useState } from "react";

const availabilityColors: Record<string, string> = {
  active: "bg-green-900/40 text-green-400 border-green-800",
  pause: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  drain: "bg-red-900/40 text-red-400 border-red-800",
};

const statusColors: Record<string, string> = {
  ready: "bg-green-500",
  down: "bg-red-500",
  disconnected: "bg-zinc-500",
};

export function NodeTable({ nodes }: { nodes: SwarmNode[] }) {
  const { toast } = useToast();
  const updateNode = useUpdateNode();
  const removeNode = useRemoveNode();
  const [pendingRemove, setPendingRemove] = useState<SwarmNode | null>(null);

  function handleDrain(node: SwarmNode) {
    updateNode.mutate(
      { id: node.id, role: node.role as "manager" | "worker", availability: "drain" },
      { onSuccess: () => toast({ title: `Node ${node.hostname} em drain` }) }
    );
  }

  function handleActivate(node: SwarmNode) {
    updateNode.mutate(
      { id: node.id, role: node.role as "manager" | "worker", availability: "active" },
      { onSuccess: () => toast({ title: `Node ${node.hostname} ativo` }) }
    );
  }

  function confirmRemove(node: SwarmNode) {
    setPendingRemove(node);
  }

  function handleRemoveConfirm() {
    if (!pendingRemove) return;
    removeNode.mutate(pendingRemove.id, {
      onSuccess: () => toast({ title: `Node ${pendingRemove.hostname} removido` }),
    });
    setPendingRemove(null);
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Hostname</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Disponibilidade</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Endereço</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Engine</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                  {node.leader && <Crown className="w-3.5 h-3.5 text-yellow-400" aria-label="Leader" />}
                  {node.hostname}
                </td>
                <td className="px-4 py-3 text-zinc-300 capitalize">{node.role}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={clsx("inline-block w-2 h-2 rounded-full", statusColors[node.status] ?? "bg-zinc-500")}
                    />
                    <span className="text-zinc-300 capitalize">{node.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs border capitalize",
                      availabilityColors[node.availability] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}
                  >
                    {node.availability}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{node.addr}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{node.engineVersion}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {node.availability !== "drain" ? (
                      <button
                        onClick={() => handleDrain(node)}
                        className="text-xs text-yellow-500 hover:text-yellow-300 transition-colors"
                      >
                        Drain
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(node)}
                        className="text-xs text-green-500 hover:text-green-300 transition-colors"
                      >
                        Ativar
                      </button>
                    )}
                    {!node.leader && (
                      <button
                        onClick={() => confirmRemove(node)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
        title="Remover node"
        description={`Remover o node "${pendingRemove?.hostname}" do cluster?`}
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
