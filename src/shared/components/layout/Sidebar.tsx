"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Container,
  Image,
  Activity,
  HardDrive,
  Network,
  GitFork,
  Workflow,
  BarChart2,
  BookOpen,
  Boxes,
  Server,
} from "lucide-react";
import clsx from "clsx";
import { useDockerSocket } from "@/core/providers/SocketContext";
import { useLearnModeStore } from "@/shared/stores/learnModeStore";
import { useSwarmInfo } from "@/modules/swarm/hooks/useSwarm";

const navItems = [
  { href: "/metrics", label: "Métricas", icon: BarChart2 },
  { href: "/containers", label: "Containers", icon: Container },
  { href: "/images", label: "Images", icon: Image },
  { href: "/volumes", label: "Volumes", icon: HardDrive },
  { href: "/networks", label: "Redes", icon: Network },
];

const composeItems = [
  { href: "/compose", label: "Visualizar", icon: GitFork, exact: true },
  { href: "/compose/builder", label: "Builder", icon: Workflow, exact: false },
];

const swarmItems = [
  { href: "/swarm", label: "Overview", icon: Activity, exact: true },
  { href: "/swarm/nodes", label: "Nodes", icon: Server, exact: false },
  { href: "/swarm/services", label: "Serviços", icon: Boxes, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useDockerSocket();
  const { learnMode, toggleLearnMode } = useLearnModeStore();
  const { data: swarmInfo } = useSwarmInfo();
  const swarmActive = !!swarmInfo?.id;

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900 min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <Activity className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-white text-sm">Docker Manager</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        {/* Swarm group — always visible; sub-items only when active */}
        <div className="mt-1">
          <p className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
            Swarm
            {!swarmActive && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-600 border border-zinc-700">off</span>
            )}
          </p>
          {/* Overview always shown */}
          <Link
            href="/swarm"
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive("/swarm", true)
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Activity className="w-4 h-4" />
            Overview
          </Link>
          {/* Sub-items only when swarm is active */}
          {swarmActive && swarmItems.slice(1).map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Compose group */}
        <div className="mt-1">
          <p className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Compose
          </p>
          {composeItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Learn group */}
        <div className="mt-1">
          <p className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Aprender
          </p>

          {/* Link para a página /learn */}
          <Link
            href="/learn"
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith("/learn")
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Docker 101
          </Link>

          {/* Toggle Learn Mode */}
          <button
            onClick={toggleLearnMode}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
              learnMode
                ? "text-blue-300 bg-blue-950/40"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
            title="Ativa caixas de explicação em cada tela"
          >
            {/* Ícone de toggle */}
            <span
              className={clsx(
                "inline-flex items-center justify-center w-4 h-4 rounded-sm border text-[9px] font-bold transition-colors",
                learnMode
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-zinc-600 text-zinc-600"
              )}
            >
              {learnMode ? "ON" : ""}
            </span>
            Modo Ensino
          </button>
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800 flex items-center gap-2">
        <span
          className={clsx(
            "inline-block w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span className="text-xs text-zinc-500">
          {isConnected ? "Conectado" : "Desconectado"}
        </span>
      </div>
    </aside>
  );
}
