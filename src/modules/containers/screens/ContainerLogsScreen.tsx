"use client";

import { useContainerLogs } from "../hooks/useContainerLogs";
import { LogViewer } from "../components/LogViewer";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  containerId: string;
}

export function ContainerLogsScreen({ containerId }: Props) {
  const { lines, clear } = useContainerLogs(containerId);

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/containers"
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">Logs</h1>
            <p className="text-xs text-zinc-500 font-mono">{containerId.substring(0, 12)}</p>
          </div>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-md transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Limpar
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <LogViewer lines={lines} />
      </div>
    </div>
  );
}
