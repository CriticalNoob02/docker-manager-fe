"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { HardDrive } from "lucide-react";

interface VolumeNodeData {
  label: string;
}

export function VolumeNode({ data, selected }: NodeProps) {
  const d = data as unknown as VolumeNodeData;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#7c3aed", border: "2px solid #6d28d9", width: 8, height: 8 }}
      />

      <div
        className={`
          rounded-xl border border-purple-700/40 bg-purple-950/50
          shadow-xl ring-1 ring-purple-500/20
          ${selected ? "border-purple-400/60" : ""}
          min-w-[160px] max-w-[190px]
          overflow-hidden
        `}
      >
        <div className="bg-purple-500/10 px-3 py-2.5 flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-mono text-sm font-semibold text-purple-200 truncate">
            {d.label}
          </span>
        </div>
        <div className="px-3 py-1.5 border-t border-purple-800/40">
          <span className="text-[10px] text-purple-500 uppercase tracking-wider font-medium">volume</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#7c3aed", border: "2px solid #6d28d9", width: 8, height: 8 }}
      />
    </>
  );
}
