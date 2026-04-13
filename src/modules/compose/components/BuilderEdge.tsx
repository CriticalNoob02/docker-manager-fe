"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";

const RELATIONS = ["network", "depends_on", "env_ref"] as const;
type Relation = (typeof RELATIONS)[number];

const STYLE: Record<Relation, React.CSSProperties> = {
  depends_on: { stroke: "#60a5fa", strokeWidth: 2 },
  network:    { stroke: "#4ade80", strokeWidth: 1.5, strokeDasharray: "6 3" },
  env_ref:    { stroke: "#facc15", strokeWidth: 1.5, strokeDasharray: "2 4" },
};

const LABEL_COLOR: Record<Relation, string> = {
  depends_on: "text-blue-400 border-blue-500/40 bg-blue-950/80",
  network:    "text-green-400 border-green-500/40 bg-green-950/80",
  env_ref:    "text-yellow-400 border-yellow-500/40 bg-yellow-950/80",
};

interface Data {
  relation?: Relation;
  onChangeRelation: (id: string, next: Relation) => void;
}

export function BuilderEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  data,
}: EdgeProps) {
  const d = data as unknown as Data;
  const relation: Relation = d?.relation ?? "network";
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  function cycle() {
    const idx = RELATIONS.indexOf(relation);
    const next = RELATIONS[(idx + 1) % RELATIONS.length];
    d?.onChangeRelation(id, next);
  }

  return (
    <>
      <BaseEdge path={edgePath} style={STYLE[relation]} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={cycle}
            title="Clique para trocar o tipo de relação"
            className={`
              text-[10px] font-semibold px-1.5 py-0.5 rounded border
              ${LABEL_COLOR[relation]}
              cursor-pointer hover:brightness-125 transition-all
            `}
          >
            {relation}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
