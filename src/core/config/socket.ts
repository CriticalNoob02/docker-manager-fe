import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    socket = io(`${url}/docker`, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};
