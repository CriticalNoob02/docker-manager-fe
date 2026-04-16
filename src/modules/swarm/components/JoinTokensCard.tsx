"use client";

import { useState } from "react";
import { useJoinTokens } from "../hooks/useSwarm";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

function TokenRow({ label, token }: { label: string; token: string }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  function copy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const display = visible ? token : token.slice(0, 20) + "•••••••••••••••••••••••••";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2">
        <code className="flex-1 text-xs text-zinc-300 font-mono truncate">{display}</code>
        <button onClick={() => setVisible((v) => !v)} className="text-zinc-500 hover:text-white transition-colors shrink-0">
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button onClick={copy} className="text-zinc-500 hover:text-white transition-colors shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function JoinTokensCard() {
  const { data: tokens, isLoading } = useJoinTokens();

  if (isLoading || !tokens) return null;

  return (
    <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div>
        <h2 className="text-white font-semibold text-base mb-1">Tokens de Join</h2>
        <p className="text-sm text-zinc-400">
          Use estes tokens para adicionar novos nós ao cluster via{" "}
          <code className="text-zinc-300 bg-zinc-800 px-1 rounded">docker swarm join</code>.
        </p>
      </div>
      <TokenRow label="Worker" token={tokens.worker} />
      <TokenRow label="Manager" token={tokens.manager} />
    </div>
  );
}
