import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) throw new Error("NEXT_PUBLIC_WS_URL não definida no .env");
    socket = io(`${url}/docker`, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};
