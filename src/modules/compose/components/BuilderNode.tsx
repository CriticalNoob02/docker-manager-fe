"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Container, Pencil } from "lucide-react";

export interface HealthcheckConfig {
  test: string;        // e.g. "curl -f http://localhost"
  interval: string;    // e.g. "30s"
  timeout: string;     // e.g. "10s"
  retries: string;     // e.g. "3"
  startPeriod: string; // e.g. "40s"
}

export interface DeployConfig {
  replicas: string;  // e.g. "2"
  memLimit: string;  // e.g. "512m"
  cpus: string;      // e.g. "0.5"
}

export interface BuilderNodeData {
  // ── Basic ──────────────────────────────────────────────────────────────────
  name: string;
  image: string;
  ports: string[];
  environment: string[];
  volumes: string[];
  command: string;
  // ── Advanced ───────────────────────────────────────────────────────────────
  build: string;               // build context path (replaces or supplements image)
  profiles: string[];          // docker compose profiles
  restart: string;             // no | always | unless-stopped | on-failure
  containerName: string;       // explicit container_name override
  hostname: string;
  labels: string[];            // KEY=value pairs
  healthcheck: HealthcheckConfig;
  deploy: DeployConfig;
  // ── Internal ───────────────────────────────────────────────────────────────
  containerId?: string;        // source container, if dragged from panel
  onEdit: (id: string) => void;
}

export function BuilderNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as BuilderNodeData;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#52525b", border: "2px solid #3f3f46", width: 8, height: 8 }}
      />

      <div
        className={`
          rounded-xl border bg-zinc-900 shadow-xl
          min-w-[200px] max-w-[240px] overflow-hidden
          transition-all duration-100
          ${selected ? "border-blue-500/70 ring-1 ring-blue-500/30" : "border-zinc-700/60"}
        `}
      >
        {/* Header */}
        <div className="bg-zinc-800/80 px-3 pt-2.5 pb-2 flex items-center gap-2">
          <Container className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-mono text-sm font-semibold text-zinc-100 truncate flex-1">
            {d.name}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); d.onEdit(id); }}
            className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Editar serviço"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2 flex flex-col gap-1 border-t border-zinc-800 text-xs">
          {/* image / build */}
          {d.image ? (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium shrink-0">image</span>
              <span className="text-zinc-400 font-mono truncate">{d.image}</span>
            </div>
          ) : d.build ? (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium shrink-0">build</span>
              <span className="text-purple-400/70 font-mono truncate">{d.build}</span>
            </div>
          ) : (
            <span className="text-zinc-600 italic">sem imagem</span>
          )}

          {/* ports */}
          {d.ports.filter(Boolean).length > 0 && (
            <div className="flex items-start gap-1.5">
              <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium shrink-0">ports</span>
              <span className="text-blue-400/70 font-mono truncate">
                {d.ports.filter(Boolean).join(" · ")}
              </span>
            </div>
          )}

          {/* env */}
          {d.environment.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium">env</span>
              <span className="text-yellow-400/60">{d.environment.filter(Boolean).length} vars</span>
            </div>
          )}

          {/* profiles badge */}
          {d.profiles?.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {d.profiles.filter(Boolean).map((p) => (
                <span
                  key={p}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-700/40 text-violet-300"
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* restart badge */}
          {d.restart && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-600 uppercase tracking-wider text-[10px] font-medium shrink-0">restart</span>
              <span className="text-orange-400/70 text-[10px] font-mono">{d.restart}</span>
            </div>
          )}
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
