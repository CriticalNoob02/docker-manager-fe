"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Network } from "lucide-react";
import { useState } from "react";
import { useCreateNetwork } from "../hooks/useNetworks";
import { useToast } from "@/shared/hooks/useToast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DRIVERS = ["bridge", "overlay", "macvlan", "ipvlan", "none", "host"];

export function CreateNetworkModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [driver, setDriver] = useState("bridge");
  const { mutate, isPending } = useCreateNetwork();
  const { toast } = useToast();

  const handleClose = () => {
    if (!isPending) {
      setName("");
      setDriver("bridge");
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), driver },
      {
        onSuccess: () => {
          toast({ title: "Rede criada", variant: "success" });
          handleClose();
        },
        onError: (err: any) =>
          toast({
            title: "Erro ao criar rede",
            description: err?.response?.data?.error ?? err.message,
            variant: "error",
          }),
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-[420px] shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-white font-semibold text-base flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" />
              Criar rede
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="minha-rede"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Driver</label>
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {DRIVERS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
            >
              {isPending ? "Criando..." : "Criar"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
