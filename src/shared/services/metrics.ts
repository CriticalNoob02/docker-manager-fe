import { api } from "@/core/apis/api";

export interface ComposeNetworkContainer {
  name: string;
  ipv4: string;
}

export interface ComposeNetwork {
  id: string;
  name: string;
  driver: string;
  project: string;
  service: string | null;
  containerCount: number;
  containers: ComposeNetworkContainer[];
}

export interface ComposeProject {
  project: string;
  networks: ComposeNetwork[];
}

export interface MetricsData {
  containers: {
    total: number;
    running: number;
    stopped: number;
  };
  resources: {
    memUsageMb: number;
    memLimitMb: number;
    cpuPercent: number;
    ioReadMb: number;
    ioWriteMb: number;
    netRxMb: number;
    netTxMb: number;
  };
  storage: {
    imagesSizeBytes: number;
    containersSizeBytes: number;
    totalImages: number;
    totalContainers: number;
  };
  composeProjects: ComposeProject[];
}

export const metricsService = {
  get: () => api.get<MetricsData>("/metrics").then((r) => r.data),
};
