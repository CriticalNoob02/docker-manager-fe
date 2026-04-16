import { api } from "@/core/apis/api";

export interface SwarmInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  nodes: number;
  managers: number;
}

export interface SwarmNode {
  id: string;
  hostname: string;
  status: string;
  availability: string;
  role: string;
  engineVersion: string;
  addr: string;
  leader: boolean;
}

export interface ServicePort {
  protocol: string;
  targetPort: number;
  publishedPort: number;
  publishMode: string;
}

export interface SwarmService {
  id: string;
  name: string;
  image: string;
  mode: string;
  replicas: number | null;
  running: number;
  ports: ServicePort[];
  createdAt: string;
  updatedAt: string;
}

export interface SwarmTask {
  id: string;
  serviceId: string;
  serviceName: string;
  nodeId: string;
  nodeHostname: string;
  slot: number;
  state: string;
  desiredState: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface SwarmStack {
  name: string;
  services: number;
}

export const swarmService = {
  getInfo: () => api.get<SwarmInfo>("/swarm/info").then((r) => r.data),
  listNodes: () => api.get<SwarmNode[]>("/swarm/nodes").then((r) => r.data),
  getNode: (id: string) => api.get<SwarmNode>(`/swarm/nodes/${id}`).then((r) => r.data),
  updateNode: (id: string, role: "manager" | "worker", availability: "active" | "pause" | "drain") =>
    api.put(`/swarm/nodes/${id}`, { role, availability }),
  removeNode: (id: string) => api.delete(`/swarm/nodes/${id}`),
  listServices: () => api.get<SwarmService[]>("/swarm/services").then((r) => r.data),
  getService: (id: string) => api.get<SwarmService>(`/swarm/services/${id}`).then((r) => r.data),
  scaleService: (id: string, replicas: number) => api.patch(`/swarm/services/${id}/scale`, { replicas }),
  removeService: (id: string) => api.delete(`/swarm/services/${id}`),
  listServiceTasks: (id: string) => api.get<SwarmTask[]>(`/swarm/services/${id}/tasks`).then((r) => r.data),
  listTasks: () => api.get<SwarmTask[]>("/swarm/tasks").then((r) => r.data),
  initSwarm: (advertiseAddr?: string) =>
    api.post<{ joinTokenWorker: string; joinTokenManager: string }>("/swarm/init", { advertiseAddr }).then((r) => r.data),
  getJoinTokens: () =>
    api.get<{ worker: string; manager: string }>("/swarm/join-tokens").then((r) => r.data),
  leaveSwarm: (force = false) => api.post("/swarm/leave", { force }),
  listStacks: () => api.get<SwarmStack[]>("/swarm/stacks").then((r) => r.data),
  deployStack: (name: string, composeYaml: string) =>
    api.post(`/swarm/stacks/${name}`, { composeYaml }).then((r) => r.data),
  removeStack: (name: string) => api.delete(`/swarm/stacks/${name}`),
};
