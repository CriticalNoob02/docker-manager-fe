"use client";

import { useState, useEffect } from "react";
import { X, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { BuilderNodeData, HealthcheckConfig, DeployConfig } from "./BuilderNode";

interface Props {
  nodeId: string;
  data: BuilderNodeData;
  onSave: (id: string, data: Partial<BuilderNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function listToText(arr: string[]) {
  return arr.filter(Boolean).join("\n");
}
function textToList(text: string) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

const RESTART_OPTIONS = [
  { value: "",                label: "— padrão —" },
  { value: "no",              label: "no" },
  { value: "always",          label: "always" },
  { value: "unless-stopped",  label: "unless-stopped" },
  { value: "on-failure",      label: "on-failure" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionToggle({
  label,
  open,
  onToggle,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full text-left py-1 group"
    >
      {open
        ? <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        : <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      }
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto text-[10px] text-zinc-600">{badge}</span>
      )}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NodeEditPanel({ nodeId, data, onSave, onDelete, onClose }: Props) {
  // ── Basic fields ───────────────────────────────────────────────────────────
  const [name, setName]       = useState(data.name);
  const [image, setImage]     = useState(data.image);
  const [ports, setPorts]     = useState(listToText(data.ports));
  const [env, setEnv]         = useState(listToText(data.environment));
  const [volumes, setVolumes] = useState(listToText(data.volumes));
  const [command, setCommand] = useState(data.command);

  // ── Advanced: Deployment ───────────────────────────────────────────────────
  const [build, setBuild]               = useState(data.build ?? "");
  const [profiles, setProfiles]         = useState(listToText(data.profiles ?? []));
  const [restart, setRestart]           = useState(data.restart ?? "");
  const [containerName, setContainerName] = useState(data.containerName ?? "");
  const [hostname, setHostname]         = useState(data.hostname ?? "");

  // ── Advanced: Labels ───────────────────────────────────────────────────────
  const [labels, setLabels] = useState(listToText(data.labels ?? []));

  // ── Advanced: Healthcheck ──────────────────────────────────────────────────
  const [hcTest, setHcTest]               = useState(data.healthcheck?.test ?? "");
  const [hcInterval, setHcInterval]       = useState(data.healthcheck?.interval ?? "30s");
  const [hcTimeout, setHcTimeout]         = useState(data.healthcheck?.timeout ?? "10s");
  const [hcRetries, setHcRetries]         = useState(data.healthcheck?.retries ?? "3");
  const [hcStartPeriod, setHcStartPeriod] = useState(data.healthcheck?.startPeriod ?? "");

  // ── Advanced: Deploy ───────────────────────────────────────────────────────
  const [replicas, setReplicas] = useState(data.deploy?.replicas ?? "");
  const [memLimit, setMemLimit] = useState(data.deploy?.memLimit ?? "");
  const [cpus, setCpus]         = useState(data.deploy?.cpus ?? "");

  // ── Section open state ─────────────────────────────────────────────────────
  const [openDeployment, setOpenDeployment]   = useState(false);
  const [openLabels, setOpenLabels]           = useState(false);
  const [openHealthcheck, setOpenHealthcheck] = useState(false);
  const [openDeploy, setOpenDeploy]           = useState(false);

  // Reset when switching nodes
  useEffect(() => {
    setName(data.name);
    setImage(data.image);
    setPorts(listToText(data.ports));
    setEnv(listToText(data.environment));
    setVolumes(listToText(data.volumes));
    setCommand(data.command);
    setBuild(data.build ?? "");
    setProfiles(listToText(data.profiles ?? []));
    setRestart(data.restart ?? "");
    setContainerName(data.containerName ?? "");
    setHostname(data.hostname ?? "");
    setLabels(listToText(data.labels ?? []));
    setHcTest(data.healthcheck?.test ?? "");
    setHcInterval(data.healthcheck?.interval ?? "30s");
    setHcTimeout(data.healthcheck?.timeout ?? "10s");
    setHcRetries(data.healthcheck?.retries ?? "3");
    setHcStartPeriod(data.healthcheck?.startPeriod ?? "");
    setReplicas(data.deploy?.replicas ?? "");
    setMemLimit(data.deploy?.memLimit ?? "");
    setCpus(data.deploy?.cpus ?? "");
  }, [nodeId, data]);

  // ── Save helper ────────────────────────────────────────────────────────────

  function collectAndSave() {
    const healthcheck: HealthcheckConfig = {
      test: hcTest.trim(),
      interval: hcInterval.trim(),
      timeout: hcTimeout.trim(),
      retries: hcRetries.trim(),
      startPeriod: hcStartPeriod.trim(),
    };
    const deploy: DeployConfig = {
      replicas: replicas.trim(),
      memLimit: memLimit.trim(),
      cpus: cpus.trim(),
    };
    onSave(nodeId, {
      name:          name.trim() || data.name,
      image:         image.trim(),
      ports:         textToList(ports),
      environment:   textToList(env),
      volumes:       textToList(volumes),
      command:       command.trim(),
      build:         build.trim(),
      profiles:      textToList(profiles),
      restart,
      containerName: containerName.trim(),
      hostname:      hostname.trim(),
      labels:        textToList(labels),
      healthcheck,
      deploy,
    });
  }

  // Derived badge counts to show in collapsed section headers
  const deploymentBadge = [
    build, profiles, restart, containerName, hostname,
  ].filter(Boolean).length + textToList(profiles).length;

  const labelsBadge   = textToList(labels).length;
  const hcBadge       = hcTest ? 1 : 0;
  const deployBadge   = [replicas, memLimit, cpus].filter(Boolean).length;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-72 shrink-0 flex flex-col border-l border-zinc-800 bg-zinc-900/80 backdrop-blur overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-100">Editar serviço</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onDelete(nodeId); onClose(); }}
            className="text-zinc-600 hover:text-red-400 transition-colors"
            title="Remover nó"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 flex flex-col gap-4 p-4">

        {/* ── Basic ─────────────────────────────────────────────────────────── */}
        <Field label="Nome do serviço">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={collectAndSave}
            className={INPUT}
            placeholder="meu-servico"
          />
        </Field>

        <Field label="Imagem">
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            onBlur={collectAndSave}
            className={INPUT}
            placeholder="nginx:alpine"
          />
        </Field>

        <Field label="Portas" hint="uma por linha — ex: 8080:80">
          <textarea
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            onBlur={collectAndSave}
            rows={3}
            className={`${INPUT} resize-none`}
            placeholder={"8080:80\n443:443"}
          />
        </Field>

        <Field label="Variáveis de ambiente" hint="uma por linha — ex: KEY=value">
          <textarea
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            onBlur={collectAndSave}
            rows={4}
            className={`${INPUT} resize-none`}
            placeholder={"NODE_ENV=production\nPORT=3000"}
          />
        </Field>

        <Field label="Volumes" hint="uma por linha — ex: ./data:/data">
          <textarea
            value={volumes}
            onChange={(e) => setVolumes(e.target.value)}
            onBlur={collectAndSave}
            rows={3}
            className={`${INPUT} resize-none`}
            placeholder="./data:/app/data"
          />
        </Field>

        <Field label="Command">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onBlur={collectAndSave}
            className={INPUT}
            placeholder="node server.js"
          />
        </Field>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="h-px bg-zinc-800" />

        {/* ── Section: Deployment ───────────────────────────────────────────── */}
        <SectionToggle
          label="Deployment"
          open={openDeployment}
          onToggle={() => setOpenDeployment((v) => !v)}
          badge={deploymentBadge}
        />
        {openDeployment && (
          <div className="flex flex-col gap-4 pl-4 border-l border-zinc-800">
            <Field label="Build Context" hint="caminho ou URL do Dockerfile">
              <input
                value={build}
                onChange={(e) => setBuild(e.target.value)}
                onBlur={collectAndSave}
                className={INPUT}
                placeholder="./app"
              />
            </Field>

            <Field label="Profiles" hint="um por linha">
              <textarea
                value={profiles}
                onChange={(e) => setProfiles(e.target.value)}
                onBlur={collectAndSave}
                rows={3}
                className={`${INPUT} resize-none`}
                placeholder={"dev\ndebug"}
              />
            </Field>

            <Field label="Restart Policy">
              <select
                value={restart}
                onChange={(e) => { setRestart(e.target.value); }}
                onBlur={collectAndSave}
                className={`${INPUT} cursor-pointer`}
              >
                {RESTART_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Container Name" hint="sobrescreve o nome padrão">
              <input
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                onBlur={collectAndSave}
                className={INPUT}
                placeholder="meu-container"
              />
            </Field>

            <Field label="Hostname">
              <input
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                onBlur={collectAndSave}
                className={INPUT}
                placeholder="api.internal"
              />
            </Field>
          </div>
        )}

        {/* ── Section: Labels ───────────────────────────────────────────────── */}
        <SectionToggle
          label="Labels"
          open={openLabels}
          onToggle={() => setOpenLabels((v) => !v)}
          badge={labelsBadge}
        />
        {openLabels && (
          <div className="flex flex-col gap-4 pl-4 border-l border-zinc-800">
            <Field label="Labels" hint="uma por linha — ex: com.example.env=prod">
              <textarea
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                onBlur={collectAndSave}
                rows={4}
                className={`${INPUT} resize-none`}
                placeholder={"com.example.env=prod\ntraefik.enable=true"}
              />
            </Field>
          </div>
        )}

        {/* ── Section: Healthcheck ──────────────────────────────────────────── */}
        <SectionToggle
          label="Healthcheck"
          open={openHealthcheck}
          onToggle={() => setOpenHealthcheck((v) => !v)}
          badge={hcBadge}
        />
        {openHealthcheck && (
          <div className="flex flex-col gap-4 pl-4 border-l border-zinc-800">
            <Field label="Test" hint="comando de verificação">
              <input
                value={hcTest}
                onChange={(e) => setHcTest(e.target.value)}
                onBlur={collectAndSave}
                className={INPUT}
                placeholder="curl -f http://localhost/health"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Interval">
                <input
                  value={hcInterval}
                  onChange={(e) => setHcInterval(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="30s"
                />
              </Field>
              <Field label="Timeout">
                <input
                  value={hcTimeout}
                  onChange={(e) => setHcTimeout(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="10s"
                />
              </Field>
              <Field label="Retries">
                <input
                  value={hcRetries}
                  onChange={(e) => setHcRetries(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="3"
                />
              </Field>
              <Field label="Start Period">
                <input
                  value={hcStartPeriod}
                  onChange={(e) => setHcStartPeriod(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="40s"
                />
              </Field>
            </div>
          </div>
        )}

        {/* ── Section: Deploy ───────────────────────────────────────────────── */}
        <SectionToggle
          label="Deploy / Recursos"
          open={openDeploy}
          onToggle={() => setOpenDeploy((v) => !v)}
          badge={deployBadge}
        />
        {openDeploy && (
          <div className="flex flex-col gap-4 pl-4 border-l border-zinc-800">
            <Field label="Replicas">
              <input
                value={replicas}
                onChange={(e) => setReplicas(e.target.value)}
                onBlur={collectAndSave}
                className={INPUT}
                placeholder="1"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Mem Limit">
                <input
                  value={memLimit}
                  onChange={(e) => setMemLimit(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="512m"
                />
              </Field>
              <Field label="CPUs">
                <input
                  value={cpus}
                  onChange={(e) => setCpus(e.target.value)}
                  onBlur={collectAndSave}
                  className={INPUT}
                  placeholder="0.5"
                />
              </Field>
            </div>
          </div>
        )}

        {/* bottom padding */}
        <div className="h-2" />
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";
