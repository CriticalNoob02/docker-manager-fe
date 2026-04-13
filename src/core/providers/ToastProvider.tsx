"use client";

import * as Toast from "@radix-ui/react-toast";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error" | "info";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { title, description, variant } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  return (
    <Toast.Provider swipeDirection="right">
      {children}
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          open
          className={clsx(
            "flex flex-col gap-1 px-4 py-3 rounded-lg border shadow-lg text-sm w-[320px]",
            t.variant === "success" && "bg-zinc-900 border-green-600/40",
            t.variant === "error" && "bg-zinc-900 border-red-600/40",
            t.variant === "info" && "bg-zinc-900 border-zinc-600/40"
          )}
        >
          <Toast.Title
            className={clsx(
              "font-medium",
              t.variant === "success" && "text-green-400",
              t.variant === "error" && "text-red-400",
              t.variant === "info" && "text-zinc-200"
            )}
          >
            {t.title}
          </Toast.Title>
          {t.description && (
            <Toast.Description className="text-zinc-500 text-xs">{t.description}</Toast.Description>
          )}
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" />
    </Toast.Provider>
  );
}
