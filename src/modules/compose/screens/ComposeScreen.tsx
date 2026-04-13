"use client";

import { useState, useEffect, useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import { useComposeStacks } from "../hooks/useComposeStacks";
import { useComposeGraph } from "../hooks/useComposeGraph";
import { applyDagreLayout } from "../lib/layout";
import { ComposeGraph } from "../components/ComposeGraph";
import { GraphLegend } from "../components/GraphLegend";
import { StackSelector } from "../components/StackSelector";
import type { ServiceNode, GraphEdge } from "@/shared/services/compose";

function toFlowNodes(apiNodes: ServiceNode[]): Node[] {
  return apiNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      image: n.image,
      ports: n.ports,
      status: n.status,
    },
  }));
}

function toFlowEdges(apiEdges: GraphEdge[]): Edge[] {
  return apiEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    data: { relation: e.relation },
  }));
}

export function ComposeScreen() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [includeVolumes, setIncludeVolumes] = useState(false);

  const { data: stacks = [] } = useComposeStacks();
  const { data: graph, isLoading } = useComposeGraph(selectedFile, includeVolumes);

  useEffect(() => {
    if (stacks.length > 0 && !selectedFile) {
      setSelectedFile(stacks[0].configFile);
    }
  }, [stacks, selectedFile]);

  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };
    const rawNodes = toFlowNodes(graph.nodes);
    const rawEdges = toFlowEdges(graph.edges);
    const laidOut = applyDagreLayout(rawNodes, rawEdges, "LR");
    return { nodes: laidOut, edges: rawEdges };
  }, [graph]);

  return (
    // Same height convention as ContainerLogsScreen: 100vh minus main's p-6 (3rem = 48px)
    <div className="flex flex-col gap-3 h-[calc(100vh-3rem)]">
      {/* Topbar */}
      <div className="flex items-center gap-4 shrink-0">
        <StackSelector stacks={stacks} value={selectedFile} onChange={setSelectedFile} />
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeVolumes}
            onChange={(e) => setIncludeVolumes(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
          />
          Volumes
        </label>
        {stacks.length === 0 && !isLoading && (
          <span className="text-sm text-zinc-500 italic">
            Nenhuma stack ativa — inicie uma com{" "}
            <code className="font-mono text-xs">docker compose up</code>
          </span>
        )}
      </div>

      {/* Graph canvas — fills remaining height */}
      <div className="flex-1 min-h-0 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
        <ComposeGraph
          nodes={nodes}
          edges={edges}
          isLoading={isLoading && !!selectedFile}
          isEmpty={!selectedFile || (!isLoading && graph?.nodes.length === 0)}
        />
      </div>

      {/* Legend */}
      <div className="shrink-0 flex justify-center pb-1">
        <GraphLegend />
      </div>
    </div>
  );
}
