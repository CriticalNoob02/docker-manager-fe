"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDockerSocket } from "@/core/providers/SocketContext";

export function useContainerLogs(containerId: string) {
  const { socket } = useDockerSocket();
  const [lines, setLines] = useState<string[]>([]);
  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    bufferRef.current = [];
    setLines([]);
  }, []);

  useEffect(() => {
    if (!socket || !containerId) return;

    socket.emit("container:logs:subscribe", { containerId, tail: 300 });

    const onData = ({ line }: { containerId: string; line: string }) => {
      bufferRef.current.push(line);
    };

    socket.on("container:logs:data", onData);

    // Batch flush every 250ms to avoid excessive re-renders
    intervalRef.current = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const batch = bufferRef.current.splice(0);
        setLines((prev) => [...prev, ...batch].slice(-5000)); // keep last 5000 lines
      }
    }, 250);

    return () => {
      socket.emit("container:logs:unsubscribe", { containerId });
      socket.off("container:logs:data", onData);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [socket, containerId]);

  return { lines, clear };
}
