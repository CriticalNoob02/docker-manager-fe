"use client";

import type { SwarmTask } from "@/shared/services/swarm";
import clsx from "clsx";

const stateColors: Record<string, string> = {
  running: "bg-green-900/40 text-green-400 border-green-800",
  complete: "bg-zinc-800 text-zinc-400 border-zinc-700",
  failed: "bg-red-900/40 text-red-400 border-red-800",
  shutdown: "bg-zinc-800 text-zinc-500 border-zinc-700",
  rejected: "bg-red-900/40 text-red-400 border-red-800",
  starting: "bg-blue-900/40 text-blue-400 border-blue-800",
  preparing: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
};

export function TaskList({ tasks }: { tasks: SwarmTask[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-zinc-500 py-4">Nenhuma task encontrada.</p>;
  }

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 border-b border-zinc-800">
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Slot</th>
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Node</th>
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Estado</th>
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Desejado</th>
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Imagem</th>
            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Erro</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
              <td className="px-4 py-3 text-zinc-300 tabular-nums">{task.slot || "—"}</td>
              <td className="px-4 py-3 text-zinc-300">{task.nodeHostname || task.nodeId?.substring(0, 12) || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-xs border capitalize",
                    stateColors[task.state] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}
                >
                  {task.state}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500 text-xs capitalize">{task.desiredState}</td>
              <td className="px-4 py-3 text-zinc-500 font-mono text-xs max-w-[200px] truncate" title={task.image}>
                {task.image.split("@")[0]}
              </td>
              <td className="px-4 py-3 text-red-400 text-xs">{task.error ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
