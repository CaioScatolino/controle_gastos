# =======================================================
# Estágio 1: Instalação de Dependências (Deps)
# =======================================================
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copia manifestos de dependência do Monorepo
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Instala todas as dependências necessárias para o build do Next.js
RUN npm ci --workspace=@controle-gastos/web --include-workspace-root

# =======================================================
# Estágio 2: Compilação do Next.js (Builder)
# =======================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilita telemetria do Next.js para acelerar o build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=https://api-gastos.caioscatolino.com.br/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Executa o build que gera a pasta .next/standalone
RUN npm run build --workspace=@controle-gastos/web

# =======================================================
# Estágio 3: Runner de Produção (Imagem Mínima Standalone)
# =======================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Segurança: usuário não-root
USER node

# Copia os arquivos estáticos e o servidor standalone gerado pelo Next.js
COPY --chown=node:node --from=builder /app/apps/web/public ./apps/web/public
COPY --chown=node:node --from=builder /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/web/.next/static ./apps/web/.next/static

WORKDIR /app/apps/web

EXPOSE 3000

# Executa o mini-servidor Node.js nativo gerado pelo Next.js
CMD ["node", "server.js"]
