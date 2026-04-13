"use client";

import { useMetrics } from "../hooks/useMetrics";
import { RefreshCw, Box, Cpu, MemoryStick, HardDrive, ArrowDownToLine, ArrowUpFromLine, Network, Layers } from "lucide-react";
import type { ComposeProject } from "@/shared/services/metrics";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatMb(mb: number): string {
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}

function StatCard({ label, value, sub, icon: Icon, color = "text-blue-400" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function ComposeProjectCard({ project }: { project: ComposeProject }) {
  const totalContainers = project.networks.reduce((acc, n) => acc + n.containerCount, 0);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-800/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">{project.project}</span>
        </div>
        <span className="text-xs text-zinc-500">
          {project.networks.length} {project.networks.length === 1 ? "rede" : "redes"} · {totalContainers} container{totalContainers !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-zinc-800">
        {project.networks.map((net) => (
          <div key={net.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-300 font-mono truncate">{net.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono shrink-0">
                    {net.driver}
                  </span>
                </div>

                {net.containers.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 pl-5">
                    {net.containers.map((ct) => (
                      <div key={ct.name} className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="text-zinc-400 font-medium">{ct.name}</span>
                        <span className="font-mono">{ct.ipv4 || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {net.containers.length === 0 && (
                  <p className="text-xs text-zinc-600 pl-5">Nenhum container conectado</p>
                )}
              </div>

              <span className="text-xs text-zinc-500 shrink-0">
                {net.containerCount} container{net.containerCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricsScreen() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useMetrics();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR")
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Métricas</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {lastUpdated ? `Atualizado às ${lastUpdated} · atualiza a cada 10s` : "Carregando..."}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          Não foi possível carregar as métricas.
        </div>
      )}

      {data && (
        <>
          {/* Containers */}
          <Section title="Containers">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard
                label="Total"
                value={String(data.containers.total)}
                icon={Box}
                color="text-zinc-400"
              />
              <StatCard
                label="Rodando"
                value={String(data.containers.running)}
                icon={Box}
                color="text-green-400"
              />
              <StatCard
                label="Parados"
                value={String(data.containers.stopped)}
                icon={Box}
                color="text-red-400"
              />
            </div>
          </Section>

          {/* Resources */}
          <Section title="Recursos (containers ativos)">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="CPU total"
                value={`${data.resources.cpuPercent.toFixed(1)}%`}
                sub={`${data.containers.running} containers`}
                icon={Cpu}
                color="text-yellow-400"
              />
              <StatCard
                label="Memória"
                value={formatMb(data.resources.memUsageMb)}
                sub={`de ${formatMb(data.resources.memLimitMb)} limite`}
                icon={MemoryStick}
                color="text-purple-400"
              />
              <StatCard
                label="IO Leitura"
                value={formatMb(data.resources.ioReadMb)}
                sub="acumulado"
                icon={ArrowDownToLine}
                color="text-blue-400"
              />
              <StatCard
                label="IO Escrita"
                value={formatMb(data.resources.ioWriteMb)}
                sub="acumulado"
                icon={ArrowUpFromLine}
                color="text-orange-400"
              />
              <StatCard
                label="Rede RX"
                value={formatMb(data.resources.netRxMb)}
                sub="recebido"
                icon={ArrowDownToLine}
                color="text-cyan-400"
              />
              <StatCard
                label="Rede TX"
                value={formatMb(data.resources.netTxMb)}
                sub="enviado"
                icon={ArrowUpFromLine}
                color="text-pink-400"
              />
            </div>
          </Section>

          {/* Storage */}
          <Section title="Armazenamento">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              <StatCard
                label="Imagens"
                value={formatBytes(data.storage.imagesSizeBytes)}
                sub={`${data.storage.totalImages} imagens`}
                icon={HardDrive}
                color="text-blue-400"
              />
              <StatCard
                label="Containers"
                value={formatBytes(data.storage.containersSizeBytes)}
                sub={`${data.storage.totalContainers} containers (rootfs)`}
                icon={HardDrive}
                color="text-zinc-400"
              />
            </div>
          </Section>

          {/* Compose Networks */}
          <Section title="Redes do Compose">
            {data.composeProjects.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-10 text-center">
                <p className="text-zinc-500 text-sm">Nenhuma rede do Compose encontrada.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Inicie stacks com docker compose para ver as redes aqui.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.composeProjects.map((proj) => (
                  <ComposeProjectCard key={proj.project} project={proj} />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
