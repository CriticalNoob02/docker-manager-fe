"use client";

import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLearnModeStore } from "@/shared/stores/learnModeStore";
import Link from "next/link";

interface DockerInfoBoxProps {
  /** Slug do conceito Docker (ex.: "container", "image", "volume") */
  conceptSlug: string;
  /** Título exibido no cabeçalho do box */
  title: string;
  /** Resumo curto exibido sempre que o box está visível */
  summary: string;
  /** Conteúdo expandido — pode conter texto extra, comandos, etc. */
  details?: React.ReactNode;
}

/**
 * Box educativo que aparece nas telas quando o Learn Mode está ativo.
 * Pode ser expandido para ver mais detalhes sobre o conceito Docker
 * relacionado à tela atual.
 */
export function DockerInfoBox({ conceptSlug, title, summary, details }: DockerInfoBoxProps) {
  const { learnMode } = useLearnModeStore();
  const [expanded, setExpanded] = useState(false);

  if (!learnMode) return null;

  return (
    <div className="rounded-lg border border-blue-800/40 bg-blue-950/20 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3">
        <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-blue-300">{title}</p>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/learn?concept=${conceptSlug}`}
                className="text-[11px] text-blue-500 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Ver mais
                <ExternalLink className="w-3 h-3" />
              </Link>
              {details && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-blue-500 hover:text-blue-300 transition-colors"
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-blue-400/80 mt-0.5 leading-relaxed">{summary}</p>
        </div>
      </div>

      {expanded && details && (
        <div className="border-t border-blue-800/30 px-4 py-3 bg-blue-950/10">
          {details}
        </div>
      )}
    </div>
  );
}

/** Linha de comando exibida dentro do DockerInfoBox */
export function InfoCommand({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex flex-col gap-0.5 mb-2">
      <code className="text-xs font-mono text-emerald-400 bg-zinc-900/60 px-2 py-1 rounded">
        {cmd}
      </code>
      <p className="text-[11px] text-zinc-500 pl-1">{desc}</p>
    </div>
  );
}
