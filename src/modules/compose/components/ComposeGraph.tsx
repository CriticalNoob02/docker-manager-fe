"use client";

import dynamic from "next/dynamic";
import type { Node, Edge } from "@xyflow/react";
import { Loader2, GitFork } from "lucide-react";

// Dynamic import avoids SSR hydration errors with React Flow
const FlowCanvas = dynamic(() => import("./FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
    </div>
  ),
});

interface Props {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  isEmpty: boolean;
}

export function ComposeGraph({ nodes, edges, isLoading, isEmpty }: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center gap-3 text-zinc-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando grafo…
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
        <GitFork className="w-10 h-10" />
        <p className="text-sm">Selecione uma stack para visualizar o grafo</p>
      </div>
    );
  }

  return <FlowCanvas nodes={nodes} edges={edges} />;
}
