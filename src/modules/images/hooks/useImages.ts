import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { imagesService } from "@/shared/services/images";
import { EQuery } from "@/shared/constants/queryKeys";

export function useImages() {
  return useQuery({
    queryKey: [EQuery.IMAGES],
    queryFn: imagesService.list,
  });
}

export function useRemoveImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EQuery.IMAGES] }),
  });
}
