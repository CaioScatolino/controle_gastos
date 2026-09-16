# Step 02: Migração para Monorepo e Setup do Front-end Next.js (Mobile-First)

> **Data**: 16/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Transição física para NPM Workspaces (`apps/api` e `apps/web`), correção no schema de usuário e criação da casca Mobile-First em Next.js com páginas de Login, Registro e Dashboard.

---

## 1. O que estamos fazendo?

Nesta segunda etapa do nosso laboratório prático:
1. **Estruturação do Monorepo**: Movemos o backend Node.js intacto para o diretório isolado `apps/api/`, com seu próprio `package.json` renomeado para `@controle-gastos/api`.
2. **Orquestração na Raiz**: Configuramos o `package.json` raiz como maestro usando **NPM Workspaces** (`"workspaces": ["apps/*"]`), adicionando comandos convenientes para rodar a API, o Front-end ou ambos em paralelo.
3. **Resolução de Defeito Potencial no Schema de Usuário**: No arquivo `apps/api/src/db/schema/users.ts`, adicionamos o valor padrão `.default('')` no campo `avatar`. Isso garante que novos usuários possam ser criados pelo formulário de cadastro sem falhas de integridade no MySQL.
4. **Scaffold do Front-end (`apps/web`)**:
   - Inicializamos uma aplicação em **Next.js 15 (App Router)** com **TypeScript** e **Tailwind CSS**.
   - Criamos o componente de layout `MobileContainer`, que restringe a viewport a uma moldura sofisticada de smartphone no desktop e 100% fluida no mobile.
   - Criamos um cliente HTTP unificado (`src/lib/api.ts`) que gerencia a inclusão do cabeçalho `Authorization: Bearer <token>`.
   - Implementamos as telas:
     - `/` (Home com monitor de status da API em tempo real)
     - `/login` (Autenticação com persistência de token)
     - `/register` (Cadastro de usuário com login automático)
     - `/dashboard` (Resumo de saldos, lançamentos recentes e modal de nova transação)
     - `/expenses` (Extrato completo com filtros)
     - `/expenses/new` (Formulário dedicado de lançamento rápido)
     - `/ai-chat` (Área conceitual reservada para o modelo multimodal futuro)
     - `/profile` (Visualização dos dados de sessão e especificações do sistema)

---

## 2. Por que estamos escolhendo esta abordagem técnica e arquitetural?

### A. NPM Workspaces sem ferramentas adicionais
- **Motivação**: Em fases iniciais de produtos, ferramentas de monorepo complexas (como Turborepo ou Nx) introduzem overhead de configuração, curva de aprendizado e arquivos de lock extras. O NPM Workspaces é nativo, rápido e divide as dependências sem atritos.
- **Isolamento**: A API pode evoluir com suas versões de Express/Drizzle sem interferir nas dependências do React/Next.js.

### B. Arquitetura Mobile-First Rígida
- **Pensando no futuro aplicativo**: O objetivo deste produto é ser utilizado no dia a dia como aplicativo no smartphone. Construir desde o dia 1 dentro das limitações e padrões de UI mobile (telas compactas, botões de fácil alcance para os dedos, bottom navigation bar, feedback instantâneo) evita o retrabalho massivo de "tentar adaptar uma dashboard de desktop para celular" mais tarde.
- **Portabilidade para Android**: Esse código pode facilmente ser encapsulado via Capacitor ou WebView no futuro sem alterar uma linha de CSS.

### C. Cliente HTTP Centralizado (`apiFetch`)
- **DRY (Don't Repeat Yourself)**: Ao invés de chamar `fetch('http://localhost:3001/...')` em cada componente, o `apiFetch` centraliza o tratamento de URL base, inclusão de cabeçalho Bearer do JWT e captura de mensagens de erro estruturadas pelo Zod/Express.

---

## 3. Qual é o impacto no restante do sistema?

- **Impacto no Backend**: Zero impacto na lógica de negócio. Apenas a localização dos arquivos mudou para `apps/api/`. As variáveis de ambiente `.env` continuam válidas dentro de `apps/api/`.
- **Impacto no Banco de Dados**: A coluna `avatar` passa a aceitar inserção sem valor obrigatório explícito, viabilizando o fluxo de onboarding de novos usuários.
- **Comunicação Frontend -> Backend**: O front-end consome a API na porta `3001` (`http://localhost:3001/api`), respeitando o CORS liberado no Express (`app.use(cors())`).

---

## 4. Comandos e Scripts Disponíveis

Na raiz do projeto (`controle_gastos/`):

| Comando | Descrição |
| :--- | :--- |
| `npm run dev:api` | Sobe apenas a API Node.js (Porta `3001`) |
| `npm run dev:web` | Sobe apenas o Front-end Next.js (Porta `3000`) |
| `npm run dev` | Executa os workspaces que possuem script `dev` |
| `npm run build:web` | Gera a build de produção do Next.js |
| `npm run db:generate` | Gera novas migrações Drizzle a partir dos schemas |
| `npm run db:migrate` | Aplica migrações pendentes no MySQL |
| `npm run db:studio` | Abre o painel visual do Drizzle Studio |

---

## 5. Guia de Execução Local e Testes

### Pré-requisito: Banco de Dados
1. Abra o painel do **XAMPP** e inicie o módulo **MySQL**.
2. Abra o **DBeaver** e confirme a existência do database `controle_gastos`. Se não existir:
   ```sql
   CREATE DATABASE controle_gastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Rode as migrações:
   ```bash
   npm run db:migrate
   ```

### Executando os Serviços Localmente

Abra **dois terminais** na raiz do projeto (ou um para cada workspace):

**Terminal 1: Iniciar o Back-end**
```bash
npm run dev:api
```
> O servidor indicará: `Server is running on http://localhost:3001`

**Terminal 2: Iniciar o Front-end**
```bash
npm run dev:web
```
> O Next.js indicará: `Ready in ... on http://localhost:3000`

### Validando o Fluxo Completo no Navegador
1. Acesse `http://localhost:3000` no seu navegador.
2. Observe o badge superior: ele indicará **API: Online** assim que a comunicação com o Express for confirmada.
3. Clique em **Criar Nova Conta** (`/register`):
   - Preencha nome, e-mail e senha.
   - O sistema criará o registro no MySQL via Drizzle e fará o login automático.
4. Na **Dashboard** (`/dashboard`):
   - Clique em **Registrar Nova Transação**.
   - Adicione uma despesa (ex: "Mercado", R$ 85,50, Alimentação).
   - Adicione uma receita (ex: "Salário", R$ 3500,00, Salário).
   - Veja o saldo líquido e as estatísticas se atualizarem em tempo real!
5. Abra o **DBeaver**:
   - Faça um `SELECT * FROM users;` e `SELECT * FROM expenses;` para ver seus dados salvos no banco.
