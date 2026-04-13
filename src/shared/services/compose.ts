import { api } from "@/core/apis/api";

export interface ServiceNode {
  id: string;
  type: "service" | "volume";
  label: string;
  image?: string;
  ports?: string[];
  status?: string;
  containerId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: "depends_on" | "network" | "env_ref" | "volume";
}

export interface ComposeGraph {
  nodes: ServiceNode[];
  edges: GraphEdge[];
}

export interface ComposeStack {
  name: string;
  configFile: string;
  status: string;
}

export const composeService = {
  listStacks: () =>
    api.get<ComposeStack[]>("/compose").then((r) => r.data),
  getGraph: (file: string, includeVolumes = false) =>
    api
      .get<ComposeGraph>("/compose/graph", {
        params: { file, ...(includeVolumes ? { volumes: "true" } : {}) },
      })
      .then((r) => r.data),
};
