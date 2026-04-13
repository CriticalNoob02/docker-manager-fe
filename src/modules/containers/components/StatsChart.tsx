"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { StatPoint } from "../hooks/useContainerStats";

interface Props {
  points: StatPoint[];
}

export function StatsChart({ points }: Props) {
  const data = points.map((p) => ({
    time: format(new Date(p.timestamp), "HH:mm:ss"),
    cpu: parseFloat(p.cpu.toFixed(2)),
    memory: parseFloat(p.memory.toFixed(0)),
  }));

  const latest = points[points.length - 1];

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">CPU</p>
          <p className="text-2xl font-semibold text-blue-400">
            {latest ? `${latest.cpu.toFixed(2)}%` : "—"}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-1">Memória</p>
          <p className="text-2xl font-semibold text-purple-400">
            {latest
              ? `${latest.memory.toFixed(0)} MB / ${latest.memoryLimit.toFixed(0)} MB`
              : "—"}
          </p>
        </div>
      </div>

      {/* CPU Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-zinc-500 mb-4">CPU (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#71717a" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", fontSize: 12 }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line type="monotone" dataKey="cpu" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Memory Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-zinc-500 mb-4">Memória (MB)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#71717a" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} unit=" MB" />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", fontSize: 12 }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line type="monotone" dataKey="memory" stroke="#c084fc" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
