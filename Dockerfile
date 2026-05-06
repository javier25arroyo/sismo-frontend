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
# Etapa 3: Runtime de producción
#############################################
FROM nginx:1.27-alpine AS runtime

# Instalar wget para healthcheck y limpiar config por defecto en una sola capa
RUN apk add --no-cache wget && \
    rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar assets construidos con ownership correcto en un solo paso
COPY --from=build --chown=nginx:nginx /app/dist/sismo-frontend/browser /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
