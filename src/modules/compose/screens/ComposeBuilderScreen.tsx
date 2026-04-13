"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FlowBuilder = dynamic(
  () => import("../components/FlowBuilder").then((m) => ({ default: m.FlowBuilder })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center gap-3 text-zinc-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando editor…
      </div>
    ),
  }
);

export function ComposeBuilderScreen() {
  return <FlowBuilder />;
}
