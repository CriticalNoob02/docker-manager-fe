import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { swarmService } from "@/shared/services/swarm";
import { EQuery } from "@/shared/constants/queryKeys";

export function useSwarmInfo() {
  return useQuery({
    queryKey: [EQuery.SWARM_INFO],
    queryFn: swarmService.getInfo,
    refetchInterval: 30_000,
    retry: false, // don't retry if swarm is not active
  });
}

export function useSwarmNodes() {
  return useQuery({
    queryKey: [EQuery.SWARM_NODES],
    queryFn: swarmService.listNodes,
    refetchInterval: 15_000,
  });
}

export function useSwarmServices() {
  return useQuery({
    queryKey: [EQuery.SWARM_SERVICES],
    queryFn: swarmService.listServices,
    refetchInterval: 15_000,
  });
}

export function useSwarmService(id: string) {
  return useQuery({
    queryKey: [EQuery.SWARM_SERVICE_DETAIL, id],
    queryFn: () => swarmService.getService(id),
    refetchInterval: 10_000,
    enabled: !!id,
  });
}

export function useSwarmServiceTasks(serviceId: string) {
  return useQuery({
    queryKey: [EQuery.SWARM_TASKS, serviceId],
    queryFn: () => swarmService.listServiceTasks(serviceId),
    refetchInterval: 5_000,
    enabled: !!serviceId,
  });
}

export function useSwarmStacks() {
  return useQuery({
    queryKey: [EQuery.SWARM_STACKS],
    queryFn: swarmService.listStacks,
    refetchInterval: 30_000,
  });
}

export function useScaleService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, replicas }: { id: string; replicas: number }) =>
      swarmService.scaleService(id, replicas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_SERVICES] });
    },
  });
}

export function useRemoveService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => swarmService.removeService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_SERVICES] });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      role,
      availability,
    }: {
      id: string;
      role: "manager" | "worker";
      availability: "active" | "pause" | "drain";
    }) => swarmService.updateNode(id, role, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_NODES] });
    },
  });
}

export function useRemoveNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => swarmService.removeNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_NODES] });
    },
  });
}

export function useInitSwarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (advertiseAddr?: string) => swarmService.initSwarm(advertiseAddr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_INFO] });
    },
  });
}

export function useLeaveSwarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (force: boolean = false) => swarmService.leaveSwarm(force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_INFO] });
    },
  });
}

export function useJoinTokens() {
  return useQuery({
    queryKey: ["swarm-join-tokens"],
    queryFn: swarmService.getJoinTokens,
  });
}

export function useRemoveStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => swarmService.removeStack(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.SWARM_STACKS] });
    },
  });
}
