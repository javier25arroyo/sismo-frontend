# Sismo Frontend

Frontend en Angular con componentes standalone, autenticacion basada en JWT y estilos con Tailwind CSS 4.

## Stack

- Angular 21
- TypeScript 5.9
- Tailwind CSS 4
- PostCSS
- RxJS
- PNPM

## Funcionalidad actual

- Layout principal con header y footer
- Paginas `Home`, `About`, `Login`, `CambiarContrasena` y `Profile`
- Ruta protegida en `/profile`
- Servicio de autenticacion con almacenamiento de token en `localStorage`
- Servicio API con envio automatico de header `Authorization`
- Flujo de cambio de contrasena para el primer acceso
- Modal de confirmacion reutilizable
- UI refactorizada para usar Tailwind en los templates

## Rutas

| Ruta | Acceso | Descripcion |
| --- | --- | --- |
| `/` | Publico | Pagina principal con acciones de ejemplo |
| `/about` | Publico | Informacion general de la aplicacion |
| `/login` | Publico | Formulario de autenticacion |
| `/cambiar-contrasena` | Protegido | Cambio de contraseña tras el primer acceso |
| `/profile` | Protegido | Vista solo para usuarios autenticados |

La configuracion de rutas esta en [src/app/app.routes.ts](src/app/app.routes.ts).

## Requisitos

- Node.js 20 o superior
- PNPM 10

Puedes verificar versiones con:

```bash
node --version
pnpm --version
```

## Instalacion

```bash
git clone https://github.com/javier25arroyo/sismo-frontend.git
cd sismo-frontend
pnpm install
```

## Desarrollo

Inicia el servidor local:

```bash
pnpm start
```

o:

```bash
pnpm ng serve
```

La aplicacion queda disponible en `http://localhost:4200/`.

## Build

```bash
pnpm build
```

Build en modo desarrollo con watch:

```bash
pnpm watch
```

## Releases

Los releases usan tags semanticos con formato `vX.Y.Z`. Al empujar un tag de ese formato, GitHub Actions crea/actualiza el release y publica la imagen Docker en GitHub Container Registry:

```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

La imagen queda disponible como `ghcr.io/javier25arroyo/sismo-frontend:v1.2.3` y tambien con tags semver derivados como `1.2.3`, `1.2`, `1` y `latest`.

## Tests

```bash
pnpm test
```

## Tailwind

Tailwind esta configurado con:

- [src/styles.css](src/styles.css)
- [postcss.config.json](postcss.config.json)
- [tailwind.config.js](tailwind.config.js)

En Tailwind 4 el archivo global usa:

```css
@import "tailwindcss";
```

Si `ng serve` levanta pero no ves estilos, primero confirma que `src/styles.css` siga importando Tailwind y luego reinicia el servidor.

## Nota importante sobre Windows y WSL

Si instalas dependencias en Windows y luego ejecutas `pnpm build` o `ng serve` desde WSL, puedes tener errores con binarios nativos como `esbuild` o `lightningcss`.

La regla correcta es esta:

- Instala dependencias en el mismo entorno donde vas a ejecutar Angular.

Ejemplo en WSL:

```bash
rm -rf node_modules
pnpm install
pnpm ng serve
```

Si trabajas desde PowerShell o CMD en Windows, entonces instala y ejecuta todo desde Windows.

## Estructura

```text
src/
  app/
    components/
      button/
      confirm-dialog/
      footer/
      header/
      main-layout/
    guards/
      auth.guard.ts
    pages/
      about/
      cambiar-contrasena/
      home/
      login/
      profile/
    services/
      api.service.ts
      auth.service.ts
    app.config.ts
    app.routes.ts
    app.ts
  index.html
  main.ts
  styles.css
public/
```

## Scripts

- `pnpm start`: servidor de desarrollo
- `pnpm build`: build de produccion
- `pnpm watch`: build en modo desarrollo con watch
- `pnpm test`: pruebas unitarias
- `pnpm ng`: comandos directos de Angular CLI

## Archivos clave

- [src/app/app.routes.ts](src/app/app.routes.ts): definicion de rutas
- [src/app/guards/auth.guard.ts](src/app/guards/auth.guard.ts): proteccion de rutas
- [src/app/services/auth.service.ts](src/app/services/auth.service.ts): manejo del token JWT
- [src/app/services/api.service.ts](src/app/services/api.service.ts): cliente HTTP basico
- [src/styles.css](src/styles.css): entrada global de Tailwind

## Licencia

Apache 2.0. Consulta [LICENSE](LICENSE).
