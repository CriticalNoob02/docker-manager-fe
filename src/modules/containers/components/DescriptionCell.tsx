"use client";

import { useRef, useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useUpdateContainerDescription } from "../hooks/useContainers";

interface Props {
  containerId: string;
  value: string;
}

export function DescriptionCell({ containerId, value }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateContainerDescription();

  // Sync external value changes (e.g. socket-triggered refetch)
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed === value) {
      setEditing(false);
      return;
    }
    mutate(
      { id: containerId, description: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 min-w-[180px]">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={save}
          disabled={isPending}
          maxLength={120}
          placeholder="Adicionar descrição..."
          className="flex-1 min-w-0 bg-zinc-800 border border-blue-500 rounded px-2 py-0.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-60"
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); save(); }}
          disabled={isPending}
          className="shrink-0 text-green-400 hover:text-green-300 disabled:opacity-40"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); cancel(); }}
          disabled={isPending}
          className="shrink-0 text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1.5 text-left max-w-[220px] w-full"
    >
      {value ? (
        <span className="text-xs text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">
          {value}
        </span>
      ) : (
        <span className="text-xs text-zinc-600 italic group-hover:text-zinc-500 transition-colors">
          Sem descrição
        </span>
      )}
      <Pencil className="w-3 h-3 text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
