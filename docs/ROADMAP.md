# 🗺️ Roadmap de Evolução — Projeto Impossível

Este documento estabelece as próximas etapas de engenharia, arquitetura e produto para o ecossistema **Controle de Gastos Inteligente**.

---

## ✅ Etapas Concluídas

| Etapa | Foco Principal | Destaques Técnicos |
| :--- | :--- | :--- |
| **Step 01** | Setup & Monorepo | Node.js, Express 5, Drizzle ORM, MySQL, Zod, JWT |
| **Step 02** | Migração Monorepo & Next.js | Setup Next.js 15, Tailwind CSS, Mobile-First Container |
| **Step 03** | Refatoração & Modularização | Custom Hooks, Lucide Icons, Glassmorphism Dark Theme |
| **Step 04** | Mensageria & Background Jobs | Redis (Upstash), BullMQ Worker, **Transactional Outbox Pattern** |
| **Step 05** | Templates & Envio de E-mails | Nodemailer, Ethereal Sandbox, Templates HTML responsivos |
| **Step 06** | IA Multimodal & OCR | Google Gemini 2.5 Flash / Flash Lite, Extração JSON estruturada de fotos/recibos |
| **Step 07** | SSE Streaming & Deploy Produção | Server-Sent Events (SSE), Deploy Vercel (Front) + Render (API), TiDB Cloud Serverless, UptimeRobot Heartbeat |
| **Step 08** | Dashboard Mensal & Categorias | Navegação temporal `< Mês/Ano >`, Drizzle `gte/lte`, cálculo memoizado de categorias (`CategoryBreakdown`) |
| **Step 09** | E-mails Reais com Resend | Resend HTTPS REST API, templates HTML responsivos, 0 risco de timeout SMTP na nuvem |

---

## 🚀 Próximas Etapas (Backlog Prioritário)

### ☸️ Step 10: Containerização & Orquestração (Docker & Kubernetes)
- **Docker Multi-Stage**: Criação de imagens Docker leves e otimizadas para `apps/api` e `apps/web`.
- **Arquitetura de Microsserviços / Pods Separados**:
  - `api-deployment.yaml`: Pod dedicado para a API HTTP/SSE.
  - `worker-deployment.yaml`: Pod dedicado para o processamento assíncrono de filas BullMQ (desacoplamento de CPU).
  - `web-deployment.yaml`: Pod do front-end Next.js.
- **Sondas de Saúde (Liveness & Readiness Probes)**: Conectadas ao endpoint `/api/ping` para auto-recuperação de containers travados.
- **Horizontal Pod Autoscaler (HPA)**: Auto-escalonamento automático baseado em uso de CPU/memória.
- **Zero Impacto no Live Demo**: O deploy em produção continua ativo na Vercel/Render com custo R$ 0,00, mantendo a infraestrutura IaC versionada para portfólio corporativo.

### 🎙️ Step 11: Despesas por Comando de Voz com IA (Áudio Multimodal)
- Gravação de áudio nativa no navegador/celular via MediaRecorder API.
- Processamento do áudio diretamente no Google Gemini (Multimodal Audio-to-JSON).
- Exemplo: *"Gastei 35 reais no almoço de hoje no débito"* ➔ despesa cadastrada automaticamente com categoria, data e valor.

### 🎯 Step 12: Metas & Orçamento Financeiro (Budgeting)
- Definição de limites de gastos mensais gerais ou por categoria (ex: Alimentação máx R$ 800/mês).
- Barra de progresso com alertas visuais: 🟢 Seguro (<70%), 🟡 Atenção (70-90%), 🔴 Estourado (>90%).
- Insights do assistente de IA alertando sobre desvios do orçamento planejado.

### 📄 Step 13: Exportação de Extratos (PDF & CSV)
- Geração de relatório mensal consolidado para download em CSV (Excel) ou PDF estilizado.
- Resumo de receitas, despesas, saldo líquido e gráfico de pizza/categorias.

### 📱 Step 14: PWA (Progressive Web App)
- Configuração de `manifest.json`, service worker e meta-tags para mobile.
- Suporte a "Adicionar à Tela de Início" no Android e iOS, abrindo como aplicativo nativo em tela cheia.
