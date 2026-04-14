"use client";

import { useState } from "react";
import { useImages } from "../hooks/useImages";
import { ImageTable } from "../components/ImageTable";
import { PullImageModal } from "../components/PullImageModal";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { Download, RefreshCw } from "lucide-react";

export function ImageListScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useImages();
  const [pullOpen, setPullOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <DockerInfoBox
        conceptSlug="image"
        title="O que são Images?"
        summary="Images são templates somente-leitura em camadas (layers). Cada instrução do Dockerfile cria uma camada. Camadas são compartilhadas entre imagens — economizando espaço e tempo de download."
        details={
          <div className="flex flex-col gap-2">
            <InfoCommand cmd="docker pull postgres:16-alpine" desc="Baixa a imagem do Postgres versão 16 com base alpine (menor)" />
            <InfoCommand cmd="docker image history <id>" desc="Mostra todas as camadas e seus tamanhos" />
            <InfoCommand cmd="docker image prune" desc="Remove imagens sem tag (restos de builds anteriores)" />
          </div>
        }
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Images</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.length} imagens` : "Carregando..."}
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
            onClick={() => setPullOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Pull
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
          Não foi possível carregar as imagens.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">Nenhuma imagem encontrada.</p>
          <p className="text-zinc-600 text-xs mt-1">Faça pull de uma imagem com o botão acima.</p>
        </div>
      )}

      {data && data.length > 0 && <ImageTable data={data} />}

      <PullImageModal open={pullOpen} onOpenChange={setPullOpen} />
    </div>
  );
}
