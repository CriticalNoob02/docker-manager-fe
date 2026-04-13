"use client";

import * as Toast from "@radix-ui/react-toast";
import { useCallback, useRef } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
}

// Simple imperative toast via custom event
export function useToast() {
  const toast = useCallback(({ title, description, variant = "info" }: ToastOptions) => {
    const event = new CustomEvent("app:toast", {
      detail: { title, description, variant },
    });
    window.dispatchEvent(event);
  }, []);

  return { toast };
}
