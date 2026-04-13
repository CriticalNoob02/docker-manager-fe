import clsx from "clsx";

interface Props {
  state: string;
}

const stateStyles: Record<string, string> = {
  running: "bg-green-500/20 text-green-400 border-green-500/30",
  exited: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  restarting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  dead: "bg-red-500/20 text-red-400 border-red-500/30",
  created: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ContainerStatusBadge({ state }: Props) {
  const styles = stateStyles[state] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        styles
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {state}
    </span>
  );
}
