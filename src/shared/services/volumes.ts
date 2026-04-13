import { api } from "@/core/apis/api";
import type { VolumeInspectInfo } from "dockerode";

export type { VolumeInspectInfo };

export const volumesService = {
  list: () => api.get<VolumeInspectInfo[]>("/volumes").then((r) => r.data),
  remove: (name: string) => api.delete(`/volumes/${encodeURIComponent(name)}`),
  create: (name: string, driver?: string) =>
    api.post<VolumeInspectInfo>("/volumes", { name, driver }).then((r) => r.data),
};
