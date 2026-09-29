# Step 11: Containerização & Orquestração (Docker & Kubernetes)

> **Status Atual:** ⏳ Em Andamento (Pausado — TODOs mapeados para retomada)

---

## 🎯 Objetivo
Transformar o ecossistema do **Controle de Gastos Inteligente** em uma arquitetura pronta para produção corporativa e nuvens privadas/públicas (AWS EKS, GCP GKE, Bare Metal ou VPS própria). 

A meta é empacotar os serviços com **Docker Multi-Stage**, viabilizar desenvolvimento local com **Docker Compose** e orquestrar microsserviços desacoplados com **Kubernetes (K8s)**, incluindo auto-escalonamento horizontal (HPA) e auto-recuperação (Self-Healing).

Adicionalmente, este passo contemplou uma auditoria crítica de **FinOps & Resiliência** para eliminar o consumo excessivo de Request Units (RUs) no TiDB Cloud Serverless.

---

## 🛡️ Otimização Crítica de FinOps: TiDB Serverless & Outbox Event-Driven

Durante a preparação dos probes de monitoramento para o Kubernetes, foi identificado um consumo desproporcional de cota gratuita no **TiDB Cloud**:

1. **Problema Diagnosticado:**
   - O `outbox.relay.ts` realizava um polling com `setInterval(processOutboxQueue, 5000)` (a cada 5 segundos).
   - Com o Render mantido acordado 24/7, eram executadas **~17.280 consultas/dia** (~518.400 consultas/mês) no MySQL, mesmo com zero novos usuários.
   - O endpoint `/api/ping` rodava `SELECT 1` a cada chamada do UptimeRobot (mais 8.600 consultas/mês).

2. **Solução Arquitetural Aplicada:**
   - **Heartbeat em Memória:** `/api/ping` agora responde com status `200 OK` (`{ pong: true, status: "alive" }`) sem bater no banco. Para checagens profundas de diagnóstico, foi adicionado suporte a `GET /api/ping?checkDb=true`.
   - **Outbox Event-Driven:** Em [user.service.ts](file:///c:/Users/caio/Desktop/projetos/node/portfolio/controle_gastos/apps/api/src/services/user.service.ts), a fila de boas-vindas é disparada imediatamente após o commit da transação (`processOutboxQueue()`), garantindo entrega com **0ms de atraso**.
   - **Fallback Resiliente de 5 minutos:** O loop de segurança do relay foi ajustado para executar a cada 5 minutos (`5 * 60 * 1000`), reduzindo as consultas periódicas em **98,4%** e assegurando garantia de entrega (*at-least-once delivery*) caso o Redis sofra instabilidade temporária.

---

## 🛠️ O que foi Implementado até o Momento

### 1. Docker Multi-Stage Builds
- **API (`deploy/docker/api.Dockerfile`):**
  - Base `node:20-alpine`.
  - Estágio de build compilando TypeScript via `npm run build` do monorepo.
  - Estágio final de produção copiando apenas `dist` e dependências de produção para minimizar o tamanho da imagem e a superfície de vulnerabilidades.
- **Web (`deploy/docker/web.Dockerfile`):**
  - Otimizado com `output: "standalone"` no [next.config.ts](file:///c:/Users/caio/Desktop/projetos/node/portfolio/controle_gastos/apps/web/next.config.ts).
  - Copia o servidor Next.js autocontido (`.next/standalone`) e arquivos estáticos públicos (`.next/static`), gerando imagens ultraleves (~120MB).
- **Ignorados Globais (`.dockerignore`):**
  - Prevenção de envio de `node_modules`, pastas de build locais e arquivos de log para o contexto do Docker.

### 2. Orquestração Local (`docker-compose.yml`)
- Criação do manifesto para rodar todo o ecossistema com um único comando (`docker compose up`):
  - **`mysql`**: Banco relacional local com healthcheck.
  - **`redis`**: Instância Redis para fila BullMQ.
  - **`api`**: Servidor Express 5 conectado aos serviços locais.
  - **`worker`**: Contêiner dedicado usando a mesma imagem da API, porém sobrescrevendo o comando de inicialização para isolar o consumo de CPU da fila de e-mails.
  - **`web`**: Interface Next.js 15 rodando em modo standalone.

### 3. Kubernetes: Configurações e Deploy da API
- **ConfigMaps & Secrets (`deploy/k8s/configmap-secrets.yaml`):**
  - Separação estrita de configuração não-sensível (`ConfigMap`) e dados sensíveis/credenciais criptografados em base64 (`Secret`).
- **Deployment & Service da API (`deploy/k8s/api-deployment.yaml`):**
  - 2 Réplicas com balanceamento de carga.
  - **Liveness Probe & Readiness Probe** conectados a `/api/ping` para permitir que o K8s reinicie pods travados automaticamente e só envie tráfego a pods prontos.
  - Limites e reservas de recursos (`requests` e `limits` de CPU e memória).
  - Service do tipo `ClusterIP` expondo a porta interna 3001.

---

## 📋 TODOs para Retomada (Passos Finais)

- [ ] **Criar `deploy/k8s/worker-deployment.yaml`**:
  - Pod dedicado para os workers do BullMQ (desacoplamento de threads e tarefas assíncronas).
- [ ] **Criar `deploy/k8s/web-deployment.yaml`**:
  - Pod e Service do frontend Next.js 15 Standalone.
- [ ] **Criar `deploy/k8s/hpa.yaml`**:
  - Horizontal Pod Autoscaler configurado para escalar a API dinamicamente (de 2 até 5 réplicas) quando o consumo de CPU ultrapassar 70%.
- [ ] **Validação & Deploy**:
  - Commitar as melhorias de FinOps (TiDB) e os manifestos de infraestrutura IaC.
  - Fazer push para a branch `main` e acompanhar a atualização contínua no Render e Vercel.
