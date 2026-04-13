"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useEffect, useRef, useState } from "react";

interface Props {
  lines: string[];
}

// Strip ANSI escape codes
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[mGKHF]/g, "");
}

// Strip Docker log timestamp prefix (format: 2024-01-01T00:00:00.000000000Z )
function stripTimestamp(str: string): string {
  return str.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z /, "");
}

export function LogViewer({ lines }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(true);

  useEffect(() => {
    if (follow && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, follow]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{lines.length} linhas</span>
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={follow}
            onChange={(e) => setFollow(e.target.checked)}
            className="accent-blue-500"
          />
          Seguir logs
        </label>
      </div>

      <ScrollArea.Root className="flex-1 min-h-0 rounded-lg border border-zinc-800 bg-zinc-950">
        <ScrollArea.Viewport className="h-full w-full p-4">
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all leading-5">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {stripAnsi(stripTimestamp(line))}
              </span>
            ))}
            <div ref={bottomRef} />
          </pre>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none p-0.5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-zinc-700" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
