"use client";

import { useSwarmService, useSwarmServiceTasks } from "../hooks/useSwarm";
import { TaskList } from "../components/TaskList";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { ArrowLeft, Boxes } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export function ServiceDetailScreen({ serviceId }: { serviceId: string }) {
  const { data: service, isLoading, isError } = useSwarmService(serviceId);
  const { data: tasks } = useSwarmServiceTasks(serviceId);

  if (isLoading) return <div className="p-6 text-sm text-zinc-500">Carregando...</div>;
  if (isError || !service) return <div className="p-6 text-sm text-red-400">Serviço não encontrado.</div>;

  const healthy = service.running === service.replicas;

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/swarm/services" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Boxes className="w-5 h-5 text-zinc-400" />
        <h1 className="text-xl font-semibold text-white">{service.name}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Modo</p>
          <p className="text-sm font-medium text-white capitalize">{service.mode}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Réplicas</p>
          <p className={clsx("text-sm font-medium tabular-nums", healthy ? "text-green-400" : "text-yellow-400")}>
            {service.running}/{service.replicas ?? "∞"}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 col-span-2">
          <p className="text-xs text-zinc-500 mb-1">Imagem</p>
          <p className="text-xs font-mono text-zinc-300 truncate" title={service.image}>
            {service.image.split("@")[0]}
          </p>
        </div>
      </div>

      {service.ports.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-2">Portas publicadas</h2>
          <div className="flex flex-wrap gap-2">
            {service.ports.map((p, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
                {p.publishedPort}:{p.targetPort}/{p.protocol}
              </span>
            ))}
          </div>
        </div>
      )}

      <DockerInfoBox
        conceptSlug="swarm-task"
        title="Tasks do Serviço"
        summary="Cada task é uma instância do serviço rodando em um nó específico. O Swarm recria tasks falhas automaticamente para manter o número de réplicas desejado."
        details={
          <>
            <InfoCommand cmd={`docker service ps ${service.name}`} desc="Lista todas as tasks com histórico de estado" />
            <InfoCommand cmd={`docker service ps --no-trunc ${service.name}`} desc="Mostra erros completos de tasks falhas" />
            <InfoCommand cmd={`docker service logs -f ${service.name}`} desc="Acompanha logs agregados de todas as réplicas" />
          </>
        }
      />

      <div>
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Tasks</h2>
        <TaskList tasks={tasks ?? []} />
      </div>
    </div>
  );
}
