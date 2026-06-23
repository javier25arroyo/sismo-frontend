# Sismo Frontend

Frontend Angular 21 para monitoreo y consulta sismológica del ICE. La app usa componentes standalone, autenticación JWT, rutas con carga diferida, Tailwind CSS 4 y un despliegue final detrás de Nginx.

## Stack

| Tecnología | Versión |
|---|---|
| Angular | 21.2.x |
| Node.js | 24.16.0 LTS |
| TypeScript | 5.9.x |
| PNPM | 10.32.1 |
| Tailwind CSS | 4.x |
| RxJS | 7.8.x |
| Leaflet | 1.9.x |
| Chart.js | 4.x |
| Lucide Angular | 1.x |
| Vitest | 4.x (via `@angular/build:unit-test`) |

## Funcionalidad actual

- Layout principal con header y footer.
- Navegación pública para monitoreo sismológico, histórico, estaciones y consultas.
- Pantallas administrativas para umbrales, repositorio, perfil y cambio de contraseña.
- Autenticación JWT con persistencia en `localStorage`.
- Cliente HTTP centralizado con header `Authorization` automático.
- Mapas, tablas, gráficas, formularios y modales reutilizables.

## Rutas principales

| Ruta | Acceso | Guardia | Descripción |
| --- | --- | --- | --- |
| `/` | Público | — | Inicio: último sismo y estado de la red. |
| `/sismos` | Público | — | Análisis de eventos sísmicos recientes. |
| `/historial` | Público | — | Catálogo histórico de sismos con filtros. |
| `/estaciones` | Público | — | Estado operativo de la red de estaciones. |
| `/consultas` | Público | — | Acelerógrafos + RSN: tablas, mapas y gráficas. |
| `/acceso` | Público | — | Ingreso técnico para personal autorizado. |
| `/recuperar-acceso` | Público | — | Guía para recuperar acceso al sistema. |
| `/cambiar-contrasena` | Público | — | Cambio de contraseña (flujo post-login). |
| `/umbrales-estaciones` | Admin | `AdminGuard` | Configuración de umbrales por estación. |
| `/repositorio` | Admin | `AdminGuard` | Reportes y archivos generados por el sistema. |
| `/profile` | Admin | `AdminGuard` | Gestión del perfil y usuarios autorizados. |
| `/login` | Redirección | — | Alias de compatibilidad → redirige a `/acceso`. |

La definición está en [src/app/app.routes.ts](src/app/app.routes.ts). La ruta raíz carga `MainLayoutComponent`.

## Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Archivos y carpetas | `kebab-case` | `cambiar-contrasena.page.ts` |
| Clases y componentes | `PascalCase` | `CambiarContrasenaPage` |
| Métodos y variables | `camelCase` | `buildHeaders()` |
| Servicios, guards, interceptors, pipes e interfaces | nombre del dominio + sufijo | `auth.service.ts`, `auth.guard.ts`, `auth.interceptor.ts`, `utc-local.pipe.ts`, `user.interface.ts` |
| Selectores Angular | prefijo `app-` + `kebab-case` | `app-main-layout` |
| Rutas | `kebab-case` | `/cambiar-contrasena` |

Distribución por carpetas:

| Carpeta | Propósito |
|---|---|
| `src/app/pages/` | Pantallas completas (lazy-loaded por ruta) |
| `src/app/components/` | Piezas reutilizables entre páginas |
| `src/app/services/` | Acceso a API y lógica de dominio compartida |
| `src/app/guards/` | `AdminGuard` — protege rutas de administración |
| `src/app/interceptors/` | `auth.interceptor.ts` — inyecta token JWT en cada petición |
| `src/app/interfaces/` | DTOs TypeScript (`api.interfaces.ts`) |
| `src/app/pipes/` | Transformaciones de presentación (`utc-local.pipe.ts`) |
| `src/environments/` | `environment.ts` (dev) / `environment.prod.ts` (prod) |

## Normas de desarrollo

- Mantener el patrón standalone. No introducir NgModules nuevos.
- Colocar pantallas completas en `pages` y reutilizables en `components`.
- Centralizar llamadas HTTP en `ApiService` y la lógica de token en `auth.interceptor.ts`.
- Evitar duplicar headers, manejo de errores o reglas de auth en páginas individuales.
- Usar Node.js 24.16.0 LTS y `pnpm` 10.32.1. No mezclar `npm`, `yarn` y `pnpm`.
- Conservar `pnpm-lock.yaml`; no eliminarlo para resolver problemas de instalación.
- Dejar `src/styles.css` como entrada global de Tailwind y de los tokens visuales.
- `public/` se usa para activos estáticos servidos tal cual.
- Validar cambios con `pnpm check` antes de publicar.
- Usar `AdminGuard` (no `AuthGuard`) para proteger rutas administrativas.
- Si alternas entre Windows y WSL, reinstala `node_modules` en el mismo entorno donde vas a ejecutar Angular.

## Configuración

### Entornos

El código importa siempre `src/environments/environment`. Angular reemplaza el archivo de producción en la build.

- [src/environments/environment.ts](src/environments/environment.ts): desarrollo, `apiUrl: 'http://localhost:8080'`.
- [src/environments/environment.prod.ts](src/environments/environment.prod.ts): producción, `apiUrl: ''` para usar same-origin y el proxy de Nginx.
- [angular.json](angular.json): define el `fileReplacement` entre ambos entornos en la configuración `production`.

### Bootstrap de Angular

- [src/app/app.config.ts](src/app/app.config.ts): locale `es`, animaciones, router con preloading selectivo y restauración de scroll, `withFetch()` y `authInterceptor`.
- [src/app/interceptors/auth.interceptor.ts](src/app/interceptors/auth.interceptor.ts): agrega el bearer token a las peticiones cuando hay sesión.
- [src/app/services/api.service.ts](src/app/services/api.service.ts): wrapper de `fetch` con normalización de errores y construcción centralizada de headers.
- [src/app/services/selective-preloading.strategy.ts](src/app/services/selective-preloading.strategy.ts): pre-carga selectiva para rutas marcadas.
- [src/app/services/seo-title.strategy.ts](src/app/services/seo-title.strategy.ts): resuelve títulos de página y metadatos de navegación.

### Estilos globales

- [src/styles.css](src/styles.css): importa Tailwind 4 con `@import "tailwindcss";`, define fuentes, colores, radios, sombras y utilidades globales.
- [postcss.config.json](postcss.config.json): activa el plugin `@tailwindcss/postcss`.
- No hace falta `tailwind.config.js` en este proyecto con la configuración actual.

### Build

- [angular.json](angular.json): build de producción con AOT, `outputHashing`, `autoCsp` y budgets de tamaño.
- La configuración de desarrollo activa source maps y HMR.
- `leaflet` está autorizado como dependencia CommonJS en la build.

### Mapas y SSR

- [src/app/routing/server-render-policy.ts](src/app/routing/server-render-policy.ts): política central de `ServerRoute` para rutas públicas y administrativas.
- [src/app/components/sismo-map/sismo-map.component.ts](src/app/components/sismo-map/sismo-map.component.ts) y [src/app/components/estacion-mini-map/estacion-mini-map.component.ts](src/app/components/estacion-mini-map/estacion-mini-map.component.ts): inicializan Leaflet solo en navegador y muestran fallback mientras el mapa no está listo.
- [scripts/smoke-ssr-map-routes.mjs](scripts/smoke-ssr-map-routes.mjs): verificación local de las rutas con mapas sobre el SSR.
- Validar cambios con `pnpm smoke:ssr:maps` además de `pnpm check` cuando los mapas cambien.

## Desarrollo local

### Requisitos

Este proyecto debe ejecutarse con Node.js 24.16.0 LTS y pnpm 10.32.1. La descarga oficial de Node.js está en:

- https://nodejs.org/en/download/

Versiones esperadas:

- Node.js `v24.16.0`
- pnpm `10.32.1`

Verifica versiones con:

```bash
node --version   # debe mostrar v24.16.0
pnpm --version
```

Si `node --version` muestra una versión distinta, instala Node.js 24.16.0 LTS y vuelve a abrir la terminal antes de instalar dependencias.

Comandos recomendados:

```powershell
# Windows con winget
winget install OpenJS.NodeJS.LTS --version 24.16.0
```

```bash
# macOS o Linux con nvm
nvm install 24.16.0
nvm use 24.16.0
nvm alias default 24.16.0
```

```bash
# Activar pnpm desde Corepack
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

### Instalación

```bash
git clone https://github.com/javier25arroyo/sismo-frontend.git
cd sismo-frontend
pnpm install --frozen-lockfile
```

Si ya tenías `node_modules` instalado con otra versión de Node, elimina dependencias y caché de Angular antes de reinstalar.

PowerShell:

```powershell
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path .angular\cache) { Remove-Item -Recurse -Force .angular\cache }
pnpm install --frozen-lockfile
```

Bash:

```bash
rm -rf node_modules .angular/cache
pnpm install --frozen-lockfile
```

Validación completa:

```bash
pnpm check
```

### Ejecución

```bash
pnpm start
```

o:

```bash
pnpm ng serve
```

La aplicación queda disponible en `http://localhost:4200/` y la API de desarrollo se espera en `http://localhost:8080`.

### Build

```bash
pnpm build
```

La build de producción es la configuración por defecto. Para build con watch:

```bash
pnpm watch
```

### Pruebas

```bash
pnpm test
```

Si quieres ejecutarlas sin modo interactivo, usa:

```bash
pnpm test --watch=false
```

## Despliegue

### Docker

El repositorio incluye un `Dockerfile` multi-etapa:

- etapa de dependencias sobre `node:24.16.0-alpine`
- etapa de build con `pnpm build --configuration=production`
- etapa runtime SSR sobre `node:24.16.0-alpine`

Comandos habituales:

```bash
docker build -t sismo-frontend:local .
docker compose up --build
```

`docker-compose.yml` publica la UI en `http://localhost:4200/`. El backend debe estar accesible como `app:8080` en la misma red Docker para que el proxy `/api/` funcione.

### Nginx

[nginx.conf](nginx.conf) hace tres cosas principales:

- sirve la SPA con fallback a `index.html`
- proxy inverso de `/api/` hacia el backend
- restringe `/actuator/` a acceso interno

Además aplica cabeceras de seguridad, compresión gzip y caché inmutable para assets con hash.

### Releases

El workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) se activa con tags `vX.Y.Z`. Ese flujo construye la imagen, la publica en GHCR y crea o actualiza el release de GitHub con los tags semver y `latest`.

Si el release es `v0.x.y`, el workflow omite el tag Docker `0` porque major `0` se trata como etapa inicial de desarrollo.

Ejemplo:

```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

## Estructura

```text
src/
  app/
    components/
      button/
      confirm-dialog/
      estacion-form-modal/
      footer/
      header/
      main-layout/
      password-expiration-warning/
      paginacion/
      scatter-chart/
      sismo-map/
      magnitud-badge/
      stat-card/
      status-badge/
    guards/
      admin.guard.ts
    interceptors/
      auth.interceptor.ts
    interfaces/
      api.interfaces.ts
    pages/
      cambiar-contrasena/
      consultas/
      estaciones/
      historial/
      home/
      login/
      profile/
      recuperar-acceso/
      repositorio/
      sismos/
      umbrales-estaciones/
    pipes/
    services/
    app.config.ts
    app.routes.ts
    app.ts
  environments/
    environment.ts
    environment.prod.ts
  main.ts
  styles.css
public/
  Iconos/
docs/
  DESPLIEGUE.md
```

## Archivos clave

- [src/app/app.routes.ts](src/app/app.routes.ts): definición de rutas.
- [src/app/app.config.ts](src/app/app.config.ts): bootstrap de Angular.
- [src/app/services/api.service.ts](src/app/services/api.service.ts): acceso HTTP centralizado.
- [src/app/interceptors/auth.interceptor.ts](src/app/interceptors/auth.interceptor.ts): inyección del token JWT.
- [src/environments/environment.ts](src/environments/environment.ts): configuración de desarrollo.
- [src/environments/environment.prod.ts](src/environments/environment.prod.ts): configuración de producción.
- [Dockerfile](Dockerfile): imagen de despliegue.
- [nginx.conf](nginx.conf): proxy inverso y reglas de servidor.

## Licencia

Apache 2.0. Consulta [LICENSE](LICENSE).
