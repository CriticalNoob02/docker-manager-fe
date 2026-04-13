import { useQuery } from "@tanstack/react-query";
import { metricsService } from "@/shared/services/metrics";
import { EQuery } from "@/shared/constants/queryKeys";

export function useMetrics() {
  return useQuery({
    queryKey: [EQuery.METRICS],
    queryFn: metricsService.get,
    refetchInterval: 10_000,
  });
}
