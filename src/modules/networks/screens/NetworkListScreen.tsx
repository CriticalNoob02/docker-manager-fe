"use client";

import { useState } from "react";
import { useNetworks } from "../hooks/useNetworks";
import { NetworkTable } from "../components/NetworkTable";
import { CreateNetworkModal } from "../components/CreateNetworkModal";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { Plus, RefreshCw } from "lucide-react";

export function NetworkListScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useNetworks();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <DockerInfoBox
        conceptSlug="network"
        title="O que são Redes Docker?"
        summary="Redes Docker são switches virtuais que conectam containers. Containers na mesma rede bridge customizada se resolvem por nome (DNS interno). Containers em redes diferentes ficam isolados por padrão."
        details={
          <div className="flex flex-col gap-2">
            <InfoCommand cmd="docker network create --driver bridge minha-rede" desc="Cria uma rede bridge customizada" />
            <InfoCommand cmd="docker network connect minha-rede <container>" desc="Conecta um container a uma rede existente" />
            <InfoCommand cmd="docker network inspect minha-rede" desc="Mostra containers conectados, IPs e configurações" />
          </div>
        }
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Redes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.length} redes` : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          Não foi possível carregar as redes.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">Nenhuma rede encontrada.</p>
          <p className="text-zinc-600 text-xs mt-1">Crie uma rede com o botão acima.</p>
        </div>
      )}

      {data && data.length > 0 && <NetworkTable data={data} />}

      <CreateNetworkModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
