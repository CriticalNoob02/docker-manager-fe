import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { volumesService } from "@/shared/services/volumes";
import { EQuery } from "@/shared/constants/queryKeys";

export function useVolumes() {
  return useQuery({
    queryKey: [EQuery.VOLUMES],
    queryFn: volumesService.list,
  });
}

export function useRemoveVolume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => volumesService.remove(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EQuery.VOLUMES] }),
  });
}

export function useCreateVolume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, driver }: { name: string; driver?: string }) =>
      volumesService.create(name, driver),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EQuery.VOLUMES] }),
  });
}
