"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateContainer } from "@/modules/containers/hooks/useContainers";
import { useToast } from "@/shared/hooks/useToast";
import type { PortBinding } from "@/shared/services/containers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string;
}

export function RunContainerModal({ open, onOpenChange, image }: Props) {
  const [name, setName] = useState("");
  const [ports, setPorts] = useState<PortBinding[]>([]);
  const [env, setEnv] = useState<string[]>([]);
  const [autoStart, setAutoStart] = useState(true);

  const { mutate, isPending } = useCreateContainer();
  const { toast } = useToast();

  const handleClose = () => {
    if (isPending) return;
    setName("");
    setPorts([]);
    setEnv([]);
    setAutoStart(true);
    onOpenChange(false);
  };

  const addPort = () => setPorts((prev) => [...prev, { host: "", container: "" }]);
  const removePort = (i: number) => setPorts((prev) => prev.filter((_, idx) => idx !== i));
  const updatePort = (i: number, field: keyof PortBinding, value: string) =>
    setPorts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));

  const addEnv = () => setEnv((prev) => [...prev, ""]);
  const removeEnv = (i: number) => setEnv((prev) => prev.filter((_, idx) => idx !== i));
  const updateEnv = (i: number, value: string) =>
    setEnv((prev) => prev.map((v, idx) => (idx === i ? value : v)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validPorts = ports.filter((p) => p.host.trim() && p.container.trim());
    const validEnv = env.filter((e) => e.trim());

    mutate(
      {
        image,
        name: name.trim() || undefined,
        ports: validPorts,
        env: validEnv,
        autoStart,
      },
      {
        onSuccess: () => {
          toast({ title: `Container criado${autoStart ? " e iniciado" : ""}`, variant: "success" });
          handleClose();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message ?? "Erro ao criar container";
          toast({ title: message, variant: "error" });
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-[520px] max-h-[85vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-white font-semibold text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" />
              Executar container
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Imagem (readonly) */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Imagem</label>
              <div className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-400 font-mono">
                {image}
              </div>
            </div>

            {/* Nome do container */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Nome <span className="text-zinc-600">(opcional)</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="meu-container"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Portas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-500">
                  Portas <span className="text-zinc-600">(host → container)</span>
                </label>
                <button
                  type="button"
                  onClick={addPort}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
              {ports.length === 0 && (
                <p className="text-xs text-zinc-600">Nenhuma porta mapeada.</p>
              )}
              <div className="flex flex-col gap-2">
                {ports.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={p.host}
                      onChange={(e) => updatePort(i, "host", e.target.value)}
                      placeholder="8080"
                      className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="text-zinc-600 text-xs">→</span>
                    <input
                      value={p.container}
                      onChange={(e) => updatePort(i, "container", e.target.value)}
                      placeholder="80"
                      className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removePort(i)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variáveis de ambiente */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-500">Variáveis de ambiente</label>
                <button
                  type="button"
                  onClick={addEnv}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
              {env.length === 0 && (
                <p className="text-xs text-zinc-600">Nenhuma variável definida.</p>
              )}
              <div className="flex flex-col gap-2">
                {env.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={v}
                      onChange={(e) => updateEnv(i, e.target.value)}
                      placeholder="CHAVE=valor"
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeEnv(i)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto start */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors ${autoStart ? "bg-green-600" : "bg-zinc-700"}`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoStart ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
              <span className="text-sm text-zinc-300">Iniciar container após criar</span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {isPending ? "Criando..." : "Executar"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
