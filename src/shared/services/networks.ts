import { api } from "@/core/apis/api";
import type { NetworkInspectInfo } from "dockerode";

export type { NetworkInspectInfo };

export const networksService = {
  list: () => api.get<NetworkInspectInfo[]>("/networks").then((r) => r.data),
  remove: (id: string) => api.delete(`/networks/${id}`),
  create: (name: string, driver?: string) =>
    api.post<NetworkInspectInfo>("/networks", { name, driver }).then((r) => r.data),
};
