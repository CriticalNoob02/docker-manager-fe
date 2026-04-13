"use client";

import { useEffect, useState } from "react";
import { useDockerSocket } from "@/core/providers/SocketContext";

export interface StatPoint {
  cpu: number;
  memory: number;
  memoryLimit: number;
  timestamp: number;
}

const MAX_POINTS = 60;

export function useContainerStats(containerId: string) {
  const { socket } = useDockerSocket();
  const [points, setPoints] = useState<StatPoint[]>([]);

  useEffect(() => {
    if (!socket || !containerId) return;

    socket.emit("container:stats:subscribe", { containerId });

    const onData = (data: StatPoint & { containerId: string }) => {
      setPoints((prev) => [
        ...prev.slice(-(MAX_POINTS - 1)),
        { cpu: data.cpu, memory: data.memory, memoryLimit: data.memoryLimit, timestamp: data.timestamp },
      ]);
    };

    socket.on("container:stats:data", onData);

    return () => {
      socket.emit("container:stats:unsubscribe", { containerId });
      socket.off("container:stats:data", onData);
    };
  }, [socket, containerId]);

  return { points };
}
