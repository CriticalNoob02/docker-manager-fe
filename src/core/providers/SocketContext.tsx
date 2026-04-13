"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/core/config/socket";
import { EQuery } from "@/shared/constants/queryKeys";
import { Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function DockerSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const socketRef = useRef(getSocket());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Any container event (start/stop/die/create/destroy) triggers a list refresh
    socket.on("container:event", () => {
      queryClient.invalidateQueries({ queryKey: [EQuery.CONTAINERS] });
      queryClient.invalidateQueries({ queryKey: [EQuery.COMPOSE_GRAPH] });
    });

    return () => {
      socket.off("container:event");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useDockerSocket = () => useContext(SocketContext);
