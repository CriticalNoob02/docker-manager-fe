"use client";

import { useState } from "react";
import { useVolumes } from "../hooks/useVolumes";
import { VolumeTable } from "../components/VolumeTable";
import { CreateVolumeModal } from "../components/CreateVolumeModal";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { Plus, RefreshCw } from "lucide-react";

export function VolumeListScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useVolumes();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <DockerInfoBox
        conceptSlug="volume"
        title="O que são Volumes?"
        summary="Volumes são mecanismo nativo do Docker para persistir dados fora do ciclo de vida dos containers. Remova e recrie o container — os dados continuam intactos no volume."
        details={
          <div className="flex flex-col gap-2">
            <InfoCommand cmd="docker volume create meu-db" desc="Cria um volume chamado meu-db" />
            <InfoCommand cmd="docker run -v meu-db:/var/lib/postgresql/data postgres" desc="Monta o volume no diretório de dados do Postgres" />
            <InfoCommand cmd="docker volume prune" desc="Remove todos os volumes não usados por nenhum container" />
          </div>
        }
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Volumes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.length} volumes` : "Carregando..."}
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
          Não foi possível carregar os volumes.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">Nenhum volume encontrado.</p>
          <p className="text-zinc-600 text-xs mt-1">Crie um volume com o botão acima.</p>
        </div>
      )}

      {data && data.length > 0 && <VolumeTable data={data} />}

      <CreateVolumeModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
