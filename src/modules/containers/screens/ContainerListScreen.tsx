"use client";

import { useContainers } from "../hooks/useContainers";
import { ContainerTable } from "../components/ContainerTable";
import { RefreshCw } from "lucide-react";

export function ContainerListScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useContainers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Containers</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.length} containers` : "Carregando..."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          Não foi possível conectar à API. Verifique se o backend está rodando em{" "}
          <code className="font-mono">http://localhost:3001</code>.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">Nenhum container encontrado.</p>
          <p className="text-zinc-600 text-xs mt-1">Execute um container com <code className="font-mono">docker run</code></p>
        </div>
      )}

      {data && data.length > 0 && <ContainerTable data={data} />}
    </div>
  );
}
