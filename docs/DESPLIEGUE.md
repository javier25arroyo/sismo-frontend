# Guía de Despliegue — Sismo Frontend

Cubre requisitos, configuración, desarrollo local y despliegue con Docker.

---

## Requisitos previos

| Componente | Versión | Notas |
|---|---|---|
| Node.js | 24.16.0 LTS | Versión requerida para desarrollo local, CI y contenedores |
| pnpm | 10.32.1 | Gestor de paquetes (`corepack enable`) |
| Angular CLI | 21.2.6 | Instalado via devDependencies — no instalar globalmente |
| Docker Engine | 24+ | Solo para despliegue containerizado |

Descargar Node.js 24.16.0 LTS desde la página oficial:

- https://nodejs.org/en/download/

Después de instalar Node.js, cerrar y abrir la terminal. La versión debe quedar exactamente en 24.16.0:

```bash
node --version
# esperado: v24.16.0
```

Opciones de instalación por entorno:

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

Activar pnpm con Corepack:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm --version
# esperado: 10.32.1
```

---

## Configuración del entorno

La URL del backend se define en los archivos de entorno:

```
src/environments/
├── environment.ts          ← desarrollo local
└── environment.prod.ts     ← build de producción
```

### Desarrollo (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'   // backend local
};
```

### Producción (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080'   // ← cambiar al dominio/IP real del backend
};
```

> **Importante:** Actualizar `apiUrl` en `environment.prod.ts` antes de construir la imagen Docker de producción. Esta URL debe ser accesible desde el navegador del cliente, no desde el contenedor.

---

## Desarrollo local

```bash
# 1. Verificar versiones
node --version   # v24.16.0
pnpm --version   # 10.32.1

# 2. Instalar dependencias de forma reproducible
pnpm install --frozen-lockfile

# 3. Iniciar servidor de desarrollo (hot reload)
pnpm start            # equivale a: ng serve
                      # disponible en http://localhost:4200
```

Si el proyecto ya tenía `node_modules` creado con Node 20, 22 u otra versión anterior, hacer una instalación limpia:

```powershell
# Windows PowerShell
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path .angular\cache) { Remove-Item -Recurse -Force .angular\cache }
pnpm install --frozen-lockfile
```

```bash
# macOS, Linux o WSL
rm -rf node_modules .angular/cache
pnpm install --frozen-lockfile
```

Scripts disponibles:

| Comando | Acción |
|---|---|
| `pnpm start` | Servidor de desarrollo con hot reload |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm test` | Tests unitarios con Vitest (via `@angular/build:unit-test`) |
| `pnpm watch` | Build en modo watch (desarrollo) |
| `pnpm check` | Ejecuta lint, tests sin watch y build |

---

## Build de producción

```bash
# Build optimizado con hashing de assets
pnpm build                              # usa configuración production por defecto
pnpm build --configuration=production  # equivalente explícito
pnpm build --configuration=development # build de desarrollo (sin minificación)
```

Artefactos generados en `dist/sismo-frontend/browser/`. La configuración de producción activa:

- Minificación y tree-shaking
- Hashing de todos los assets (`outputHashing: all`)
- CSP auto-generado via nonce (`autoCsp: true`)
- Sin source maps

---

## Despliegue con Docker

### Paso 1 — Configurar URL del backend

Editar `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.dominio.com'  // o http://IP:9090
};
```

### Paso 2 — Construir e iniciar

```bash
cd FrontEnd-Angular/sismo-frontend
docker compose up -d --build
```

Frontend disponible en `http://localhost:4200` (el Compose mapea `4200:80`).

### Paso 3 — Verificar

```bash
docker compose logs -f web
curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/
# Debe retornar: 200
```

### Configuración nginx

El contenedor usa nginx con:
- Gzip habilitado para JS/CSS/JSON/SVG
- `index.html` sin caché (`no-store`) — garantiza que Angular cargue assets hasheados correctos
- Assets estáticos con caché inmutable de 1 año
- Routing SPA: todas las rutas redirigen a `index.html`
- Headers de seguridad: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc.

---

## Estructura del proyecto

```
src/app/
├── components/          # Componentes reutilizables
│   ├── header/          # Barra de navegación
│   ├── footer/
│   ├── main-layout/     # Shell de la app (header + router-outlet + footer)
│   ├── sismo-map/       # Mapa Leaflet de sismos
│   ├── scatter-chart/   # Gráfica de dispersión (Chart.js)
│   ├── paginacion/      # Paginador genérico
│   ├── magnitud-badge/  # Badge de color por magnitud
│   ├── stat-card/       # Tarjeta de estadística
│   ├── status-badge/    # Badge de estado
│   ├── button/
│   └── confirm-dialog/
├── pages/               # Vistas enrutadas (lazy-loaded)
│   ├── home/
│   ├── sismos/          # Lista paginada de sismos
│   ├── historial/       # Catálogo histórico RSS
│   ├── estaciones/      # Gestión de estaciones
│   ├── consultas/       # Acelerógrafos + RSN (tabs + mapa + gráficas)
│   ├── repositorio/     # Reportes y archivos generados
│   ├── umbrales-estaciones/  # Admin: configuración de umbrales por estación
│   ├── profile/         # Admin: perfil del usuario autenticado
│   ├── login/           # Acceso técnico (/acceso)
│   ├── recuperar-acceso/
│   └── cambiar-contrasena/
├── services/            # Capa de acceso al API
├── guards/              # AuthGuard (protege rutas privadas)
├── interfaces/          # Tipos TypeScript
│   ├── api.interfaces.ts   # DTOs del backend
│   └── sismo.interface.ts
└── environments/        # Configuración por entorno
```

---

## Rutas

| Ruta | Componente | Guardia |
|---|---|---|
| `/` | `HomePage` | — |
| `/sismos` | `SismosPage` | — |
| `/historial` | `HistorialPage` | — |
| `/estaciones` | `EstacionesPage` | — |
| `/consultas` | `ConsultasPage` | — |
| `/umbrales-estaciones` | `UmbralesEstacionesPage` | `AdminGuard` |
| `/repositorio` | `RepositorioPage` | `AdminGuard` |
| `/profile` | `ProfilePage` | `AdminGuard` |
| `/acceso` | `LoginPage` | — |
| `/recuperar-acceso` | `RecuperarAccesoPage` | — |
| `/cambiar-contrasena` | `CambiarContrasenaPage` | — |

---

## Arquitectura técnica

### Convenciones

- **100% standalone components** — no hay `NgModules`.
- **Signals** (`signal()`, `computed()`, `effect()`) para estado local reactivo; sin RxJS en componentes.
- **`ApiService`** como capa única de HTTP — usa `fetch` nativo, no `HttpClient`. Adjunta el token JWT automáticamente desde `localStorage`.
- **Lazy loading** — cada página es un chunk independiente cargado bajo demanda.
- **Tailwind CSS v4** — sin `tailwind.config.js`; configuración vía `src/styles.css`.
- **Vitest** como motor de tests, integrado via `@angular/build:unit-test`.

### Autenticación

- Login POST `/api/autenticacion/iniciar-sesion` → recibe JWT.
- Token almacenado en `localStorage` via `AuthService`.
- `auth.interceptor.ts` inyecta `Authorization: Bearer <token>` en cada petición.
- `AdminGuard` bloquea rutas administrativas y redirige a `/acceso` si no autenticado.

### Componentes compartidos clave

| Selector | Inputs principales | Propósito |
|---|---|---|
| `app-sismo-map` | `[sismos]`, `[height]`, `[zoom]`, `[center]`, `[showLegend]` | Mapa Leaflet con marcadores por magnitud |
| `app-scatter-chart` | `[datos]`, `[tituloX]`, `[tituloY]`, `[titulo]`, `[colorPunto]` | Gráfica de dispersión Chart.js |
| `app-paginacion` | `[paginaActual]`, `[totalPaginas]`, `(paginaCambio)` | Paginador genérico |
| `app-magnitud-badge` | `[magnitud]` | Badge con color según escala de magnitud |
| `app-status-badge` | `[estado]` | Badge de estado operativo de estación |
| `app-stat-card` | `[titulo]`, `[valor]` | Tarjeta de estadística |
| `app-confirm-dialog` | `[visible]`, `[title]`, `[message]`, `[action]`, `(confirm)`, `(cancel)` | Modal de confirmación |
| `app-password-expiration-warning` | — | Aviso de contraseña por vencer |

---

## Agregar una nueva página

1. Crear carpeta `src/app/pages/<nombre>/`.
2. Crear `<nombre>.page.ts` con `@Component({ standalone: true, ... })`.
3. Agregar ruta en `src/app/app.routes.ts`:
   ```typescript
   { path: 'ruta', loadComponent: () => import('./pages/<nombre>/<nombre>.page').then(m => m.NombrePage) }
   ```
4. Agregar enlace en `src/app/components/header/header.component.html`.

---

## Agregar un nuevo servicio

1. Crear `src/app/services/<nombre>.service.ts`.
2. Inyectar `ApiService` y usar `this.api.get<T>(path)`, `.post<T>(path, body)`, etc.
3. Declarar con `@Injectable({ providedIn: 'root' })`.

---

## Solución de problemas comunes

### `ng: command not found`

Angular CLI está en `devDependencies`, no en PATH global. Usar siempre:

```bash
pnpm ng <comando>
# o via script:
pnpm build
```

### Error de CORS al llamar al backend

El backend debe tener `APP_CORS_ALLOWED_ORIGINS=http://localhost:4200` (o el dominio de producción). Ver `docs/DESPLIEGUE.md` del backend.

### `pnpm install` falla con versión incorrecta de Node

Verificar versión:

```bash
node -v   # debe ser v24.16.0
```

Usar el instalador oficial de Node.js 24.16.0 LTS o un gestor de versiones como `nvm`/`fnm` para cambiar de versión. Después de cambiar Node, eliminar `node_modules` y reinstalar con `pnpm install --frozen-lockfile`.

### La app muestra datos vacíos / errores de red

Verificar que `environment.ts` (desarrollo) o `environment.prod.ts` (producción) apunten al backend correcto y que el backend esté corriendo.

### Build falla por presupuesto de bundle excedido

El bundle inicial tiene límite de advertencia en 500 kB y error en 1 MB. Si se superan:
- Revisar imports innecesarios
- Verificar que componentes grandes sean lazy-loaded
- Usar `pnpm build --configuration=production` para ver el análisis de tamaños
