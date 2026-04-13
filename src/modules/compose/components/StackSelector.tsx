"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { ComposeStack } from "@/shared/services/compose";

interface Props {
  stacks: ComposeStack[];
  value: string | null;
  onChange: (file: string) => void;
}

export function StackSelector({ stacks, value, onChange }: Props) {
  return (
    <Select.Root value={value ?? ""} onValueChange={onChange}>
      <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-sm text-zinc-200 hover:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]">
        <Select.Value placeholder="Selecionar stack…" />
        <Select.Icon className="ml-auto">
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-50 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 shadow-xl"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {stacks.map((s) => (
              <Select.Item
                key={s.configFile}
                value={s.configFile}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-zinc-200 cursor-pointer select-none hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none data-[state=checked]:text-blue-400"
              >
                <Select.ItemText>{s.name}</Select.ItemText>
                <span className="ml-auto text-xs text-zinc-500">{s.status}</span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
