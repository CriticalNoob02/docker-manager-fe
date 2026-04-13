"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { DockerSocketProvider } from "./SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ReactQueryProvider>
          <DockerSocketProvider>{children}</DockerSocketProvider>
        </ReactQueryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
