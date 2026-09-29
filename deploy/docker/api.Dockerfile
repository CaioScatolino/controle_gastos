# =======================================================
# Estágio 1: Instalação e Preparação de Dependências (Base)
# Usamos Alpine Linux (pesa apenas ~50MB em vez de 1GB do Ubuntu)
# =======================================================
FROM node:20-alpine AS base
WORKDIR /app

# Instala compatibilidade para pacotes nativos do Alpine Linux
RUN apk add --no-cache libc6-compat

# Copia os manifestos de dependência do Monorepo
# Isso permite que o Docker faça cache das bibliotecas
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Instala apenas as dependências do workspace da API
RUN npm ci --workspace=@controle-gastos/api --include-workspace-root

# =======================================================
# Estágio 2: Runner de Produção (Ultra-leve e Seguro)
# =======================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Criação de usuário sem privilégios de root por conformidade de segurança
# Se a aplicação for invadida, o invasor não ganha controle da máquina
USER node

# Copia as dependências preparadas no estágio anterior com permissão do usuário node
COPY --chown=node:node --from=base /app/node_modules ./node_modules
COPY --chown=node:node --from=base /app/package.json ./package.json
COPY --chown=node:node --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=base /app/apps/api/package.json ./apps/api/package.json

# Copia o código-fonte da API
COPY --chown=node:node apps/api/src ./apps/api/src
COPY --chown=node:node apps/api/tsconfig.json ./apps/api/tsconfig.json

WORKDIR /app/apps/api

# Expõe a porta interna da API
EXPOSE 3001

# Comando padrão de inicialização do servidor HTTP
CMD ["npx", "tsx", "src/server.ts"]
