export function GraphLegend() {
  return (
    <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
      <span className="flex items-center gap-2">
        <span className="inline-block w-8 border-t-2 border-blue-500" />
        depends_on
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block w-8 border-t-2 border-dashed border-green-500" />
        network
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block w-8 border-t-2 border-dotted border-yellow-400" />
        env_ref
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block w-8 border-t-2 border-dashed border-purple-400" />
        volume
      </span>
    </div>
  );
}
