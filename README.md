# 💰 Controle de Gastos Inteligente (Projeto Impossível)

> Ecossistema modular evolutivo para gestão financeira pessoal com IA multimodal e arquitetura escalável em monorepo.

---

## 🧭 Visão Geral

O **Controle de Gastos Inteligente** é um laboratório prático de engenharia de software desenhado com arquitetura limpa, modular e incremental. O objetivo central é fornecer uma experiência fluida de controle financeiro pessoal, integrando no futuro leitura e extração inteligente de notas/comprovantes com modelos multimodais de Inteligência Artificial (LLMs), mensageria assíncrona e orquestração de fluxos.

O front-end é projetado sob a filosofia **Mobile-First**, garantindo usabilidade de ponta em dispositivos móveis e preparando a aplicação para ser empacotada como app nativo/PWA no futuro sem necessidade de refatoração estrutural.

---

## 🧱 Arquitetura do Repositório (Monorepo)

O projeto adota uma estrutura de **Monorepo simples e desacoplada**:

```text
controle_gastos/
├── apps/
│   ├── api/          # Back-end Node.js + Express + Drizzle ORM + MySQL
│   └── web/          # Front-end Next.js (App Router, Tailwind CSS, Mobile-First)
├── docs/
│   └── steps/        # Registro histórico e didático de cada etapa do projeto
├── package.json      # Orquestrador de Workspaces
└── README.md         # Documentação central do ecossistema
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **API Runtime** | Node.js (ESModules, TypeScript) | Servidor HTTP RESTful de alta performance |
| **Framework HTTP** | Express 5 | Roteamento, middlewares e controllers |
| **ORM & Migrations** | Drizzle ORM + Drizzle Kit | Type-safe SQL, migrations declarativas e queries otimizadas |
| **Banco de Dados** | MySQL 8 (XAMPP / Localhost) | Persistência relacional de usuários e despesas |
| **Validação de Dados** | Zod | Schemas de validação de payload em tempo de execução |
| **Segurança & Auth** | JWT (JSON Web Token) + Bcrypt | Autenticação stateless via Bearer Token e hashing seguro |
| **Front-end** | Next.js (App Router, React 19/18, Tailwind CSS) | Interface moderna, responsiva e mobile-first |
| **Roadmap Futuro** | Redis, LLM Multimodal, n8n | Cache, extração inteligente de recibos/áudios e automação |

---

## 🚀 Ambiente Local e Pré-requisitos

### 1. Ferramentas Necessárias
- **Node.js**: Versão 20+ LTS instalada.
- **XAMPP / MySQL**: Servidor MySQL rodando na porta `3306`.
- **DBeaver** (ou MySQL Workbench): Para inspeção visual das tabelas.

### 2. Configuração do Banco de Dados (MySQL / XAMPP)
1. Inicie o serviço **MySQL** no painel de controle do XAMPP.
2. Abra o DBeaver (ou terminal MySQL) e crie o database:
   ```sql
   CREATE DATABASE controle_gastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 3. Configuração de Variáveis de Ambiente (`.env`)
No back-end (`apps/api/.env` ou raiz conforme etapa atual):
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=mysql://root:@localhost:3306/controle_gastos
BASE_URL=http://localhost:3001
JWT_SECRET=seu_segredo_super_seguro_aqui
```

### 4. Executando o Banco e as Migrações
```bash
# Gerar arquivos de migração a partir dos schemas Drizzle
npm run db:generate

# Aplicar as migrações no MySQL
npm run db:migrate

# Opcional: Abrir o painel visual do Drizzle Studio
npm run db:studio
```

---

## 📚 Documentação Passo a Passo (`docs/steps/`)
Cada decisão técnica, arquitetural e comando executado é documentado detalhadamente:
- [Step 01: Auditoria e Setup do Monorepo](docs/steps/step-01-auditoria-e-setup-monorepo.md)
