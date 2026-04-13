import type { Node, Edge } from "@xyflow/react";
import type { BuilderNodeData } from "../components/BuilderNode";

interface ServiceDef {
  image?: string;
  command?: string;
  ports?: string[];
  environment?: string[];
  volumes?: string[];
  networks?: string[];
  depends_on?: string[];
}

export function generateComposeYaml(nodes: Node[], edges: Edge[]): string {
  const services: Record<string, ServiceDef> = {};
  const sharedNetworks = new Set<string>();

  // Build service map from nodes
  for (const node of nodes) {
    const d = node.data as unknown as BuilderNodeData;
    const svc: ServiceDef = {};
    if (d.image)                    svc.image = d.image;
    if (d.command?.trim())          svc.command = d.command;
    if (d.ports?.length)            svc.ports = d.ports.filter(Boolean);
    if (d.environment?.length)      svc.environment = d.environment.filter(Boolean);
    if (d.volumes?.length)          svc.volumes = d.volumes.filter(Boolean);
    services[d.name] = svc;
  }

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Build relationships from edges
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
      // env_ref → depends_on semantically
      services[src].depends_on ??= [];
      if (!services[src].depends_on!.includes(tgt)) services[src].depends_on!.push(tgt);
    }
  }

  // Render YAML
  const lines: string[] = ["services:"];

  for (const [name, svc] of Object.entries(services)) {
    lines.push(`  ${name}:`);
    if (svc.image)              lines.push(`    image: ${svc.image}`);
    if (svc.command)            lines.push(`    command: ${JSON.stringify(svc.command)}`);
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
    if (svc.networks?.length) {
      lines.push("    networks:");
      for (const n of svc.networks) lines.push(`      - ${n}`);
    }
    if (svc.depends_on?.length) {
      lines.push("    depends_on:");
      for (const d of svc.depends_on) lines.push(`      - ${d}`);
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

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
