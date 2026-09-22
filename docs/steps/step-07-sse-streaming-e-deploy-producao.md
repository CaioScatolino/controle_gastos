# Step 07: SSE Streaming no Chat de IA e Deploy 100% Gratuito em Produção

> **Data**: 22/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Implementação do protocolo Server-Sent Events (SSE) para chat conversacional em tempo real com Gemini 3.5 Flash Lite, multi-turn chat com emissão de comprovante estruturado e deploy completo de arquitetura em produção com custo zero (Render, Vercel, TiDB Cloud e Upstash).

---

## 1. O que foi feito?

### A. Chat Conversacional com SSE (Streaming em Tempo Real)
1. **Serviço de IA (`ai.service.ts`)**:
   - Adicionada a função `streamChat` utilizando `ai.models.generateContentStream` do SDK oficial `@google/genai`.
   - Suporte a histórico de mensagens anteriores (`history: ChatMessage[]`) para conversas de múltiplos turnos (ex: o usuário informa um gasto e depois corrige: *"na verdade foram 38 reais"*).
   - Injeção da data atual de referência (`DD/MM/YYYY`) e regras para a IA confirmar explicitamente data, valor, estabelecimento e categoria.
   - Emissão de bloco estruturado delimitado por `<<<EXPENSE_DATA:{...}>>>` interceptado e validado com Zod.

2. **Controller e Rota SSE (`ai.controller.ts`, `ai.routes.ts`)**:
   - Cabeçalhos HTTP do padrão Server-Sent Events:
     - `Content-Type: text/event-stream`
     - `Cache-Control: no-cache, no-transform`
     - `Connection: keep-alive`
   - Emissão contínua de eventos tipados:
     - `{ type: "token", text: "..." }` para cada palavra digitada;
     - `{ type: "expense_ready", expense: {...} }` quando a despesa for confirmada;
     - `{ type: "done" }` no encerramento da conexão.

3. **Front-End com Leitor Nativo de Stream (`ai-chat/page.tsx`)**:
   - Consumo do stream SSE utilizando a Web API nativa `ReadableStream` e `TextDecoder` sem bibliotecas pesadas.
   - Balões de conversa no padrão WhatsApp/Telegram (usuário à direita, IA à esquerda digitando em tempo real com cursor pulsante).
   - Card de comprovante acoplado à mensagem com botão de confirmação e salvamento direto no MariaDB/MySQL.

---

### B. Deploy Contínuo (CI/CD) 100% Gratuito em Produção

Conectamos a infraestrutura completa na nuvem com padrão de Continuous Deployment via GitHub:

| Camada | Provedor na Nuvem | Região | Custo | URL Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **Front-End** | **Vercel** | Global Edge (Anycast) | R$ 0,00 | `https://controle-gastos-web-wheat.vercel.app` |
| **Back-End API** | **Render.com** | US East (Ohio) | R$ 0,00 | `https://controle-gastos-api-glpv.onrender.com` |
| **Banco de Dados** | **TiDB Cloud (MySQL)** | São Paulo (`sa-east-1`) | R$ 0,00 (5GB) | Gateway AWS São Paulo |
| **Mensageria Redis** | **Upstash Redis** | Nuvem (TLS habilitado) | R$ 0,00 | `rediss://...upstash.io:6379` |

#### Adaptações para a Nuvem Realizadas no Código:
1. **Redis TLS Híbrido (`redis.ts`)**: Suporte a `REDIS_URL` para nuvem com criptografia SSL/TLS e fallback para `REDIS_HOST:REDIS_PORT` no `localhost`.
2. **MySQL Cloud SSL (`connection.ts`)**: Suporte a conexões SSL com `rejectUnauthorized: false` para certificados de nuvem gerenciados (TiDB Cloud).
3. **Limpeza do Git (`.gitignore`)**: Remoção de artefatos de build do `.next` e isolamento de variáveis de ambiente.
4. **Resolução de Módulos Moderna (`tsconfig.json`)**: Migração de `node10` legado para `bundler`, garantindo compatibilidade estrita no Node 22/24.
5. **Dependências de Tipos (`package.json`)**: Movidos pacotes `@types/*` para `dependencies`, evitando que o `npm install` em modo produção descarte tipagens necessárias durante o build.

---

## 2. Como Funciona o Fluxo de Trabalho Híbrido (Local vs Produção)?

O desenvolvedor pode continuar programando em sua máquina local sem afetar os dados da nuvem:

1. **Desenvolvimento Diário:**
   - Execute `npm run dev:api` e `npm run dev:web`;
   - O app roda apontando para o MySQL local do XAMPP e o Redis do Docker.
2. **Publicação Contínua (Deploy com 1 comando):**
   - Ao finalizar e testar uma funcionalidade no `localhost`:
     ```bash
     git add .
     git commit -m "feat: minha nova funcionalidade"
     git push origin main
     ```
   - O GitHub aciona automaticamente a Vercel e o Render, que atualizam o app no ar em menos de 2 minutos!

---

## 3. Guia de Acesso e Validação

1. Abra no navegador ou no celular: **`https://controle-gastos-web-wheat.vercel.app`**;
2. Verifique o badge do topo: `API: Online` (verde com check);
3. Crie uma conta no `/register` e faça login;
4. Acesse o `/ai-chat`, envie uma despesa por texto ou foto e veja a IA processando via streaming SSE no ar!
