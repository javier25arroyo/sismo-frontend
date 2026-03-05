# Sismo Frontend

Aplicación web frontend desarrollada con Angular para la gestión y visualización de datos sísmicos.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con las siguientes tecnologías modernas:

### Core Framework
- **[Angular 21.1](https://angular.dev/)** - Framework web progresivo para construir aplicaciones modernas
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Superset de JavaScript con tipado estático
- **[RxJS 7.8](https://rxjs.dev/)** - Biblioteca para programación reactiva usando Observables

### Estilos y UI
- **[TailwindCSS 4.1](https://tailwindcss.com/)** - Framework CSS utility-first para diseño rápido
- **[PostCSS](https://postcss.org/)** - Herramienta para transformar CSS con plugins JavaScript
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - Plugin PostCSS para agregar prefijos de vendors automáticamente

### Testing
- **[Vitest 4.0](https://vitest.dev/)** - Framework de testing rápido y moderno

### Herramientas de Desarrollo
- **[Angular CLI 21.1.4](https://angular.dev/tools/cli)** - Interfaz de línea de comandos para Angular
- **[PNPM 10.29](https://pnpm.io/)** - Gestor de paquetes eficiente y rápido

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

### Node.js
Se requiere Node.js versión 18.19 o superior. Puedes verificar tu versión con:

```bash
node --version
```

Para instalar Node.js:
- **Windows/macOS**: Descarga desde [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu/Debian)**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Linux (Fedora)**:
  ```bash
  sudo dnf install nodejs
  ```
- **macOS (con Homebrew)**:
  ```bash
  brew install node
  ```

### PNPM
Este proyecto utiliza PNPM como gestor de paquetes. Para instalarlo globalmente:

```bash
npm install -g pnpm
```

O usando Corepack (incluido con Node.js 16.13+):

```bash
corepack enable
corepack prepare pnpm@10.29.3 --activate
```

Verifica la instalación:
```bash
pnpm --version
```

## 🔧 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/javier25arroyo/sismo-frontend.git
   cd sismo-frontend
   ```

2. **Instalar las dependencias**
   ```bash
   pnpm install
   ```
   
   Este comando instalará todas las dependencias especificadas en el archivo `package.json`.

3. **Verificar la instalación**
   ```bash
   pnpm ng version
   ```
   
   Deberías ver la versión de Angular CLI y las versiones de los paquetes instalados.

## 🚀 Uso

### Servidor de Desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
pnpm start
```

o alternativamente:

```bash
pnpm ng serve
```

Una vez que el servidor esté ejecutándose, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques cualquiera de los archivos fuente.

### Construcción del Proyecto

Para construir el proyecto para producción:

```bash
pnpm build
```

Esto compilará tu proyecto y almacenará los artefactos de construcción en el directorio `dist/`. Por defecto, la construcción de producción optimiza tu aplicación para rendimiento y velocidad.

Para construcción en modo desarrollo con observación de cambios:

```bash
pnpm watch
```

### Ejecutar Tests

Para ejecutar las pruebas unitarias con [Vitest](https://vitest.dev/):

```bash
pnpm test
```

### Generación de Código

Angular CLI incluye herramientas poderosas para scaffolding de código. Para generar un nuevo componente:

```bash
pnpm ng generate component nombre-componente
```

Para una lista completa de schematics disponibles (como `components`, `directives`, `pipes`, `services`, etc.):

```bash
pnpm ng generate --help
```

Ejemplos útiles:
```bash
# Generar un servicio
pnpm ng generate service services/nombre-servicio

# Generar un módulo
pnpm ng generate module nombre-modulo

# Generar un guard
pnpm ng generate guard guards/nombre-guard

# Generar un pipe
pnpm ng generate pipe pipes/nombre-pipe
```

## 📁 Estructura del Proyecto

```
sismo-frontend/
├── src/
│   ├── app/              # Componentes, servicios y módulos de la aplicación
│   ├── assets/           # Recursos estáticos (imágenes, fuentes, etc.)
│   ├── index.html        # Página HTML principal
│   ├── main.ts          # Punto de entrada de la aplicación
│   └── styles.css       # Estilos globales
├── public/              # Archivos públicos estáticos
├── angular.json         # Configuración de Angular CLI
├── package.json         # Dependencias y scripts del proyecto
├── pnpm-lock.yaml      # Archivo de bloqueo de dependencias de PNPM
├── tailwind.config.js  # Configuración de TailwindCSS
├── tsconfig.json       # Configuración de TypeScript
└── README.md           # Este archivo
```

## 🛠️ Scripts Disponibles

En el archivo `package.json` encontrarás los siguientes scripts:

- `pnpm start` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm watch` - Construye la aplicación en modo watch (desarrollo)
- `pnpm test` - Ejecuta las pruebas unitarias
- `pnpm ng` - Ejecuta comandos de Angular CLI directamente

## 📚 Recursos Adicionales

- [Documentación de Angular](https://angular.dev/overview)
- [Guía de Angular CLI](https://angular.dev/tools/cli)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Vitest](https://vitest.dev/guide/)
- [Documentación de PNPM](https://pnpm.io/motivation)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia Apache 2.0 - ver el archivo [LICENSE](LICENSE) para más detalles.


