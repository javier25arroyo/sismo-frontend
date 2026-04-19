# syntax=docker/dockerfile:1

#############################################
# Stage 1: Dependencies (layer caching)
#############################################
FROM node:20.19.0-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy only package files for optimal layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev included — required by Angular build tools)
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

#############################################
# Stage 2: Build
#############################################
FROM node:20.19.0-alpine AS build

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Reuse node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

COPY package.json ./
COPY angular.json tsconfig*.json postcss.config.json ./
COPY public ./public
COPY src ./src

# Explicit production configuration (outputHashing=all, budgets enforced)
RUN pnpm build --configuration=production

#############################################
# Stage 3: Production runtime
#############################################
FROM nginx:1.27-alpine AS runtime

# Install wget for health check, clean up default config in one layer
RUN apk add --no-cache wget && \
    rm -rf /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets with correct ownership in a single step
COPY --from=build --chown=nginx:nginx /app/dist/sismo-frontend/browser /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
