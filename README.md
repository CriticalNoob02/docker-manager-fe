# radar-docker-manager-fe

Interface web para gerenciamento local de containers Docker. Consome a API do **docker-manager-ms**.

## Stack

| Tecnologia | Papel |
|---|---|
| Next.js 15 (App Router) + Turbopack | Framework React com SSR/RSC |
| React 19 | UI |
| TailwindCSS v4 | Estilização |
| TanStack Query v5 | Cache e fetching de dados REST |
| Socket.io Client | Streams em tempo real |
| Recharts | Gráficos de CPU e memória |
| XY Flow (React Flow) | Visualização e editor de grafos Compose |
| Radix UI | Primitivos acessíveis (Dialog, DropdownMenu, Toast, etc.) |
| Zustand | Estado global |
| Lucide React | Ícones |
| date-fns | Formatação de datas |

## Pré-requisitos

- Node.js 20+
- **docker-manager-ms** rodando em `http://localhost:8089`

## Instalação e execução

```bash
yarn install
yarn run dev     # Next.js com Turbopack (hot-reload)
yarn run build   # Build de produção
yarn start       # Serve o build de produção
```

A interface sobe na porta **3030** por padrão.

## Estrutura

```
src/
├── app/                        # Rotas Next.js (App Router)
│   ├── layout.tsx              # Layout raiz (providers, sidebar)
│   ├── page.tsx                # Redireciona para /containers
│   ├── containers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── logs/page.tsx
│   │       └── stats/page.tsx
│   ├── images/page.tsx
│   ├── volumes/page.tsx
│   ├── networks/page.tsx
│   ├── compose/
│   │   ├── page.tsx
│   │   └── builder/page.tsx
│   └── metrics/page.tsx
│
├── core/
│   ├── apis/api.ts             # Instância axios (base URL do MS)
│   ├── config/socket.ts        # Configuração Socket.io cliente
│   └── providers/
│       ├── index.tsx           # Composição de todos os providers
│       ├── ReactQueryProvider.tsx
│       ├── SocketContext.tsx   # Contexto do socket /docker
│       ├── ThemeProvider.tsx
│       └── ToastProvider.tsx
│
├── modules/                    # Features por domínio
│   ├── containers/
│   │   ├── components/
│   │   │   ├── ContainerTable.tsx       # Tabela com TanStack Table
│   │   │   ├── ContainerActionsMenu.tsx # Dropdown start/stop/restart/remove
│   │   │   ├── ContainerStatusBadge.tsx
│   │   │   ├── DescriptionCell.tsx      # Edição inline de descrição
│   │   │   ├── LogViewer.tsx            # Viewer de logs em tempo real
│   │   │   └── StatsChart.tsx           # Gráficos CPU e memória (Recharts)
│   │   ├── hooks/
│   │   │   ├── useContainers.ts         # Lista com polling 30s
│   │   │   ├── useContainerAction.ts    # Mutações start/stop/restart/remove
│   │   │   ├── useContainerLogs.ts      # Subscrição socket logs
│   │   │   └── useContainerStats.ts     # Subscrição socket stats
│   │   └── screens/
│   │       ├── ContainerListScreen.tsx
│   │       ├── ContainerLogsScreen.tsx
│   │       └── ContainerStatsScreen.tsx
│   │
│   ├── images/
│   │   ├── components/
│   │   │   ├── ImageTable.tsx
│   │   │   └── PullImageModal.tsx       # Pull com progresso em tempo real
│   │   ├── hooks/
│   │   │   ├── useImages.ts
│   │   │   └── usePullImage.ts          # Eventos socket pull
│   │   └── screens/ImageListScreen.tsx
│   │
│   ├── volumes/
│   │   ├── components/
│   │   │   ├── VolumeTable.tsx
│   │   │   └── CreateVolumeModal.tsx
│   │   ├── hooks/useVolumes.ts
│   │   └── screens/VolumeListScreen.tsx
│   │
│   ├── networks/
│   │   ├── components/
│   │   │   ├── NetworkTable.tsx
│   │   │   └── CreateNetworkModal.tsx
│   │   ├── hooks/useNetworks.ts
│   │   └── screens/NetworkListScreen.tsx
│   │
│   ├── compose/
│   │   ├── components/
│   │   │   ├── ComposeGraph.tsx          # Grafo interativo do stack
│   │   │   ├── ServiceNode.tsx / VolumeNode.tsx / BuilderNode.tsx
│   │   │   ├── BuilderEdge.tsx
│   │   │   ├── FlowBuilder.tsx           # Editor drag-and-drop
│   │   │   ├── FlowCanvas.tsx
│   │   │   ├── NodeEditPanel.tsx
│   │   │   ├── StackSelector.tsx
│   │   │   ├── ContainerPanel.tsx
│   │   │   └── GraphLegend.tsx
│   │   ├── hooks/
│   │   │   ├── useComposeStacks.ts
│   │   │   └── useComposeGraph.ts
│   │   ├── lib/
│   │   │   ├── layout.ts                # Auto-layout com dagre
│   │   │   └── exportCompose.ts         # Exporta grafo → docker-compose.yml
│   │   └── screens/
│   │       ├── ComposeScreen.tsx
│   │       └── ComposeBuilderScreen.tsx
│   │
│   └── metrics/
│       ├── hooks/useMetrics.ts          # Polling 10s
│       └── screens/MetricsScreen.tsx
│
└── shared/
    ├── components/
    │   ├── ConfirmDialog.tsx
    │   └── layout/
    │       ├── AppShell.tsx             # Wrapper com Sidebar
    │       └── Sidebar.tsx              # Navegação lateral
    ├── constants/queryKeys.ts           # Enum das query keys do React Query
    ├── hooks/useToast.ts
    └── services/                        # Camada de acesso à API
        ├── containers.ts
        ├── images.ts
        ├── volumes.ts
        ├── networks.ts
        ├── compose.ts
        └── metrics.ts
```

## Funcionalidades

### Containers
- Listagem completa (running e stopped) com status em tempo real via eventos Docker
- Ações individuais: iniciar, parar, reiniciar, remover
- Descrição customizada editável inline (persistida no backend)
- **Logs em tempo real** via WebSocket — buffer dos últimos 200 logs com auto-scroll
- **Stats em tempo real** via WebSocket — gráficos de CPU (%) e Memória (MB) com histórico de 60 pontos

### Images
- Listagem com tamanho e data de criação
- Remoção de imagens
- **Pull com progresso em tempo real** — exibe cada layer sendo baixada/extraída via eventos do socket

### Volumes
- Listagem com driver e mountpoint
- Criação com nome e driver customizáveis
- Remoção

### Redes
- Listagem com driver e escopo
- Criação com nome e driver (bridge, host, overlay, etc.)
- Remoção

### Compose
- **Visualizador**: seleciona um stack ativo e renderiza um grafo interativo (XY Flow) com serviços, volumes e dependências. Nós exibem o status do container em tempo real.
- **Builder**: editor visual drag-and-drop para criar stacks do zero — adiciona serviços, conecta dependências, edita propriedades no painel lateral e exporta o arquivo `docker-compose.yml`.

### Métricas
Dashboard de visão geral com atualização automática a cada 10 segundos:

- **Containers**: total, rodando e parados
- **Recursos** (agregado dos containers ativos): CPU total (%), memória (uso + limite), IO de bloco (leitura e escrita), rede (RX e TX)
- **Armazenamento**: tamanho total de imagens e containers
- **Redes do Compose**: agrupadas por projeto, com cada rede, seu driver e os containers conectados com seus IPs

## Configuração da API

A base URL da API é configurada em `src/core/apis/api.ts`. Por padrão aponta para `http://localhost:8089`. Para alterar, crie um `.env`:

```env
NEXT_PUBLIC_API_URL=http://seu-host:3030
```

E atualize `api.ts` para usar `process.env.NEXT_PUBLIC_API_URL`.
