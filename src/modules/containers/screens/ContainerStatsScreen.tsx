"use client";

import { useContainerStats } from "../hooks/useContainerStats";
import { StatsChart } from "../components/StatsChart";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  containerId: string;
}

export function ContainerStatsScreen({ containerId }: Props) {
  const { points } = useContainerStats(containerId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/containers" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">Stats</h1>
          <p className="text-xs text-zinc-500 font-mono">{containerId.substring(0, 12)}</p>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">Aguardando dados...</p>
          <p className="text-zinc-600 text-xs mt-1">O container precisa estar em execução</p>
        </div>
      ) : (
        <StatsChart points={points} />
      )}
    </div>
  );
}
