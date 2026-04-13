"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDockerSocket } from "@/core/providers/SocketContext";
import { EQuery } from "@/shared/constants/queryKeys";

export interface PullProgress {
  status: string;
  id?: string;
}

export interface PullAuth {
  serveraddress: string;
  username: string;
  password: string;
}

export function usePullImage() {
  const { socket } = useDockerSocket();
  const queryClient = useQueryClient();
  const [isPulling, setIsPulling] = useState(false);
  const [progress, setProgress] = useState<PullProgress[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentImage = useRef<string | null>(null);

  const pull = useCallback(
    (image: string, tag: string, auth?: PullAuth) => {
      if (!socket) return;
      const fullImage = `${image}:${tag}`;
      currentImage.current = fullImage;
      setIsPulling(true);
      setDone(false);
      setError(null);
      setProgress([]);
      socket.emit("image:pull:start", { image, tag, ...(auth ? { auth } : {}) });
    },
    [socket]
  );

  useEffect(() => {
    if (!socket) return;

    const onProgress = (data: { image: string; status: string; id?: string }) => {
      if (data.image !== currentImage.current) return;
      setProgress((prev) => {
        // Update existing layer or append
        const idx = data.id ? prev.findIndex((p) => p.id === data.id) : -1;
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { status: data.status, id: data.id };
          return next;
        }
        return [...prev.slice(-30), { status: data.status, id: data.id }];
      });
    };

    const onDone = (data: { image: string }) => {
      if (data.image !== currentImage.current) return;
      setIsPulling(false);
      setDone(true);
      queryClient.invalidateQueries({ queryKey: [EQuery.IMAGES] });
    };

    const onError = (data: { image: string; error: string }) => {
      if (data.image !== currentImage.current) return;
      setIsPulling(false);
      setError(data.error);
    };

    socket.on("image:pull:progress", onProgress);
    socket.on("image:pull:done", onDone);
    socket.on("image:pull:error", onError);

    return () => {
      socket.off("image:pull:progress", onProgress);
      socket.off("image:pull:done", onDone);
      socket.off("image:pull:error", onError);
    };
  }, [socket, queryClient]);

  const reset = useCallback(() => {
    setIsPulling(false);
    setDone(false);
    setError(null);
    setProgress([]);
    currentImage.current = null;
  }, []);

  return { pull, isPulling, progress, done, error, reset };
}
