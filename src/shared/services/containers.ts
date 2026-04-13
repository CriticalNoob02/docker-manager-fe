import { api } from "@/core/apis/api";
import type { ContainerInfo, ContainerInspectInfo } from "dockerode";

export type { ContainerInspectInfo };

export interface ContainerWithMeta extends ContainerInfo {
  description: string;
}

export const containersService = {
  list: () => api.get<ContainerWithMeta[]>("/containers").then((r) => r.data),
  inspect: (id: string) => api.get<ContainerInspectInfo>(`/containers/${id}`).then((r) => r.data),
  start: (id: string) => api.post(`/containers/${id}/start`),
  stop: (id: string) => api.post(`/containers/${id}/stop`),
  restart: (id: string) => api.post(`/containers/${id}/restart`),
  remove: (id: string) => api.delete(`/containers/${id}`),
  updateDescription: (id: string, description: string) =>
    api.patch(`/containers/${id}/meta`, { description }),
};
