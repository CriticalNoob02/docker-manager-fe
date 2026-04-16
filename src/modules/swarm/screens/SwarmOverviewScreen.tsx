"use client";

import { useSwarmInfo, useSwarmNodes, useSwarmServices, useSwarmStacks, useLeaveSwarm } from "../hooks/useSwarm";
import { SwarmInitCard } from "../components/SwarmInitCard";
import { JoinTokensCard } from "../components/JoinTokensCard";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DockerInfoBox, InfoCommand } from "@/shared/components/DockerInfoBox";
import { useToast } from "@/shared/hooks/useToast";
import { Boxes, Server, Layers, AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function StatCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span className="text-3xl font-semibold text-white tabular-nums">{value}</span>
    </Link>
  );
}

export function SwarmOverviewScreen() {
  const { data: info, isError, isLoading } = useSwarmInfo();
  const { data: nodes } = useSwarmNodes();
  const { data: services } = useSwarmServices();
  const { data: stacks } = useSwarmStacks();
  const leaveSwarm = useLeaveSwarm();
  const { toast } = useToast();
  const [confirmLeave, setConfirmLeave] = useState(false);

  const swarmActive = !!info?.id;
  const unhealthyNodes = (nodes ?? []).filter((n) => n.status !== "ready").length;

  if (isLoading) return <div className="p-6 text-sm text-zinc-500">Verificando modo Swarm...</div>;

  if (isError || !swarmActive) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Swarm</h1>
          <p className="text-sm text-zinc-500 mt-1">Swarm não está ativo neste host.</p>
        </div>
        <DockerInfoBox
          conceptSlug="swarm"
          title="O que é Docker Swarm?"
          summary="Orquestrador nativo do Docker que transforma múltiplos hosts em um único cluster gerenciado, com alta disponibilidade e escalonamento automático de serviços."
          details={
            <>
              <InfoCommand cmd="docker swarm init" desc="Inicializa um novo cluster neste host (vira manager)" />
              <InfoCommand cmd="docker swarm join-token worker" desc="Exibe o token para adicionar workers" />
              <InfoCommand cmd="docker info | grep Swarm" desc="Verifica se o Swarm está ativo" />
            </>
          }
        />
        <SwarmInitCard />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Swarm Overview</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">ID: {info.id}</p>
        </div>
        <button
          onClick={() => setConfirmLeave(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-800 rounded-md transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair do Swarm
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Nodes" value={nodes?.length ?? "—"} href="/swarm/nodes" icon={Server} />
        <StatCard label="Serviços" value={services?.length ?? "—"} href="/swarm/services" icon={Boxes} />
        <StatCard label="Stacks" value={stacks?.length ?? "—"} href="/swarm/services" icon={Layers} />
        <StatCard label="Managers" value={info.managers ?? "—"} href="/swarm/nodes" icon={Server} />
      </div>

      {unhealthyNodes > 0 && (
        <div className="flex items-center gap-2 bg-yellow-950/40 border border-yellow-800 rounded-lg px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {unhealthyNodes} node(s) com problema.{" "}
          <Link href="/swarm/nodes" className="underline ml-1">
            Ver nodes
          </Link>
        </div>
      )}

      <DockerInfoBox
        conceptSlug="swarm"
        title="Docker Swarm"
        summary="Você está gerenciando um cluster Swarm. O Swarm usa consenso Raft entre managers para manter o estado do cluster — use número ímpar de managers (3 ou 5) para alta disponibilidade."
        details={
          <>
            <InfoCommand cmd="docker service ls" desc="Lista todos os serviços do cluster" />
            <InfoCommand cmd="docker node ls" desc="Lista os nós com role e status" />
            <InfoCommand cmd="docker stack deploy -c compose.yml nome" desc="Faz deploy de uma stack" />
            <InfoCommand cmd="docker swarm join-token worker" desc="Gera o comando para adicionar novos workers" />
          </>
        }
      />

      <JoinTokensCard />

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Sair do Swarm"
        description="Este host irá deixar o cluster Swarm. Se for o único manager, o Swarm será dissolvido. Deseja continuar?"
        confirmLabel="Sair do Swarm"
        onConfirm={() => {
          leaveSwarm.mutate(true, {
            onSuccess: () => toast({ title: "Saiu do Swarm com sucesso" }),
            onError: (err: any) =>
              toast({ title: "Erro ao sair do Swarm", description: err?.response?.data?.error ?? err.message }),
          });
          setConfirmLeave(false);
        }}
      />
    </div>
  );
}
