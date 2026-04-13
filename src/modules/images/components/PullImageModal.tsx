"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Download, ChevronDown, ChevronUp, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { usePullImage, type PullAuth } from "../hooks/usePullImage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REGISTRY_PRESETS = [
  { label: "GHCR (GitHub)", value: "ghcr.io" },
  { label: "Docker Hub", value: "index.docker.io" },
  { label: "GitLab", value: "registry.gitlab.com" },
  { label: "AWS ECR Public", value: "public.ecr.aws" },
  { label: "Outro", value: "" },
];

export function PullImageModal({ open, onOpenChange }: Props) {
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("latest");

  // Auth state
  const [authEnabled, setAuthEnabled] = useState(false);
  const [registry, setRegistry] = useState("ghcr.io");
  const [registryCustom, setRegistryCustom] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { pull, isPulling, progress, done, error, reset } = usePullImage();

  const handleClose = () => {
    if (!isPulling) {
      reset();
      setImage("");
      setTag("latest");
      setAuthEnabled(false);
      setRegistry("ghcr.io");
      setRegistryCustom("");
      setUsername("");
      setPassword("");
      setShowPassword(false);
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim()) return;

    let auth: PullAuth | undefined;
    if (authEnabled && username && password) {
      const serveraddress = registry === "" ? registryCustom.trim() : registry;
      auth = { serveraddress, username: username.trim(), password };
    }

    pull(image.trim(), tag.trim() || "latest", auth);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-[480px] shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-white font-semibold text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              Pull de imagem
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                disabled={isPulling}
                className="text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {!isPulling && !done && !error && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Image + Tag */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 mb-1 block">Imagem</label>
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="ex: nginx, ghcr.io/org/app"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs text-zinc-500 mb-1 block">Tag</label>
                  <input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="latest"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Auth toggle */}
              <div className="border border-zinc-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAuthEnabled((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    Registry privado (autenticação)
                  </span>
                  {authEnabled ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {authEnabled && (
                  <div className="px-3 pb-3 pt-1 flex flex-col gap-3 border-t border-zinc-700 bg-zinc-800/30">
                    {/* Registry preset */}
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Registry</label>
                      <select
                        value={registry}
                        onChange={(e) => setRegistry(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        {REGISTRY_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom registry URL shown only when "Outro" is selected */}
                    {registry === "" && (
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">URL do registry</label>
                        <input
                          value={registryCustom}
                          onChange={(e) => setRegistryCustom(e.target.value)}
                          placeholder="registry.example.com"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Username */}
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        Usuário
                        {registry === "ghcr.io" && (
                          <span className="ml-1 text-zinc-600">(seu username do GitHub)</span>
                        )}
                      </label>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        autoComplete="username"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Password / Token */}
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {registry === "ghcr.io" ? "Token (PAT com escopo read:packages)" : "Senha / Token"}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={registry === "ghcr.io" ? "ghp_..." : "••••••••"}
                          autoComplete="current-password"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-3 pr-9 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!image.trim() || (authEnabled && (!username || !password || (registry === "" && !registryCustom.trim())))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
              >
                Pull
              </button>
            </form>
          )}

          {isPulling && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-500">
                Baixando <span className="text-white font-mono">{image}:{tag}</span>...
              </p>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 font-mono text-xs">
                {progress.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-400">
                    {p.id && <span className="text-zinc-600">[{p.id}]</span>}
                    <span>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done && (
            <div className="text-center py-4">
              <p className="text-green-400 font-medium text-sm">Pull concluído!</p>
              <p className="text-zinc-500 text-xs mt-1">
                <span className="font-mono">{image}:{tag}</span> está disponível
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-md transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-3">
              <p className="text-red-400 text-sm">Erro: {error}</p>
              <button
                onClick={reset}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-md transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
