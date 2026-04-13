import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/shared/services/containers";
import { EQuery } from "@/shared/constants/queryKeys";

export function useContainers() {
  return useQuery({
    queryKey: [EQuery.CONTAINERS],
    queryFn: containersService.list,
    refetchInterval: 30_000,
  });
}

export function useUpdateContainerDescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      containersService.updateDescription(id, description),
    onSuccess: (_data, { id, description }) => {
      // Atualiza o cache diretamente sem refetch — mais rápido e sem flicker
      queryClient.setQueryData<ReturnType<typeof containersService.list> extends Promise<infer T> ? T : never>(
        [EQuery.CONTAINERS],
        (prev) => prev?.map((c) => (c.Id === id ? { ...c, description } : c))
      );
    },
  });
}
