# Step 04: Mensageria Assíncrona com Redis, BullMQ e Transactional Outbox Pattern

> **Data**: 17/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Implementação do Transactional Outbox Pattern com transação atômica ACID no MariaDB, esteira de filas com BullMQ, persistência em memória com Redis (Docker) e processamento desacoplado via Workers e Relays.

---

## 1. O que estamos fazendo?

Implementamos a primeira camada de mensageria assíncrona do ecossistema para resolver o problema clássico de **Dual Write** e latência no cadastro de usuários:
1. **Transação Atômica ACID (`apps/api/src/services/user.service.ts`)**:
   - Usamos o `db.transaction(async (tx) => { ... })` do Drizzle ORM para garantir que a inserção na tabela `users` e a inserção do evento na tabela `outbox_users` aconteçam juntas ou nenhuma aconteça (Rollback automático).
2. **Conexão Redis (`apps/api/src/config/redis.ts`)**:
   - Conectamos ao container Redis rodando no Docker (porta 6379) via `ioredis`, com a diretiva `maxRetriesPerRequest: null`.
3. **Fila BullMQ (`apps/api/src/queues/mail.queue.ts`)**:
   - Criamos a fila `mail-queue` com política de 3 retries e backoff exponencial (`delay: 2000`).
4. **Outbox Relay (`apps/api/src/workers/outbox.relay.ts`)**:
   - Processo leve em segundo plano que consulta `outbox_users` a cada 5 segundos, trata o parse seguro do JSON para contornar o armazenamento em `LONGTEXT` do MariaDB, despacha o Job para o Redis e atualiza `processed = true`.
5. **Mail Worker (`apps/api/src/workers/mail.worker.ts`)**:
   - Consumidor independente que escuta a fila do Redis e processa os jobs de boas-vindas com concorrência paralela (`concurrency: 5`).

---

## 2. Por que estamos escolhendo esta abordagem técnica e arquitetural?

### A. O Transactional Outbox Pattern
- **Problema resolvido**: Se tentarmos enviar um e-mail direto na rota `POST /api/users`, a requisição fica lenta e, se o serviço de e-mail oscilar, a chamada falha mesmo após o usuário ter sido salvo no banco.
- **Solução**: Gravamos o evento no próprio banco de dados da aplicação dentro da mesma transação. A API responde ao usuário em menos de 30ms.

### B. Redis + BullMQ vs Outros Brokers (Kafka / RabbitMQ)
- **Simplicidade e Performance**: O BullMQ é construído especificamente para o ecossistema Node.js / TypeScript. Ele dispensa a complexidade e o consumo excessivo de memória de brokers pesados como o Kafka, entregando retries com backoff, ordenação FIFO e escalabilidade horizontal em containers.

### C. Desacoplamento entre Relay e Worker
- O **Relay** tem uma única função rápida: tirar do banco e jogar no Redis.
- O **Worker** tem a função de processamento pesado: montar e-mails, chamar APIs externas e cuidar de falhas de rede.

---

## 3. Qual é o impacto no restante do sistema?

- **API Ultrarrápida**: O tempo de resposta do cadastro de usuário foi reduzido ao tempo puro do insert no banco.
- **Resiliência a Falhas**: Se o Redis ou o serviço de e-mail estiverem fora do ar temporariamente, as mensagens não se perdem — continuam aguardando na tabela `outbox_users` até o restabelecimento dos serviços.

---

## 4. Guia de Validação Local

1. Verifique se o container do Redis está ativo no Docker:
   ```bash
   docker ps
   ```
2. Inicie a API e o Front-end:
   ```bash
   npm run dev:api
   npm run dev:web
   ```
3. Acesse `http://localhost:3000/register` e cadastre um novo usuário.
4. Observe os logs sequenciais no terminal da API:
   - `📦 [Outbox Relay] Encontrados 1 evento(s) pendente(s) no MySQL.`
   - `🚀 [Outbox Relay] Evento #X despachado para o Redis com sucesso!`
   - `📨 [Worker] Processando envio de e-mail para: usuario@email.com`
   - `✅ [Worker] E-mail de Boas-Vindas enviado com sucesso!`
   - `🎉 [Worker] Job #X finalizado!`
5. Verifique no DBeaver:
   ```sql
   SELECT * FROM outbox_users ORDER BY id DESC;
   ```
   A coluna `processed` estará marcada como `1` (true).
