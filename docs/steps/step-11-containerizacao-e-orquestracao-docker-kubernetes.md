# Step 11: Containerização & Orquestração (Docker & Kubernetes)

> **Status:** ✅ Concluído

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

- [x] **Criar `deploy/k8s/worker-deployment.yaml`**: Pod dedicado para os workers do BullMQ (desacoplamento de threads e isolamento de CPU).
- [x] **Criar `deploy/k8s/web-deployment.yaml`**: Pod com 2 réplicas e Service ClusterIP do front-end Next.js 15 Standalone.
- [x] **Criar `deploy/k8s/hpa.yaml`**: Horizontal Pod Autoscaler escalando dinamicamente a API (de 2 até 5 réplicas) quando o consumo de CPU ultrapassar 70%.

---

## 🚀 Guia de Operação Prática (Runbook para VPS & Local)

Guarde este passo a passo para quando for ligar a aplicação no seu computador ou numa VPS alugada (Ubuntu/Debian).

### 🐳 Opção 1: Subindo com Docker Compose (Mais Rápido e Simples)

Ideal para testes locais rápidos ou para rodar numa VPS mais enxuta (1GB a 2GB de RAM) sem a complexidade do cluster K8s.

1. **Clonar o projeto e entrar na pasta:**
   ```bash
   git clone https://github.com/CaioScatolino/controle_gastos.git
   cd controle_gastos
   ```

2. **Criar o arquivo de variáveis de ambiente (`.env`) na raiz:**
   ```bash
   # Crie o .env com as chaves reais das APIs
   RESEND_API_KEY=re_sua_chave_real_aqui
   GEMINI_API_KEY=AQ_sua_chave_real_aqui
   ```

3. **Construir as imagens e subir os 5 serviços em segundo plano:**
   ```bash
   docker compose up -d --build
   ```

4. **Verificar se todos os contêineres estão rodando e saudáveis:**
   ```bash
   docker compose ps
   ```

5. **Acompanhar os logs em tempo real:**
   ```bash
   # Ver logs de todos os serviços:
   docker compose logs -f

   # Ou ver apenas os logs da API ou do Worker:
   docker compose logs -f api
   docker compose logs -f worker
   ```

6. **Parar a aplicação:**
   ```bash
   docker compose down
   ```

---

### ☸️ Opção 2: Subindo com Kubernetes (K3s na VPS - Arquitetura Enterprise)

Ideal para quando você tiver uma VPS com **pelo menos 4GB de RAM** e quiser a experiência completa de orquestração com auto-recuperação (Self-Healing) e auto-escalonamento (HPA).

1. **Instalar o K3s no servidor Linux (com 1 único comando):**
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```
   *(Ele já instala o Kubernetes leve, o `kubectl` e configura tudo automaticamente).*

2. **Construir as imagens Docker no servidor:**
   ```bash
   # Build da API (usada tanto pela API quanto pelo Worker)
   docker build -t controle-gastos-api:latest -f deploy/docker/api.Dockerfile .

   # Build do Front-end Web Standalone
   docker build -t controle-gastos-web:latest -f deploy/docker/web.Dockerfile .
   ```

3. **Criar os Segredos de forma 100% segura (sem expor chaves no Git):**
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=DATABASE_URL="sua_url_real_mysql_ou_tidb" \
     --from-literal=REDIS_URL="sua_url_real_redis" \
     --from-literal=JWT_SECRET="seu_jwt_secret_forte" \
     --from-literal=RESEND_API_KEY="re_sua_chave_real" \
     --from-literal=GEMINI_API_KEY="AQ_sua_chave_real"
   ```

4. **Aplicar os manifestos do Kubernetes:**
   ```bash
   # Aplica o ConfigMap de configurações públicas
   kubectl apply -f deploy/k8s/configmap-secrets.yaml

   # Aplica a API, Worker, Web e HPA
   kubectl apply -f deploy/k8s/api-deployment.yaml
   kubectl apply -f deploy/k8s/worker-deployment.yaml
   kubectl apply -f deploy/k8s/web-deployment.yaml
   kubectl apply -f deploy/k8s/hpa.yaml
   ```

5. **Verificar os Pods e Serviços subindo:**
   ```bash
   # Ver os pods em execução:
   kubectl get pods

   # Ver os serviços e portas:
   kubectl get services

   # Ver o monitoramento do HPA:
   kubectl get hpa
   ```

6. **Ver logs de um pod específico em tempo real:**
   ```bash
   kubectl logs -f deployment/api-deployment
   kubectl logs -f deployment/worker-deployment
   ```

---

## 🧪 Validação & Status Atual
- Toda a infraestrutura declarativa (IaC) está versionada em `deploy/k8s/` e `docker-compose.yml`.
- A aplicação local e os ambientes corporativos podem subir a stack inteira de forma automatizada.
- Os deploys em produção na Vercel e Render continuam ativos e sem custo (R$ 0,00), com consumo de TiDB drasticamente otimizado.
