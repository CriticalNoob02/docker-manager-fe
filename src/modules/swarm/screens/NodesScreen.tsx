"use client";

import { useSwarmNodes } from "../hooks/useSwarm";
import { NodeTable } from "../components/NodeTable";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { Server } from "lucide-react";

export function NodesScreen() {
  const { data: nodes, isLoading, isError } = useSwarmNodes();

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Server className="w-5 h-5 text-zinc-400" />
        <h1 className="text-xl font-semibold text-white">Nodes</h1>
        {nodes && (
          <span className="text-sm text-zinc-500">{nodes.length} node(s)</span>
        )}
      </div>

      <DockerInfoBox
        conceptSlug="swarm-node"
        title="Swarm Nodes"
        summary="Nodes são os hosts participantes do cluster. Managers controlam o estado do cluster via Raft; workers executam as tasks dos serviços. Antes de manutenção, coloque o nó em modo drain para migrar os containers."
        details={
          <>
            <InfoCommand cmd="docker node ls" desc="Lista todos os nós com role e status" />
            <InfoCommand cmd="docker node update --availability drain <id>" desc="Drena o nó (migra tasks para outros)" />
            <InfoCommand cmd="docker node update --role manager <id>" desc="Promove worker a manager" />
            <InfoCommand cmd="docker node inspect <id>" desc="Exibe detalhes completos do nó" />
          </>
        }
      />

      {isLoading && <p className="text-sm text-zinc-500">Carregando...</p>}
      {isError && <p className="text-sm text-red-400">Erro ao carregar nodes.</p>}
      {nodes && nodes.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhum node encontrado.</p>
      )}
      {nodes && nodes.length > 0 && <NodeTable nodes={nodes} />}
    </div>
  );
}
