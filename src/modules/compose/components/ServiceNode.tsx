"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Container } from "lucide-react";

interface ServiceNodeData {
  label: string;
  image?: string;
  ports?: string[];
  status?: string;
}

const STATUS: Record<
  string,
  { dot: string; ring: string; label: string; bg: string }
> = {
  running: {
    dot: "bg-green-400",
    ring: "ring-green-500/30",
    label: "running",
    bg: "bg-green-500/10",
  },
  exited: {
    dot: "bg-red-400",
    ring: "ring-red-500/30",
    label: "exited",
    bg: "bg-red-500/10",
  },
  paused: {
    dot: "bg-yellow-400",
    ring: "ring-yellow-500/30",
    label: "paused",
    bg: "bg-yellow-500/10",
  },
};

const UNKNOWN = {
  dot: "bg-zinc-500",
  ring: "ring-zinc-600/20",
  label: "not deployed",
  bg: "bg-zinc-800/60",
};

export function ServiceNode({ data, selected }: NodeProps) {
  const d = data as unknown as ServiceNodeData;
  const s = STATUS[d.status ?? ""] ?? UNKNOWN;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#52525b", border: "2px solid #3f3f46", width: 8, height: 8 }}
      />

      <div
        className={`
          relative rounded-xl border border-zinc-700/60 bg-zinc-900
          shadow-xl ring-1 ${s.ring}
          ${selected ? "border-blue-500/60" : ""}
          transition-all duration-150
          min-w-[190px] max-w-[220px]
          overflow-hidden
        `}
      >
        {/* Header stripe */}
        <div className={`${s.bg} px-3 pt-2.5 pb-2 flex items-center gap-2`}>
          <Container className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-mono text-sm font-semibold text-zinc-100 truncate leading-tight">
            {d.label}
          </span>
          <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
        </div>

        {/* Body */}
        <div className="px-3 py-2 flex flex-col gap-1 border-t border-zinc-800">
          {d.image && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">image</span>
              <span className="text-xs text-zinc-400 font-mono truncate">{d.image}</span>
            </div>
          )}
          {d.ports && d.ports.length > 0 && (
            <div className="flex items-start gap-1.5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium shrink-0">ports</span>
              <span className="text-xs text-blue-400/80 font-mono truncate">
                {d.ports.join(" · ")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">status</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${
              d.status === "running" ? "text-green-400" :
              d.status === "exited"  ? "text-red-400" :
              d.status === "paused"  ? "text-yellow-400" :
              "text-zinc-500"
            }`}>
              {s.label}
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#52525b", border: "2px solid #3f3f46", width: 8, height: 8 }}
      />
    </>
  );
}
