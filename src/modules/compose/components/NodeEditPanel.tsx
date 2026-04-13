"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import type { BuilderNodeData } from "./BuilderNode";

interface Props {
  nodeId: string;
  data: BuilderNodeData;
  onSave: (id: string, data: Partial<BuilderNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function listToText(arr: string[]) {
  return arr.filter(Boolean).join("\n");
}
function textToList(text: string) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function NodeEditPanel({ nodeId, data, onSave, onDelete, onClose }: Props) {
  const [name, setName]           = useState(data.name);
  const [image, setImage]         = useState(data.image);
  const [ports, setPorts]         = useState(listToText(data.ports));
  const [env, setEnv]             = useState(listToText(data.environment));
  const [volumes, setVolumes]     = useState(listToText(data.volumes));
  const [command, setCommand]     = useState(data.command);

  // Reset when switching nodes
  useEffect(() => {
    setName(data.name);
    setImage(data.image);
    setPorts(listToText(data.ports));
    setEnv(listToText(data.environment));
    setVolumes(listToText(data.volumes));
    setCommand(data.command);
  }, [nodeId, data]);

  function handleSave() {
    onSave(nodeId, {
      name:        name.trim() || data.name,
      image:       image.trim(),
      ports:       textToList(ports),
      environment: textToList(env),
      volumes:     textToList(volumes),
      command:     command.trim(),
    });
  }

  return (
    <div className="w-72 shrink-0 flex flex-col border-l border-zinc-800 bg-zinc-900/80 backdrop-blur overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-100">Editar serviço</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onDelete(nodeId); onClose(); }}
            className="text-zinc-600 hover:text-red-400 transition-colors"
            title="Remover nó"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        <Field label="Nome do serviço">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            className={INPUT}
            placeholder="meu-servico"
          />
        </Field>

        <Field label="Imagem">
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            onBlur={handleSave}
            className={INPUT}
            placeholder="nginx:alpine"
          />
        </Field>

        <Field label="Portas" hint="uma por linha — ex: 8080:80">
          <textarea
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            onBlur={handleSave}
            rows={3}
            className={`${INPUT} resize-none`}
            placeholder={"8080:80\n443:443"}
          />
        </Field>

        <Field label="Variáveis de ambiente" hint="uma por linha — ex: KEY=value">
          <textarea
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            onBlur={handleSave}
            rows={4}
            className={`${INPUT} resize-none`}
            placeholder={"NODE_ENV=production\nPORT=3000"}
          />
        </Field>

        <Field label="Volumes" hint="uma por linha — ex: ./data:/data">
          <textarea
            value={volumes}
            onChange={(e) => setVolumes(e.target.value)}
            onBlur={handleSave}
            rows={3}
            className={`${INPUT} resize-none`}
            placeholder="./data:/app/data"
          />
        </Field>

        <Field label="Command">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onBlur={handleSave}
            className={INPUT}
            placeholder="node server.js"
          />
        </Field>
      </div>
    </div>
  );
}

const INPUT =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
