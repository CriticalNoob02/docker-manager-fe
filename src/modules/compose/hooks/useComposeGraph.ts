import { useQuery } from "@tanstack/react-query";
import { composeService } from "@/shared/services/compose";
import { EQuery } from "@/shared/constants/queryKeys";

export function useComposeGraph(file: string | null, includeVolumes = false) {
  return useQuery({
    queryKey: [EQuery.COMPOSE_GRAPH, file, includeVolumes],
    queryFn: () => composeService.getGraph(file!, includeVolumes),
    enabled: !!file,
  });
}
