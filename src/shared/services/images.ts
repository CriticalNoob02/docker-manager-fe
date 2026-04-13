import { api } from "@/core/apis/api";
import type { ImageInfo } from "dockerode";

export type { ImageInfo };

export const imagesService = {
  list: () => api.get<ImageInfo[]>("/images").then((r) => r.data),
  remove: (id: string) => api.delete(`/images/${id}`),
};
