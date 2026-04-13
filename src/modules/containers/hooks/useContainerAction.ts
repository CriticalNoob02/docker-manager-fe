import { useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/shared/services/containers";
import { EQuery } from "@/shared/constants/queryKeys";

type Action = "start" | "stop" | "restart" | "remove";

export function useContainerAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) => {
      if (action === "remove") return containersService.remove(id);
      return containersService[action](id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.CONTAINERS] });
    },
  });
}
