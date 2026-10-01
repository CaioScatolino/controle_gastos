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
| **Step 10** | Domínio Próprio, PWA & Mobile | Domínio `caioscatolino.com.br`, DNS DKIM/SPF/DMARC, PWA instalável (`standalone`), Safe Area e Bottom Sheet |
| **FinOps / Resiliência** | Otimização TiDB & Outbox Event-Driven | Heartbeat sem banco, Outbox orientado a eventos (0ms) e redução de 98.4% nas consultas periódicas |
| **Step 11** | Containerização & Kubernetes | Docker Multi-Stage (API & Web Standalone), Docker Compose, Pods desacoplados (API, Worker, Web), Probes e HPA |
| **Deploy VPS & CI/CD** | Hub Central de Portfólio & Auto-Deploy | VPS Hostinger (Ubuntu 24.04, 2GB SWAP), Nginx Proxy Manager, MySQL/Redis Centrais, SSL Let's Encrypt e GitHub Actions CI/CD |

---

## 🚀 Próximas Etapas (Backlog Prioritário)

### 🛡️ Tratamento Semântico de Erros & Feedback Visual de UX
- **Diagnóstico Mapeado**: Erros de regra de negócio (como *"Senha incorreta"* ou *"Usuário não encontrado"*) em `user.service.ts` são lançados como `new Error(...)` genérico. O middleware `globalErrorHandler` só repassa mensagens de instâncias de `AppError`, fazendo com que qualquer `Error` genérico caia no status HTTP 500 (*"Erro interno do servidor"*), ocultando o motivo real na tela do usuário.
- **Melhorias Planejadas**:
  - Migrar todas as exceções de regras de negócio para a classe `AppError(mensagem, statusCode)` (ex: `401 Unauthorized` para credenciais inválidas, `409 Conflict` para e-mail duplicado, `404 Not Found`).
  - Padronizar mensagens de autenticação no login para *"E-mail ou senha incorretos"* (boa prática de segurança contra enumeração de usuários).
  - Melhorar os alertas visuais de erro nos formulários do front-end Next.js (Login, Cadastro e Despesas).

### 🎙️ Step 12: Despesas por Comando de Voz com IA (Áudio Multimodal)
- Gravação de áudio nativa no navegador/celular via MediaRecorder API.
- Processamento do áudio diretamente no Google Gemini (Multimodal Audio-to-JSON).
- Exemplo: *"Gastei 35 reais no almoço de hoje no débito"* ➔ despesa cadastrada automaticamente com categoria, data e valor.

### 🎯 Step 13: Metas & Orçamento Financeiro (Budgeting)
- Definição de limites de gastos mensais gerais ou por categoria (ex: Alimentação máx R$ 800/mês).
- Barra de progresso com alertas visuais: 🟢 Seguro (<70%), 🟡 Atenção (70-90%), 🔴 Estourado (>90%).
- Insights do assistente de IA alertando sobre desvios do orçamento planejado.

### 📄 Step 14: Exportação de Extratos (PDF & CSV)
- Geração de relatório mensal consolidado para download em CSV (Excel) ou PDF estilizado.
- Resumo de receitas, despesas, saldo líquido e gráfico de pizza/categorias.

### 🏪 Step 15: TWA (Google Play Store Packaging via Bubblewrap)
- Empacotamento do PWA em `.aab` / `.apk` usando Google Bubblewrap.
- Preparação de assets e metadados para publicação na Google Play Store.
