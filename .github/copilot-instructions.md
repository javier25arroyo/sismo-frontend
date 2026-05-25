# SISMO Frontend — Instrucciones para Agentes

**Curado de**: Vercel Labs, Anthropic, Tailwind, ecosistema Angular

## Stack Tecnológico

- **Framework**: Angular 21 (componentes standalone, señales)
- **Styling**: Tailwind CSS 4.x (sin librerías de componentes)
- **Lenguaje**: TypeScript 5.9 modo strict
- **Mapas**: Leaflet 1.9
- **Formularios**: Basados en señales (sin RxJS en código nuevo)
- **Testing**: Vitest + testing-library

## Sistema de Diseño

### Tokens de Color

**Semánticos** (valores por defecto de Tailwind):
- Primario: `sky-600`, hover `sky-700`, claro `sky-500`
- Destructivo: `rose-600`, hover `rose-700`
- Éxito: `green-500` / `green-600`
- Neutral: `slate-50` → `slate-950`

**Escala de Magnitud** (datos sísmicos):
```
< 3.0  → green-500   (#22c55e)
3.0–4.0 → yellow-500  (#eab308)
4.0–5.0 → orange-500  (#f97316)
5.0–6.0 → red-500    (#ef4444)
> 6.0   → red-900    (#7c2d12)
```

### Tipografía
- Fuente: Inter (cargada en `src/styles.css`)
- Escala: `text-xs` → `text-3xl` (Tailwind)
- Pesos: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Espaciado y Diseño
- **Mobile-first**: base `px-4 py-8`
- **Escritorio**: `px-6 py-12`
- **Tarjetas**: `p-4` / `p-6`, `rounded-xl` / `rounded-2xl`
- **Sombras**: `shadow`, `shadow-md`, `shadow-lg`
- **Flexbox/Grid**: solo utilidades Tailwind

## Reglas de Componentes

1. **Reutiliza antes de crear**: Verifica `src/app/components/` para UI existente.
2. **Siempre standalone**: `standalone: true`, `imports: []` explícito
3. **Solo Tailwind**: Sin atributos `style=""`; sin CSS personalizado a menos que sea sobrescritura de Leaflet.
4. **Señales sobre RxJS**: Los nuevos componentes usan señales de Angular (`signal()`, `computed()`, `effect()`).
5. **TypeScript Strict**: `strict: true` en `tsconfig.json`; cobertura de tipos completa.

## Al Traducir Figma → Código

✅ **Haz:**
- Mapea colores Figma a la paleta Tailwind (sky, rose, slate, green)
- Responsive mobile-first (breakpoints `sm:`)
- Atributos `aria-label`, `role`, `aria-modal` en elementos interactivos
- Coloca imágenes en `public/Iconos/` con rutas absolutas (`/Iconos/...`)

❌ **No hagas:**
- Estilos inline
- Crees librerías de componentes (usa Tailwind compuesto)
- Mezcles señales y RxJS en el mismo componente
- Añadas comentarios para código obvio (los nombres son suficientes)

## Estructura del Proyecto

```
src/app/
├── components/       # UI standalone
│   ├── button/
│   ├── header/
│   ├── main-layout/
│   ├── sismo-map/
│   └── ...
├── pages/            # Componentes de nivel de ruta
│   ├── home/
│   ├── login/
│   ├── profile/
│   ├── mapa/
│   └── about/
├── services/         # Lógica de dominio + API
├── interfaces/       # Contratos de TypeScript
├── guards/           # Guardias de ruta
├── interceptors/     # HTTP JWT
├── app.routes.ts     # Definiciones de rutas
└── app.config.ts     # Proveedores, interceptores
```

## Mejores Prácticas de Vercel + Anthropic

- **Composición sobre herencia**: Prefiere slots de componentes + proyección de contenido.
- **Transiciones de vista**: Usa Tailwind `transition duration-*` para UI suave.
- **Tipos primero**: Define interfaces antes de la implementación.
- **Límites de error**: Envuelve operaciones asincrónicas con try/catch + feedback del usuario.
- **Rendimiento**: Carga perezosa de rutas; usa detección de cambios `OnPush` donde sea aplicable.

## Flujo de Desarrollo

1. Lee Figma → extrae tokens de diseño + diseño
2. Verifica matriz de reutilización de componentes en CLAUDE.md
3. Construye con Tailwind; valida responsive (móvil, tablet, escritorio)
4. Verificación de tipos: `npm run type-check` o `npx tsc --noEmit`
5. Test: `npm run test`
6. Revisión de código: Verifica cobertura de utilidades Tailwind + accesibilidad

---

**Última actualización**: 2025-05-17  
**Habilidades**: angular-tooling, vercel-composition-patterns, tailwind, typescript-advanced-types
