import { useQuery } from "@tanstack/react-query";
import { composeService } from "@/shared/services/compose";
import { EQuery } from "@/shared/constants/queryKeys";

export function useComposeStacks() {
  return useQuery({
    queryKey: [EQuery.COMPOSE_STACKS],
    queryFn: composeService.listStacks,
    refetchInterval: 30_000,
  });
}
