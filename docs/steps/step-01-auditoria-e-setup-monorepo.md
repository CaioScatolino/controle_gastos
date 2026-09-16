# Step 01: Auditoria da API Existente e Estratégia de Monorepo

> **Data**: 16/09/2026  
> **Status**: Concluído / Em análise para migração física  
> **Foco**: Diagnóstico detalhado do back-end em Node.js/Express, mapeamento de rotas e banco MySQL, e definição da arquitetura de monorepo.

---

## 1. O que estamos fazendo?

Nesta primeira etapa, atuamos em duas frentes fundamentais:
1. **Auditoria de Código e Banco**: Realizamos um raio-X completo de toda a estrutura existente no back-end (schemas do Drizzle ORM, conexão MySQL, fluxos de autenticação, controllers e validações com Zod).
2. **Desenho Arquitetural do Monorepo**: Estruturamos a estratégia para isolar o back-end em `apps/api` e preparar o terreno para receber o front-end em `apps/web` (Next.js) com documentações de apoio em `docs/steps/`, sem gerar conflitos ou quebra de dependências.

---

## 2. Por que estamos escolhendo esta abordagem técnica e arquitetural?

### A. Separação em Monorepo (`apps/api` e `apps/web`)
- **Desacoplamento e Independência**: A API deve funcionar como um serviço autônomo. O front-end Next.js consumirá essa API via HTTP/REST como qualquer outro cliente (futuro app móvel Android, integrações via n8n ou webhooks).
- **Compartilhamento Futuro (`packages/`)**: No futuro, tipos TypeScript (interfaces de DTOs, schemas de validação Zod) podem ser compartilhados entre API e Web se necessário, reduzindo duplicação de regras de negócio.
- **Simplicidade com NPM Workspaces**: Evitamos complexidade prematura de ferramentas como Lerna ou Nx. O recurso nativo de Workspaces do NPM gerencia dependências e scripts de forma limpa e direta.

### B. Drizzle ORM + MySQL Local (XAMPP / DBeaver)
- O Drizzle ORM provê tipagem estática ponta a ponta (`$inferSelect`, `$inferInsert`) e desempenho próximo a SQL puro, sem a sobrecarga de abstrações pesadas como Prisma.
- A conexão via pool com `mysql2/promise` garante gerenciamento eficiente de conexões com o MySQL local.

---

## 3. Raio-X Técnico: O que encontramos no Back-end

### 3.1. Schemas do Banco de Dados (`src/db/schema/`)

1. **Tabela `users` (`src/db/schema/users.ts`)**:
   - `id`: `int`, Primary Key, Auto-increment.
   - `name`: `varchar(255)`, Not Null.
   - `email`: `varchar(255)`, Not Null, Unique.
   - `password`: `varchar(255)`, Not Null (armazenado com hash Bcrypt, 10 rounds).
   - `avatar`: `varchar(255)`, Not Null.
   - `created_at` / `updated_at`: `timestamp`.
   - ⚠️ **Ponto de Atenção Detectado**: A coluna `avatar` foi declarada como `notNull()` no Drizzle. No entanto, no controller de registro (`createUser`) e no validator Zod (`createUserSchema`), o campo `avatar` não é enviado pelo usuário. Caso o MySQL execute em modo estrito e o campo não tenha default no banco, a inserção falhará a menos que um valor default seja fornecido ou o campo se torne opcional (`nullable`).

2. **Tabela `expenses` (`src/db/schema/expenses.ts`)**:
   - `id`: `int`, Primary Key, Auto-increment.
   - `user_id`: `int`, Foreign Key referenciando `users.id`.
   - `description`: `varchar(255)`, Not Null.
   - `value`: `decimal(10, 2)`, Not Null.
   - `type`: `varchar(10)`, Not Null (Valores válidos: `"Receita"` ou `"Despesa"`).
   - `category`: `varchar(50)`, Not Null.
   - `expense_date`: `datetime`, Not Null.
   - `status`: `boolean`, default `true`, Not Null.
   - `created_at` / `updated_at`: `timestamp`.

---

### 3.2. Mapa de Rotas e Endpoints Existentes

| Método | Rota | Autenticação? | Payload Esperado (Body / Params) | Resposta de Sucesso |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/ping` | Não | Nenhum | `{ pong: true }` |
| `GET` | `/api/` | Não | Nenhum | `"Hello World!"` |
| `POST` | `/api/users` | Não | `{ "name": "...", "email": "...", "password": "..." }` | Usuário formatado (sem hash de senha) |
| `POST` | `/api/auth/login` | Não | `{ "email": "...", "password": "..." }` | `{ "error": null, "data": { "token": "...", "user": {...} } }` |
| `GET` | `/api/auth/me` | **Sim** (Bearer Token) | Header: `Authorization: Bearer <token>` | `{ "error": null, "data": { "userId": 1 } }` |
| `POST` | `/api/expenses/create`| **Sim** (Bearer Token) | `{ "user_id": 1, "description": "...", "value": 150.00, "type": "Despesa", "category": "Alimentação", "expense_date": "2026-09-16T12:00:00.000Z" }` | Despesa criada |
| `GET` | `/api/expenses` | **Sim** (Bearer Token) | Header: `Authorization: Bearer <token>` | Lista de despesas do usuário logado |
| `GET` | `/api/expenses/:id` | **Sim** (Bearer Token) | Param: `id` (número) | Dados da despesa (valida se pertence ao usuário logado) |
| `PUT` | `/api/expenses/:id` | **Sim** (Bearer Token) | Param `id` + campos a atualizar | Despesa atualizada |

⚠️ **Observação de Segurança e Design de API**:
No endpoint `POST /api/expenses/create`, o schema Zod atual exige que o cliente envie `user_id` no corpo. Como a rota já está protegida pelo middleware `privateRoute`, o `req.userId` já está decodificado de forma segura a partir do token JWT. Na próxima revisão do backend, é uma boa prática injetar diretamente o `req.userId` ao invés de confiar no payload do cliente, evitando spoofing de usuário.

---

### 3.3. Mecanismo de Sessão e Autenticação (JWT)
- **Geração do Token**: Realizada em `src/controllers/auth.controller.ts` usando `jsonwebtoken`. O payload assinado contém `{ id: user.id }`.
- **Validade**: 24 horas (`expiresIn: "24h"`).
- **Validação**: O middleware `src/middlewares/auth.middleware.ts` extrai o cabeçalho `Authorization`, valida o formato `Bearer <token>`, decodifica a chave `JWT_SECRET` e injeta `req.userId = decoded.id` na requisição Express.

---

## 4. Guia de Execução Local do Back-end Atual

### Passo 1: Verificar serviços
1. Certifique-se de que o **Apache/MySQL** está rodando no painel do XAMPP (porta padrão 3306).
2. Verifique se a base `controle_gastos` existe no MySQL (via DBeaver).

### Passo 2: Executar a API em modo de desenvolvimento
```bash
# Na pasta raiz do projeto:
npm run dev
```
O servidor inicializará em: `http://localhost:3001` (ou `3000` conforme configurado no `.env`).

### Passo 3: Testar os endpoints via cURL ou Postman/Insomnia

**Healthcheck**:
```bash
curl http://localhost:3001/api/ping
```

**Criar Usuário**:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Caio Dev", "email": "caio@teste.com", "password": "senhaSegura123"}'
```

**Login e Obtenção do Token**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "caio@teste.com", "password": "senhaSegura123"}'
```

**Consultar Perfil Protegido**:
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
