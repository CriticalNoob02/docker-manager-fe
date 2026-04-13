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
} from "lucide-react";
import clsx from "clsx";
import { useDockerSocket } from "@/core/providers/SocketContext";

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

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useDockerSocket();

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
