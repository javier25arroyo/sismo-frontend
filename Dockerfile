# syntax=docker/dockerfile:1

#############################################
# Etapa 1: Dependencias (caché por capas)
#############################################
FROM node:20.19.0-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Solo archivos de paquetes para caché óptima por capas
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (incluye dev — requeridas por herramientas de build de Angular)
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

#############################################
# Etapa 2: Build
#############################################
FROM node:20.19.0-alpine AS build

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Reutilizar node_modules de la etapa deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

COPY package.json ./
COPY angular.json tsconfig*.json postcss.config.json ./
COPY public ./public
COPY src ./src

# Configuración de producción explícita (outputHashing=all, budgets aplicados)
RUN pnpm build --configuration=production

#############################################
# Etapa 3: Runtime SSR (Node.js)
#############################################
FROM node:20.19.0-alpine AS runtime

RUN apk add --no-cache wget

WORKDIR /app

# Copiar output del build (servidor SSR + assets)
COPY --from=build /app/dist/sismo-frontend ./dist/sismo-frontend

EXPOSE 4000

ENV PORT=4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:4000/ || exit 1

CMD ["node", "dist/sismo-frontend/server/server.mjs"]
