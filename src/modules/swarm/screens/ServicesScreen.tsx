"use client";

import { useSwarmServices } from "../hooks/useSwarm";
import { ServiceTable } from "../components/ServiceTable";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { Boxes } from "lucide-react";

export function ServicesScreen() {
  const { data: services, isLoading, isError } = useSwarmServices();

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Boxes className="w-5 h-5 text-zinc-400" />
        <h1 className="text-xl font-semibold text-white">Serviços</h1>
        {services && (
          <span className="text-sm text-zinc-500">{services.length} serviço(s)</span>
        )}
      </div>

      <DockerInfoBox
        conceptSlug="swarm-service"
        title="Swarm Services"
        summary='Serviços são a unidade de deploy do Swarm. Você declara o estado desejado ("3 réplicas do nginx") e o Swarm mantém esse estado automaticamente — recriando containers falhos e distribuindo carga entre os nós.'
        details={
          <>
            <InfoCommand cmd="docker service create --name web --replicas 3 -p 80:80 nginx" desc="Cria um serviço com 3 réplicas" />
            <InfoCommand cmd="docker service scale web=5" desc="Escala o serviço para 5 réplicas" />
            <InfoCommand cmd="docker service update --image nginx:1.26 web" desc="Rolling update da imagem" />
            <InfoCommand cmd="docker service update --rollback web" desc="Reverte para a versão anterior" />
            <InfoCommand cmd="docker service logs -f web" desc="Acompanha logs de todas as réplicas" />
          </>
        }
      />

      {isLoading && <p className="text-sm text-zinc-500">Carregando...</p>}
      {isError && <p className="text-sm text-red-400">Erro ao carregar serviços.</p>}
      {services && services.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhum serviço ativo no Swarm.</p>
      )}
      {services && services.length > 0 && <ServiceTable services={services} />}
    </div>
  );
}
