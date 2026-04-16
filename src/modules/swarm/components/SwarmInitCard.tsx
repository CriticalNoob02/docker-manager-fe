"use client";

import { useState } from "react";
import { useInitSwarm } from "../hooks/useSwarm";
import { useToast } from "@/shared/hooks/useToast";
import { Loader2 } from "lucide-react";

export function SwarmInitCard() {
  const [advertiseAddr, setAdvertiseAddr] = useState("");
  const initSwarm = useInitSwarm();
  const { toast } = useToast();

  function handleInit() {
    initSwarm.mutate(advertiseAddr || undefined, {
      onSuccess: () => toast({ title: "Swarm inicializado com sucesso!" }),
      onError: (err: any) =>
        toast({ title: "Erro ao inicializar Swarm", description: err?.response?.data?.error ?? err.message }),
    });
  }

  return (
    <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md">
      <div>
        <h2 className="text-white font-semibold text-base mb-1">Inicializar Swarm</h2>
        <p className="text-sm text-zinc-400">
          Cria um novo cluster Swarm neste host, tornando-o um nó manager.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">Advertise Address <span className="text-zinc-600">(opcional)</span></label>
        <input
          type="text"
          placeholder="ex: 192.168.1.10"
          value={advertiseAddr}
          onChange={(e) => setAdvertiseAddr(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-zinc-600">
          Deixe vazio para usar o IP padrão da máquina.
        </p>
      </div>

      <button
        onClick={handleInit}
        disabled={initSwarm.isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
      >
        {initSwarm.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Inicializar Swarm
      </button>
    </div>
  );
}
