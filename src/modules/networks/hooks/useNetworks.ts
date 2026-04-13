import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { networksService } from "@/shared/services/networks";
import { EQuery } from "@/shared/constants/queryKeys";

export function useNetworks() {
  return useQuery({
    queryKey: [EQuery.NETWORKS],
    queryFn: networksService.list,
  });
}

export function useRemoveNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => networksService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EQuery.NETWORKS] }),
  });
}

export function useCreateNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, driver }: { name: string; driver?: string }) =>
      networksService.create(name, driver),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EQuery.NETWORKS] }),
  });
}
