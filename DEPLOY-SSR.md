# Cambios requeridos para producción — Angular SSR

## Contexto

La migración a Angular SSR cambia la arquitectura de despliegue:

| Antes | Después |
|---|---|
| nginx sirve archivos estáticos (`dist/browser/`) | nginx hace proxy a Node.js SSR |
| Imagen Docker: `nginx:alpine` | Imagen Docker: `node:alpine` + nginx como proxy |
| Un solo proceso | Dos procesos: Node.js SSR + nginx |

---

## 1. Dockerfile

Reemplazar la etapa 3 (`runtime`) completa:

```dockerfile
#############################################
# Etapa 3: Runtime SSR (Node.js)
#############################################
FROM node:24.16.0-alpine AS runtime

RUN apk add --no-cache wget

WORKDIR /app

# Copiar output del build
COPY --from=build /app/dist/sismo-frontend ./dist/sismo-frontend

EXPOSE 4000

ENV PORT=4000

HEALTHCHECK --interval=30s --timeout=5s --start_period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:4000/ || exit 1

CMD ["node", "dist/sismo-frontend/server/server.mjs"]
```

> La etapa 3 deja de ser `nginx:alpine` y pasa a ser `node:alpine`.
> El servidor SSR ya incluye `express.static` para servir los assets de `browser/`.

---

## 2. nginx.conf

nginx pasa de servir archivos estáticos a hacer **proxy inverso al servidor Node.js SSR**.

Reemplazar el bloque `location /` y el bloque de assets por:

```nginx
# ── Upstream SSR ────────────────────────────────────────────────────────────
upstream ssr {
    server frontend:4000;   # nombre del servicio en docker-compose
    keepalive 16;
}

server {
    listen 80;
    server_name _;
    server_tokens off;

    # Cabeceras de seguridad (sin cambios)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "0" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/javascript application/json
               application/javascript image/svg+xml;

    # ── API → Spring Boot (sin cambios) ─────────────────────────────────────
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_send_timeout 30s;
        proxy_buffering off;
    }

    # ── Todo lo demás → Node.js SSR ─────────────────────────────────────────
    location / {
        proxy_pass http://ssr;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }
}
```

> **Eliminar** los bloques `location = /index.html`, `location ~* \.(...css|js...)$`
> y `try_files` — el Node.js SSR maneja todo eso internamente.

---

## 3. docker-compose.yml

El servicio `web` ahora ejecuta Node.js. Añadir nginx como servicio separado si se requiere proxy (arquitectura recomendada con backend en el mismo compose):

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    image: sismo-frontend:local
    container_name: sismo-frontend
    expose:
      - "4000"          # interno — nginx hace proxy
    environment:
      - PORT=4000
      - SSR_API_URL=http://app:8080   # ver sección 5
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://127.0.0.1:4000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits:
          cpus: "0.75"
          memory: 512M      # Node.js necesita más que nginx
        reservations:
          cpus: "0.25"
          memory: 256M
    security_opt:
      - no-new-privileges:true

  # Si nginx existe como servicio separado en el compose:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "4200:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - app
    restart: unless-stopped
```

> Si actualmente nginx corre en el mismo contenedor que el frontend,
> separarlo en su propio servicio es el cambio principal.

---

## 4. angular.json — `allowedHosts`

Añadir el hostname de producción (dominio real o IP del servidor):

```json
"security": {
  "allowedHosts": ["localhost", "sismologia.ice.go.cr"]
}
```

Sin esto, el servidor SSR devuelve `400 Bad Request` para cualquier
petición cuyo header `Host` no esté en la lista.

---

## 5. URL de API en servidor SSR (crítico)

`environment.prod.ts` tiene `apiUrl: ''` (mismo origen). En el navegador
funciona. En Node.js **falla** porque `fetch('/api/sismos')` requiere URL absoluta.

**Impacto actual**: las páginas con datos dinámicos (`/historial`, `/sismos`, `/estaciones`)
se renderizan con estado "cargando" en el servidor y cargan datos al hidratar en el cliente.
La home page no se ve afectada (la sección de datos usa `@defer (on idle)`).

**Fix recomendado** — leer URL de variable de entorno en el servidor:

En `src/app/services/api.service.ts`, cambiar el constructor:

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// En el constructor:
private readonly baseUrl: string;

constructor(private auth: AuthService) {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (isBrowser) {
    this.baseUrl = environment.apiUrl;   // '' en prod (mismo origen)
  } else {
    // En Node.js SSR usa URL absoluta inyectada via env var
    this.baseUrl = (typeof process !== 'undefined' && process.env['SSR_API_URL'])
      ? process.env['SSR_API_URL']
      : 'http://localhost:8080';
  }
}
```

Pasar la variable al contenedor:
```yaml
environment:
  - SSR_API_URL=http://app:8080   # nombre del servicio Spring Boot en docker-compose
```

---

## 6. Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| `Dockerfile` | Etapa 3: `nginx:alpine` → `node:alpine`, ejecuta `server.mjs` |
| `nginx.conf` | `try_files` → `proxy_pass http://ssr` para todo excepto `/api/` |
| `docker-compose.yml` | Servicio `web`→`frontend` con Node, nuevo servicio `nginx` |
| `angular.json` | `allowedHosts` agrega dominio de producción |
| `src/app/services/api.service.ts` | Guard `isPlatformBrowser` para `baseUrl` (opcional pero recomendado) |

---

## 7. Verificación post-deploy

```bash
# 1. El HTML de respuesta debe contener el <img> del acelerograma
curl -s https://sismologia.ice.go.cr | grep 'acelerograma1'

# 2. Las rutas de admin deben devolver HTML vacío (client-side rendering)
curl -s https://sismologia.ice.go.cr/repositorio | grep 'app-root'

# 3. Healthcheck del contenedor SSR
curl -f http://localhost:4000/
```
