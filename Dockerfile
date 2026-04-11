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

# Install all dependencies (dev needed for build)
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

#############################################
# Stage 2: Build
#############################################
FROM node:20.19.0-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy package files
COPY package.json ./

# Copy Angular configuration and source
COPY angular.json tsconfig*.json postcss.config.json tailwind.config.js ./
COPY public ./public
COPY src ./src

# Build with production configuration
RUN pnpm build

#############################################
# Stage 3: Production runtime
#############################################
FROM nginx:1.27-alpine AS runtime

# Security: Run as non-root (nginx user/group already exists in nginx:alpine)
RUN rm -rf /etc/nginx/conf.d/default.conf

# Install wget for healthcheck (alpine package)
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist/sismo-frontend/browser /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
