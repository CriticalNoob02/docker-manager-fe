"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ServiceNode } from "./ServiceNode";
import { VolumeNode } from "./VolumeNode";

const nodeTypes = {
  service: ServiceNode,
  volume: VolumeNode,
};

const EDGE_STYLE: Record<string, React.CSSProperties> = {
  depends_on: { stroke: "#60a5fa", strokeWidth: 2 },
  network:    { stroke: "#4ade80", strokeWidth: 1.5, strokeDasharray: "6 3" },
  env_ref:    { stroke: "#facc15", strokeWidth: 1.5, strokeDasharray: "2 4" },
  volume:     { stroke: "#c084fc", strokeWidth: 1.5, strokeDasharray: "6 3" },
};

interface Props {
  nodes: Node[];
  edges: Edge[];
}

export default function FlowCanvas({ nodes, edges }: Props) {
  const styledEdges: Edge[] = edges.map((e) => {
    const relation = e.data?.relation as string;
    return {
      ...e,
      style: EDGE_STYLE[relation] ?? {},
      animated: relation === "depends_on",
      labelStyle: { fill: "#a1a1aa", fontSize: 10 },
    };
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        nodesDraggable
        zoomOnScroll
        panOnDrag
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
        <Controls
          style={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 8,
          }}
        />
        <MiniMap
          style={{ background: "#18181b", border: "1px solid #3f3f46" }}
          nodeColor={(n) => {
            if (n.type === "volume") return "#7c3aed";
            const s = (n.data as { status?: string }).status;
            if (s === "running") return "#22c55e";
            if (s === "exited")  return "#ef4444";
            if (s === "paused")  return "#eab308";
            return "#52525b";
          }}
          maskColor="rgba(0,0,0,0.55)"
        />
      </ReactFlow>
    </div>
  );
}
