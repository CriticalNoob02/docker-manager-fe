import type { Node, Edge } from "@xyflow/react";
import type { BuilderNodeData } from "../components/BuilderNode";

// ─── Internal service definition (full Compose spec subset) ──────────────────

interface ServiceDef {
  image?: string;
  build?: string;
  command?: string;
  container_name?: string;
  hostname?: string;
  restart?: string;
  profiles?: string[];
  ports?: string[];
  environment?: string[];
  volumes?: string[];
  labels?: string[];
  networks?: string[];
  depends_on?: string[];
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
  deploy?: {
    replicas?: number;
    resources?: {
      limits?: {
        memory?: string;
        cpus?: string;
      };
    };
  };
}

// ─── YAML generation ─────────────────────────────────────────────────────────

export function generateComposeYaml(nodes: Node[], edges: Edge[]): string {
  const services: Record<string, ServiceDef> = {};
  const sharedNetworks = new Set<string>();

  // Build service map from nodes
  for (const node of nodes) {
    const d = node.data as unknown as BuilderNodeData;
    const svc: ServiceDef = {};

    // ── Basic ──────────────────────────────────────────────────────────────
    if (d.image)               svc.image = d.image;
    if (d.build?.trim())       svc.build = d.build.trim();
    if (d.command?.trim())     svc.command = d.command.trim();
    if (d.ports?.length)       svc.ports = d.ports.filter(Boolean);
    if (d.environment?.length) svc.environment = d.environment.filter(Boolean);
    if (d.volumes?.length)     svc.volumes = d.volumes.filter(Boolean);

    // ── Deployment ────────────────────────────────────────────────────────
    if (d.containerName?.trim()) svc.container_name = d.containerName.trim();
    if (d.hostname?.trim())      svc.hostname = d.hostname.trim();
    if (d.restart)               svc.restart = d.restart;
    if (d.profiles?.filter(Boolean).length)
      svc.profiles = d.profiles.filter(Boolean);

    // ── Labels ────────────────────────────────────────────────────────────
    if (d.labels?.filter(Boolean).length)
      svc.labels = d.labels.filter(Boolean);

    // ── Healthcheck ───────────────────────────────────────────────────────
    if (d.healthcheck?.test?.trim()) {
      const test = d.healthcheck.test.trim();
      // If user wrote a raw JSON array (e.g. ["CMD","curl",...]), keep as-is via string;
      // otherwise wrap in CMD-SHELL
      const testArr: string[] = test.startsWith("[")
        ? JSON.parse(test)
        : ["CMD-SHELL", test];

      svc.healthcheck = { test: testArr };
      if (d.healthcheck.interval?.trim())   svc.healthcheck.interval = d.healthcheck.interval.trim();
      if (d.healthcheck.timeout?.trim())    svc.healthcheck.timeout = d.healthcheck.timeout.trim();
      if (d.healthcheck.retries?.trim()) {
        const r = parseInt(d.healthcheck.retries, 10);
        if (!isNaN(r)) svc.healthcheck.retries = r;
      }
      if (d.healthcheck.startPeriod?.trim())
        svc.healthcheck.start_period = d.healthcheck.startPeriod.trim();
    }

    // ── Deploy / Resources ────────────────────────────────────────────────
    const hasReplicas = d.deploy?.replicas?.trim();
    const hasMem      = d.deploy?.memLimit?.trim();
    const hasCpus     = d.deploy?.cpus?.trim();

    if (hasReplicas || hasMem || hasCpus) {
      svc.deploy = {};
      if (hasReplicas) {
        const r = parseInt(d.deploy!.replicas, 10);
        if (!isNaN(r)) svc.deploy.replicas = r;
      }
      if (hasMem || hasCpus) {
        svc.deploy.resources = { limits: {} };
        if (hasMem)  svc.deploy.resources.limits!.memory = hasMem;
        if (hasCpus) svc.deploy.resources.limits!.cpus   = hasCpus;
      }
    }

    services[d.name] = svc;
  }

  // ── Build relationships from edges ────────────────────────────────────────
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const relation = (edge.data?.relation as string) || "network";
    const src = (nodeById[edge.source]?.data as unknown as BuilderNodeData)?.name;
    const tgt = (nodeById[edge.target]?.data as unknown as BuilderNodeData)?.name;
    if (!src || !tgt || !services[src] || !services[tgt]) continue;

    if (relation === "depends_on") {
      services[src].depends_on ??= [];
      if (!services[src].depends_on!.includes(tgt)) services[src].depends_on!.push(tgt);
    } else if (relation === "network") {
      const netName = (edge.data?.networkName as string) || "app-network";
      sharedNetworks.add(netName);
      for (const name of [src, tgt]) {
        services[name].networks ??= [];
        if (!services[name].networks!.includes(netName)) services[name].networks!.push(netName);
      }
    } else if (relation === "env_ref") {
      services[src].depends_on ??= [];
      if (!services[src].depends_on!.includes(tgt)) services[src].depends_on!.push(tgt);
    }
  }

  // ── Render YAML ───────────────────────────────────────────────────────────
  const lines: string[] = ["services:"];

  for (const [name, svc] of Object.entries(services)) {
    lines.push(`  ${name}:`);

    if (svc.image)          lines.push(`    image: ${svc.image}`);
    if (svc.build)          lines.push(`    build: ${svc.build}`);
    if (svc.container_name) lines.push(`    container_name: ${svc.container_name}`);
    if (svc.hostname)       lines.push(`    hostname: ${svc.hostname}`);
    if (svc.restart)        lines.push(`    restart: ${svc.restart}`);
    if (svc.command)        lines.push(`    command: ${JSON.stringify(svc.command)}`);

    if (svc.profiles?.length) {
      lines.push("    profiles:");
      for (const p of svc.profiles) lines.push(`      - ${p}`);
    }

    if (svc.ports?.length) {
      lines.push("    ports:");
      for (const p of svc.ports) lines.push(`      - "${p}"`);
    }

    if (svc.environment?.length) {
      lines.push("    environment:");
      for (const e of svc.environment) lines.push(`      - ${e}`);
    }

    if (svc.volumes?.length) {
      lines.push("    volumes:");
      for (const v of svc.volumes) lines.push(`      - ${v}`);
    }

    if (svc.labels?.length) {
      lines.push("    labels:");
      for (const l of svc.labels) lines.push(`      - ${l}`);
    }

    if (svc.networks?.length) {
      lines.push("    networks:");
      for (const n of svc.networks) lines.push(`      - ${n}`);
    }

    if (svc.depends_on?.length) {
      lines.push("    depends_on:");
      for (const d of svc.depends_on) lines.push(`      - ${d}`);
    }

    if (svc.healthcheck) {
      const hc = svc.healthcheck;
      lines.push("    healthcheck:");
      lines.push(`      test: ${JSON.stringify(hc.test)}`);
      if (hc.interval)     lines.push(`      interval: ${hc.interval}`);
      if (hc.timeout)      lines.push(`      timeout: ${hc.timeout}`);
      if (hc.retries !== undefined) lines.push(`      retries: ${hc.retries}`);
      if (hc.start_period) lines.push(`      start_period: ${hc.start_period}`);
    }

    if (svc.deploy) {
      lines.push("    deploy:");
      if (svc.deploy.replicas !== undefined)
        lines.push(`      replicas: ${svc.deploy.replicas}`);
      if (svc.deploy.resources?.limits) {
        lines.push("      resources:");
        lines.push("        limits:");
        const lim = svc.deploy.resources.limits;
        if (lim.memory) lines.push(`          memory: ${lim.memory}`);
        if (lim.cpus)   lines.push(`          cpus: "${lim.cpus}"`);
      }
    }
  }

  if (sharedNetworks.size > 0) {
    lines.push("");
    lines.push("networks:");
    for (const net of sharedNetworks) {
      lines.push(`  ${net}:`);
    }
  }

  return lines.join("\n") + "\n";
}

// ─── File download ────────────────────────────────────────────────────────────

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
