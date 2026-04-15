"use client";

import { useCallback, useRef, useState, useId } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Trash2, Copy, Check } from "lucide-react";

import { BuilderNode } from "./BuilderNode";
import type { BuilderNodeData } from "./BuilderNode";
import { BuilderEdge } from "./BuilderEdge";
import { ContainerPanel } from "./ContainerPanel";
import type { DraggedContainer } from "./ContainerPanel";
import { NodeEditPanel } from "./NodeEditPanel";
import { generateComposeYaml, downloadFile } from "../lib/exportCompose";

const nodeTypes = { builder: BuilderNode };
const edgeTypes = { builder: BuilderEdge };

// ─── Inner component (needs ReactFlowProvider context) ────────────────────────

function BuilderInner() {
  const reactFlow = useReactFlow();
  const uid = useId();
  const counter = useRef(0);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function nextId() {
    counter.current += 1;
    return `${uid}-${counter.current}`;
  }

  function makeNode(
    id: string,
    position: { x: number; y: number },
    partial: Partial<BuilderNodeData>
  ): Node {
    const data: BuilderNodeData = {
      // Basic
      name:          partial.name        ?? `service-${counter.current}`,
      image:         partial.image       ?? "",
      ports:         partial.ports       ?? [],
      environment:   partial.environment ?? [],
      volumes:       partial.volumes     ?? [],
      command:       partial.command     ?? "",
      // Advanced
      build:         partial.build         ?? "",
      profiles:      partial.profiles      ?? [],
      restart:       partial.restart       ?? "",
      containerName: partial.containerName ?? "",
      hostname:      partial.hostname      ?? "",
      labels:        partial.labels        ?? [],
      healthcheck:   partial.healthcheck   ?? { test: "", interval: "30s", timeout: "10s", retries: "3", startPeriod: "" },
      deploy:        partial.deploy        ?? { replicas: "", memLimit: "", cpus: "" },
      // Internal
      containerId:   partial.containerId,
      onEdit:        (nid) => setEditingId(nid),
    };
    return { id, type: "builder", position, data: data as unknown as Record<string, unknown> };
  }

  // ── Drag & Drop from container panel ─────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/compose-container");
      if (!raw) return;

      const dragged: DraggedContainer = JSON.parse(raw);
      const position = reactFlow.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = nextId();
      const node = makeNode(id, position, {
        name:        dragged.name,
        image:       dragged.image,
        ports:       dragged.ports,
        containerId: dragged.id,
      });
      setNodes((prev) => [...prev, node]);
    },
    [reactFlow, setNodes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Add blank node ────────────────────────────────────────────────────────

  function addBlank() {
    const id = nextId();
    const position = reactFlow.screenToFlowPosition({ x: 300, y: 200 });
    setNodes((prev) => [...prev, makeNode(id, position, {})]);
  }

  // ── Connect ───────────────────────────────────────────────────────────────

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((prev) =>
        addEdge(
          {
            ...params,
            type: "builder",
            data: {
              relation: "network",
              onChangeRelation: changeEdgeRelation,
            },
          },
          prev
        )
      );
    },
    [setEdges] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function changeEdgeRelation(id: string, next: "network" | "depends_on" | "env_ref") {
    setEdges((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, data: { ...e.data, relation: next, onChangeRelation: changeEdgeRelation } }
          : e
      )
    );
  }

  // ── Node edit ─────────────────────────────────────────────────────────────

  function saveNode(id: string, patch: Partial<BuilderNodeData>) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, ...patch, onEdit: (nid: string) => setEditingId(nid) } }
          : n
      )
    );
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function handleExport() {
    const yaml = generateComposeYaml(nodes, edges);
    downloadFile("docker-compose.yml", yaml);
  }

  async function handleCopy() {
    const yaml = generateComposeYaml(nodes, edges);
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const usedContainerIds = new Set(
    nodes
      .map((n) => (n.data as unknown as BuilderNodeData).containerId)
      .filter(Boolean) as string[]
  );

  const editingNode = editingId ? nodes.find((n) => n.id === editingId) : null;
  const editingData = editingNode?.data as unknown as BuilderNodeData | undefined;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Compose Builder</h2>
          <p className="text-[11px] text-zinc-500">
            {nodes.length} serviço{nodes.length !== 1 ? "s" : ""} · {edges.length} conexõe{edges.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar YAML"}
          </button>
          <button
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-600 bg-blue-600/10 text-xs text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3 h-3" />
            Exportar .yml
          </button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button
            onClick={() => { setNodes([]); setEdges([]); setEditingId(null); }}
            disabled={nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-xs text-zinc-500 hover:text-red-400 hover:border-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3 h-3" />
            Limpar
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: container panel */}
        <ContainerPanel usedIds={usedContainerIds} onAddBlank={addBlank} />

        {/* Center: canvas */}
        <div className="flex-1 min-w-0" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setEditingId(node.id)}
            onPaneClick={() => setEditingId(null)}
            fitView
            proOptions={{ hideAttribution: true }}
            minZoom={0.2}
            maxZoom={2}
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
            <Controls
              style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            />
            <MiniMap
              style={{ background: "#18181b", border: "1px solid #3f3f46" }}
              nodeColor="#3f3f46"
              maskColor="rgba(0,0,0,0.55)"
            />
          </ReactFlow>
        </div>

        {/* Right: edit panel (slide in) */}
        {editingId && editingData && (
          <NodeEditPanel
            nodeId={editingId}
            data={editingData}
            onSave={saveNode}
            onDelete={deleteNode}
            onClose={() => setEditingId(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Public export (wraps with ReactFlowProvider) ─────────────────────────────

export function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <BuilderInner />
    </ReactFlowProvider>
  );
}
