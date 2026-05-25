# Sistema de Diseño SISMO Frontend

Documentación completa del sistema de diseño, convenciones y patrones de implementación para mantener consistencia en todos los desarrollos del frontend SISMO.

---

## 1. Paleta de Colores

### 1.1 Colores Semánticos (Tailwind)

La paleta principal se basa en Tailwind CSS con valores específicos para cada contexto.

#### Primarios (Acciones, CTAs)
```
sky-500:  #0ea5e9  — Claro, textos sobre fondo oscuro
sky-600:  #0284c7  — Base, botones primarios
sky-700:  #0369a1  — Hover, estado activo
```

**Visualización:**

```
┌─────────────────────────────────────────────────────┐
│                  COLORES PRIMARIOS                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  sky-500  │████████████████│  #0ea5e9               │
│  (claro)  │████████████████│  Textos sobre oscuro   │
│           │                │                        │
│  sky-600  │████████████████│  #0284c7               │
│  (base)   │████████████████│  Botones primarios     │
│           │                │                        │
│  sky-700  │████████████████│  #0369a1               │
│  (hover)  │████████████████│  Estados activos       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Uso:**
- `sky-600`: Botones primarios, enlaces principales, encabezados
- `sky-700`: Estados hover, botones presionados
- `sky-500`: Textos claros sobre fondos oscuros (ej: navbar)

**Ejemplo en Tailwind:**
```html
<button class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl">
  Acción primaria
</button>
```

#### Destructivos/Peligro (Eliminación, Advertencias)
```
rose-600:  #e11d48  — Base, botones destructivos
rose-700:  #be123c  — Hover, estado activo
```

**Visualización:**

```
┌─────────────────────────────────────────────────────┐
│               COLORES DESTRUCTIVOS                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  rose-600 │████████████████│  #e11d48               │
│  (base)   │████████████████│  Botones eliminar      │
│           │                │                        │
│  rose-700 │████████████████│  #be123c               │
│  (hover)  │████████████████│  Estados hover         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Uso:**
- `rose-600`: Botones de eliminar, acciones irreversibles
- `rose-700`: Estados hover en botones destructivos

**Ejemplo:**
```html
<button class="bg-rose-600 hover:bg-rose-700 text-white">
  Eliminar
</button>
```

#### Éxito (Validación, Estados Positivos)
```
green-500: #22c55e  — Indicador de éxito
green-600: #16a34a  — Alternativa más oscura
```

**Visualización:**

```
┌─────────────────────────────────────────────────────┐
│                COLORES DE ÉXITO                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  green-500│████████████████│  #22c55e               │
│  (claro)  │████████████████│  Checkmarks, OK        │
│           │                │                        │
│  green-600│████████████████│  #16a34a               │
│  (oscuro) │████████████████│  Fondos de éxito       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Uso:**
- `green-500`: Checkmarks, validaciones, estados activos
- `green-600`: Fondos de éxito

#### Neutros (Fondos, Textos, Bordes)
```
slate-50:   #f8fafc  — Fondo muy claro (casi blanco)
slate-100:  #f1f5f9  — Fondo claro
slate-200:  #e2e8f0  — Bordes claros
slate-400:  #94a3b8  — Textos secundarios
slate-600:  #475569  — Textos terciarios
slate-900:  #0f172a  — Textos primarios (casi negro)
slate-950:  #020617  — Fondo muy oscuro
```

**Visualización:**

```
┌─────────────────────────────────────────────────────┐
│                 COLORES NEUTROS                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  slate-50  │░░░░░░░░░░░░░░░│  #f8fafc (blanco)      │
│  slate-100 │░░░░░░░░░░░░░░░│  #f1f5f9               │
│  slate-200 │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  #e2e8f0               │
│  slate-400 │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  #94a3b8               │
│  slate-600 │███████████████│  #475569               │
│  slate-900 │███████████████│  #0f172a               │
│  slate-950 │███████████████│  #020617 (negro)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Uso:**
- `slate-50`: Fondos principales de páginas
- `slate-900`: Textos primarios sobre fondos claros
- `slate-600`: Textos secundarios, descripciones
- `slate-200`: Bordes sutiles

### 1.2 Escala de Magnitud Sísmica

Colores específicos para indicar la magnitud de sismos según criterios técnicos.

**Tabla de criterios:**

```
Nivel 1 (M ≥ 3.5, d ≤ 20 km):
  → Color: #22c55e (green-500)
  → Severidad: Baja

Nivel 2 (M ≥ 4.0, d ≤ 70 km):
  → Color: #eab308 (yellow-500)
  → Severidad: Moderada

Nivel 3 (M ≥ 5.0, d ≤ 400 km):
  → Color: #f97316 (orange-500)
  → Severidad: Alta

Nivel 4 (M ≥ 6.0, d ≤ 600 km):
  → Color: #ef4444 (red-500)
  → Severidad: Muy alta

Sin criterios:
  → Color: #94a3b8 (slate-400)
  → Estado: No clasificado
```

**Visualización - Escala de Magnitud:**

```
┌────────────────────────────────────────────────────────────┐
│          ESCALA DE MAGNITUD SÍSMICA - COLORES              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ● Nivel 1  BAJA           #22c55e  M≥3.5  d≤20km          │
│  ▲ Nivel 2  MODERADA       #eab308  M≥4.0  d≤70km          │
│  ▲ Nivel 3  ALTA           #f97316  M≥5.0  d≤400km         │
│  ▲ Nivel 4  MUY ALTA       #ef4444  M≥6.0  d≤600km         │
│  ○ Sin criterios NO CLASIF #94a3b8  —      —               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**En el mapa:**

```
  Epicentro del sismo
        ▲
        │
   ● Verde      Baja (no amerita alerta)
   ▲ Amarillo   Moderada (monitoreo)
   ▲ Naranja    Alta (alerta)
   ▲ Rojo       Muy alta (riesgo crítico)
```

**Implementación:** Usar `categorizarSismo()` en `utils/sismo-criterios.ts`

```typescript
import { categorizarSismo } from '@/utils/sismo-criterios';

const magnitudLevel = categorizarSismo({
  magnitud: 4.8,
  distanciaHipocentral: 150
});

// Usar magnitudLevel para aplicar color dinámico
```

### 1.3 Variables CSS Personalizadas

Definidas en `src/styles.css`:

```css
:root {
  --color-text-primary: #172026;
  --color-text-secondary: #475569;
  
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 10px 30px rgba(2, 47, 64, 0.10);
  --shadow-lg: 0 12px 36px rgba(2, 47, 64, 0.12);
  --shadow-xl: 0 20px 60px rgba(2, 47, 64, 0.16);
  --shadow-2xl: 0 32px 80px rgba(2, 47, 64, 0.20);
}
```

---

## 2. Tipografía

### 2.1 Familia de Fuentes

**Fuente principal:** Inter (sistema fallback: system-ui, sans-serif)

Cargada en `src/styles.css` con pesos 400 y 700.

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
```

### 2.2 Escala de Tipografía (Tailwind)

| Clase Tailwind | Tamaño | Uso |
|---|---|---|
| `text-xs` | 0.75rem (12px) | Labels, tags, metadata |
| `text-sm` | 0.875rem (14px) | Textos secundarios, hints |
| `text-base` | 1rem (16px) | Texto corpóreo (párrafos) |
| `text-lg` | 1.125rem (18px) | Subtítulos |
| `text-xl` | 1.25rem (20px) | Títulos de sección |
| `text-2xl` | 1.5rem (24px) | Títulos principales |
| `text-3xl` | 1.875rem (30px) | Títulos de página |
| `text-4xl` | 2.25rem (36px) | Héroes, mega-títulos |

### 2.3 Pesos de Fuente

| Clase Tailwind | Peso | Uso |
|---|---|---|
| `font-normal` | 400 | Texto regular, body |
| `font-medium` | 500 | Énfasis leve |
| `font-semibold` | 600 | Títulos secundarios |
| `font-bold` | 700 | Títulos principales, destacados |

**Ejemplo de jerarquía tipográfica:**

```html
<!-- Título principal de página -->
<h1 class="text-4xl font-bold text-slate-900">
  Historial de Sismos
</h1>

<!-- Subtítulo -->
<h2 class="text-2xl font-semibold text-slate-700 mt-6">
  Últimos 30 días
</h2>

<!-- Texto corpóreo -->
<p class="text-base font-normal text-slate-600">
  Se registraron 12 eventos sísmicos en el período analizado.
</p>

<!-- Label/metadata -->
<span class="text-xs font-semibold uppercase text-sky-600">
  Nivel 2 - Moderado
</span>
```

### 2.4 Espaciado de Línea

Utilizar propiedades de Tailwind:

- `leading-tight`: 1.25 (línea estrecha para títulos)
- `leading-snug`: 1.375 (para subtítulos)
- `leading-normal`: 1.5 (estándar para párrafos)
- `leading-relaxed`: 1.625 (para legibilidad mejorada)
- `leading-loose`: 2 (para textos largos)

```html
<p class="text-base leading-relaxed text-slate-600">
  Párrafo con mayor espaciado de línea para mejor legibilidad.
</p>
```

---

## 3. Espaciado (Layout)

### 3.1 Escala de Espaciado (Tailwind)

Todos los espacios utilizan la escala estándar de Tailwind (múltiplos de 4px):

| Clase | Valor | Uso |
|---|---|---|
| `p-2` | 0.5rem (8px) | Padding compacto |
| `p-3` | 0.75rem (12px) | Padding normal |
| `p-4` | 1rem (16px) | Padding estándar |
| `p-6` | 1.5rem (24px) | Padding amplio |
| `p-8` | 2rem (32px) | Padding de sección |
| `p-12` | 3rem (48px) | Padding de página |

### 3.2 Márgenes

```html
<!-- Separación entre secciones -->
<section class="mt-8 mb-12">...</section>

<!-- Separación entre elementos -->
<div class="mb-4">...</div>
<div class="mb-4">...</div>

<!-- Separación horizontal -->
<div class="ml-auto mr-4">...</div>
```

### 3.3 Gap (Espaciado en Flex/Grid)

```html
<!-- Flex con gap -->
<div class="flex gap-4">
  <button>Botón 1</button>
  <button>Botón 2</button>
</div>

<!-- Grid con gap -->
<div class="grid grid-cols-3 gap-6">
  <card />
  <card />
  <card />
</div>
```

### 3.4 Estructura de Secciones

**Padding de página:**
```html
<div class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
  <div class="max-w-7xl mx-auto">
    <!-- Contenido -->
  </div>
</div>
```

**Padding de tarjetas:**
```html
<div class="rounded-xl bg-white p-4 sm:p-6 shadow-md">
  <!-- Contenido de tarjeta -->
</div>
```

---

## 4. Bordes y Border-Radius

### 4.1 Border-Radius (Redondeado)

| Clase | Valor | Uso |
|---|---|---|
| `rounded-lg` | 0.5rem (8px) | Bordes sutiles |
| `rounded-xl` | 0.75rem (12px) | Botones, inputs, tarjetas |
| `rounded-2xl` | 1rem (16px) | Modales, grandes componentes |
| `rounded-3xl` | 1.5rem (24px) | Héroes, overlays grandes |
| `rounded-full` | 9999px | Avatares, badges circulares |

**Visualización - Redondeado Progresivo:**

```
┌────────────────────────────────────────────────────┐
│          BORDER-RADIUS - VALORES PROGRESIVOS       │
├────────────────────────────────────────────────────┤
│                                                    │
│  rounded-lg (8px)                                  │
│  ┌─────────────────────────┐                       │
│  │                         │                       │
│  │   Bordes sutiles        │                       │
│  │                         │                       │
│  └─────────────────────────┘                       │
│                                                    │
│  rounded-xl (12px) [ESTÁNDAR]                      │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━┓                         │
│  ┃                       ┃                         │
│  ┃  Botones, tarjetas    ┃                         │
│  ┃                       ┃                         │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━┛                         │
│                                                    │
│  rounded-2xl (16px)                                │
│  ╭─────────────────────────╮                       │
│  │                         │                       │
│  │  Modales, componentes   │                       │
│  │  grandes                │                       │
│  │                         │                       │
│  ╰─────────────────────────╯                       │
│                                                    │
│  rounded-3xl (24px)                                │
│  ╭───────────────────────────╮                     │
│  │                           │                     │
│  │  Héroes, overlays grandes │                     │
│  │                           │                     │
│  ╰───────────────────────────╯                     │
│                                                    │
│  rounded-full (circular)                           │
│        ╭───────╮                                   │
│        │  ○    │  Avatares, badges circulares      │
│        ╰───────╯                                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Ejemplos:**

```html
<!-- Botón con redondeado estándar -->
<button class="rounded-xl bg-sky-600 px-4 py-2">Botón</button>

<!-- Tarjeta con redondeado -->
<div class="rounded-xl bg-white p-6 shadow-md">...</div>

<!-- Modal con redondeado mayor -->
<dialog class="rounded-2xl bg-white shadow-2xl">...</dialog>

<!-- Avatar circular -->
<img class="w-10 h-10 rounded-full object-cover" src="..." />
```

### 4.2 Bordes Sutiles

Usar `border` y `border-slate-200` para bordes claros:

**Visualización:**

```
┌──────────────────────────────────────────┐
│        TIPOS DE BORDES                   │
├──────────────────────────────────────────┤
│                                          │
│  Borde completo:                         │
│  ┌──────────────────────────────────┐    │
│  │ border border-slate-200 rounded-xl    │
│  │ 1px sólido #e2e8f0                    │
│  └──────────────────────────────────┘    │
│                                          │
│  Borde inferior solamente:               │
│  Contenido                               │
│  ─────────────────────────────────       │
│  border-b border-slate-200 (divisor)     │
│                                          │
│  Sin borde (flat):                       │
│  ┌──────────────────────────────────┐    │
│  │ bg-white shadow-md (elevado)     │    │
│  │ Sin border, solo sombra          │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

**Código:**

```html
<!-- Borde sutil completo -->
<div class="border border-slate-200 rounded-xl p-4">
  <!-- Contenido -->
</div>

<!-- Borde específico (separador) -->
<div class="border-b border-slate-200">
  <!-- Línea de separación -->
</div>

<!-- Sin borde, elevado con sombra -->
<div class="bg-white shadow-md rounded-xl p-4">
  <!-- Contenido -->
</div>
```

---

## 5. Sombras

### 5.1 Escala de Sombras (Tailwind)

| Clase | Elevación | Uso |
|---|---|---|
| Sin shadow | - | Elementos planos |
| `shadow-sm` | Baja | Elementos suavemente elevados |
| `shadow-md` | Media | Tarjetas normales |
| `shadow-lg` | Alta | Elementos prominentes |
| `shadow-xl` | Muy alta | Modales, popovers |
| `shadow-2xl` | Máxima | Overlays de página completa |

**Visualización - Escala de Profundidad:**

```
┌────────────────────────────────────────────────────┐
│        SOMBRAS - ELEVACIÓN Y PROFUNDIDAD           │
├────────────────────────────────────────────────────┤
│                                                    │
│  Sin shadow (plano):                               │
│  ┌─────────────┐                                   │
│  │  Elemento   │  Pegado al fondo                  │
│  └─────────────┘                                   │
│                                                    │
│  shadow-sm (baja):                                 │
│    ┌─────────────┐                                 │
│    │  Elemento   │ ∙ ligeramente elevado           │
│    └─────────────┘∙                                │
│                                                    │
│  shadow-md (media): [ESTÁNDAR TARJETAS]            │
│        ┌─────────────┐                             │
│        │  Elemento   │ ∙∙ elevación visible        │
│        └─────────────┘∙∙                           │
│                                                    │
│  shadow-lg (alta): [BOTONES FLOTANTES]             │
│            ┌─────────────┐                         │
│            │  Elemento   │ ∙∙∙ muy elevado         │
│            └─────────────┘∙∙∙                      │
│                                                    │
│  shadow-xl (muy alta): [MODALES]                   │
│                ┌─────────────┐                     │
│                │  Elemento   │ ∙∙∙∙ flotante       │
│                └─────────────┘∙∙∙∙                 │
│                                                    │
│  shadow-2xl (máxima): [OVERLAYS]                   │
│                    ┌─────────────┐                 │
│                    │  Elemento   │ ∙∙∙∙∙           │
│                    └─────────────┘∙∙∙∙∙            │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Ejemplos:**

```html
<!-- Tarjeta con sombra media (estándar) -->
<div class="rounded-xl bg-white shadow-md p-6">
  <h3 class="text-lg font-semibold">Tarjeta estándar</h3>
</div>

<!-- Modal con sombra máxima -->
<div class="fixed inset-0 bg-black/30 shadow-2xl rounded-2xl">
  <h2>Modal elevado</h2>
</div>

<!-- Botón flotante con sombra alta -->
<button class="shadow-lg hover:shadow-xl transition-shadow bg-sky-600 text-white rounded-full p-4">
  ↑
</button>
```

**Patrón progresivo en componentes:**

```html
<!-- Botón: sin shadow (plano) -->
<button class="bg-sky-600 px-4 py-2 rounded-xl">
  Acción
</button>

<!-- Card: shadow-md (elevación media) -->
<div class="bg-white shadow-md rounded-xl p-6">
  Contenido
</div>

<!-- Tooltip/Popover: shadow-lg (elevación alta) -->
<div class="bg-white shadow-lg rounded-xl p-4 fixed">
  Información
</div>

<!-- Modal: shadow-2xl + overlay (máxima elevación) -->
<div class="fixed inset-0 bg-black/50 shadow-2xl flex items-center">
  <div class="bg-white rounded-2xl p-8 shadow-2xl">
    Modal
  </div>
</div>
```

### 5.2 Variables CSS de Sombra

Disponibles en `src/styles.css`:

```css
--shadow-sm:  0 1px 2px rgba(15, 23, 42, 0.05);
--shadow-md:  0 10px 30px rgba(2, 47, 64, 0.10);
--shadow-lg:  0 12px 36px rgba(2, 47, 64, 0.12);
--shadow-xl:  0 20px 60px rgba(2, 47, 64, 0.16);
--shadow-2xl: 0 32px 80px rgba(2, 47, 64, 0.20);
```

---

## 6. Componentes Base

### 6.1 Botones

**Visualización - Estados de Botones:**

```
┌──────────────────────────────────────────────────────────────┐
│                    VARIANTES DE BOTONES                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PRIMARIOS (sky-600)                                         │
│  ┌─────────────────────┐     ┌─────────────────────┐         │
│  │  Acción primaria    │  →  │  Acción primaria    │ hover   │
│  │ (sky-600)           │     │ (sky-700)           │         │
│  └─────────────────────┘     └─────────────────────┘         │
│  #0284c7                      #0369a1                        │
│                                                              │
│  SECUNDARIOS (slate-100)                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐         │
│  │  Acción secundaria  │  →  │  Acción secundaria  │ hover   │
│  │ (slate-100)         │     │ (slate-200)         │         │
│  └─────────────────────┘     └─────────────────────┘         │
│  #f1f5f9                      #e2e8f0                        │
│                                                              │
│  DESTRUCTIVOS (rose-600)                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐         │
│  │      Eliminar       │  →  │      Eliminar       │ hover   │
│  │ (rose-600)          │     │ (rose-700)          │         │
│  └─────────────────────┘     └─────────────────────┘         │
│  #e11d48                      #be123c                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Código:**

**Primario:**
```html
<button class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-150">
  Acción primaria
</button>
```

**Secundario:**
```html
<button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors duration-150">
  Acción secundaria
</button>
```

**Destructivo:**
```html
<button class="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-150">
  Eliminar
</button>
```

### 6.2 Tarjetas

**Visualización:**

```
┌──────────────────────────────────────────────┐
│                                              │
│    Historial de Sismos                       │
│                                              │
│    Se registraron 12 eventos sísmicos        │
│    en el período analizado.                  │
│                                              │
│    rounded-xl | border-slate-200             │
│    bg-white | shadow-md                      │
│                                              │
└──────────────────────────────────────────────┘
     border: 1px solid #e2e8f0 (slate-200)
     padding: 24px (p-6)
     shadow: 0 10px 30px rgba(2, 47, 64, 0.10)
     hover: shadow-lg transition
```

**Código:**

```html
<div class="rounded-xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold text-slate-900">Título</h3>
  <p class="mt-2 text-sm text-slate-600">Descripción</p>
</div>
```

### 6.3 Badges (Estados)

**Visualización:**

```
┌────────────────────────────────────────────────────┐
│            BADGES - ESTADOS Y ALERTAS              │
├────────────────────────────────────────────────────┤
│                                                    │
│  Éxito:        ┌──────────┐                        │
│                │ ✓ Activo │  green-100 (bg)       │
│                └──────────┘  green-800 (text)      │
│                                                    │
│  Advertencia:  ┌──────────────┐                    │
│                │ ⚠ Pendiente  │  yellow-100 (bg)  │
│                └──────────────┘  yellow-800 (txt)  │
│                                                    │
│  Crítico:      ┌────────────┐                      │
│                │ ⚠ Crítico  │  rose-100 (bg)      │
│                └────────────┘  rose-800 (text)     │
│                                                    │
│  Información:  ┌──────────────────┐                │
│                │ ℹ En mantenimiento│ sky-100 (bg)  │
│                └──────────────────┘  sky-800 (txt) │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Código:**

```html
<!-- Éxito -->
<span class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
  ✓ Activo
</span>

<!-- Advertencia -->
<span class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
  ⚠ Pendiente
</span>

<!-- Peligro -->
<span class="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
  ⚠ Crítico
</span>

<!-- Información -->
<span class="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
  ℹ En mantenimiento
</span>
```

---

## 7. Convenciones de Nombres (Código)

### 7.1 TypeScript/Angular

#### Interfaces y Types
```typescript
// PascalCase, descriptor + "Respuesta" o "Solicitud"
export interface SismoResumenRespuesta {
  id: number;
  magnitud: number;
  epicentro: string;
}

export interface CrearSismoSolicitud {
  magnitud: number;
  latitud: number;
  longitud: number;
}
```

#### Servicios
```typescript
// camelCase, descriptor + "Service"
export class SismoService {
  // Métodos públicos en camelCase
  obtenerUltimoSismo(): Observable<SismoResumenRespuesta> { }
  guardarSismo(solicitud: CrearSismoSolicitud): Observable<SismoRespuesta> { }
  
  // Métodos privados con prefijo underscore
  private _construirURL(endpoint: string): string { }
}
```

#### Componentes
```typescript
// PascalCase, descriptor + "Component"
// camelCase para propiedades y métodos
export class SismoMapComponent implements OnInit {
  @Input() sismos: Sismo[] = [];
  @Output() sismoSeleccionado = new EventEmitter<Sismo>();
  
  public mapa!: L.Map;
  private _markers: L.Marker[] = [];
  
  public ngOnInit(): void { }
  public marcarSismo(sismo: Sismo): void { }
  private _limpiarMarcadores(): void { }
}
```

#### Variables Locales
```typescript
// camelCase para variables regulares
const sismoActual = this.sismoService.obtenerActual();
let contador = 0;

// Prefijo $ para Observables (RxJS convention)
const sismos$ = this.sismoService.obtenerSismos();

// Prefijo _ para variables privadas/internas
private _estadoInterno: Map<string, any> = new Map();
```

### 7.2 Archivos

```
src/
├── app/
│   ├── components/
│   │   ├── sismo-map/                    # PascalCase, descriptor
│   │   │   ├── sismo-map.component.ts
│   │   │   ├── sismo-map.component.html
│   │   └── button/
│   │       └── button.component.ts
│   │
│   ├── pages/
│   │   ├── historial/
│   │   │   ├── historial.page.ts
│   │   │   ├── historial.page.html
│   │   └── sismos/
│   │       └── sismos.page.ts
│   │
│   ├── services/
│   │   ├── sismo.service.ts             # Descriptor + "service"
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   │
│   ├── interfaces/
│   │   ├── api.interfaces.ts            # Agrupar por dominio
│   │   └── auth.interfaces.ts
│   │
│   ├── guards/
│   │   ├── auth.guard.ts                # Descriptor + "guard"
│   │   └── admin.guard.ts
│   │
│   └── utils/
│       └── sismo-criterios.ts           # kebab-case para archivos utilitarios
```

---

## 8. Guía de Despliegue (Docker + Puertos)

### 8.1 Puertos Configurados

| Servicio | Puerto Interno | Puerto Externo | Propósito |
|---|---|---|---|
| **Frontend (Node.js SSR)** | 4000 | (interno) | Servidor Angular SSR |
| **nginx (Proxy)** | 80 | 4200 | Acceso público al sitio |
| **Backend (Spring Boot)** | 8080 | (configurar) | API REST |

**Diagrama de comunicación:**

```
Usuario (navegador)
    ↓ :4200
nginx (reverse proxy)
    ├─→ :4000 (SSR frontend) — renderizado en servidor
    └─→ :8080 (backend API) — peticiones /api/
```

### 8.2 Dockerfile (Node.js SSR)

**Etapa 1: Dependencias**
```dockerfile
FROM node:20.19.0-alpine AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile
```

**Etapa 2: Build**
```dockerfile
FROM node:20.19.0-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build --configuration=production
```

**Etapa 3: Runtime (Node.js SSR)**
```dockerfile
FROM node:20.19.0-alpine AS runtime
RUN apk add --no-cache wget
WORKDIR /app
COPY --from=build /app/dist/sismo-frontend ./dist/sismo-frontend
EXPOSE 4000
ENV PORT=4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:4000/ || exit 1
CMD ["node", "dist/sismo-frontend/server/server.mjs"]
```

### 8.3 docker-compose.yml

**Servicios:**

```yaml
services:
  # Frontend: Node.js SSR en puerto 4000 (interno)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    image: sismo-frontend:local
    container_name: sismo-frontend
    expose:
      - "4000"
    environment:
      - PORT=4000
      - SSR_API_URL=http://app:8080  # URL del backend en contenedor
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
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
    networks:
      - frontend

  # nginx: Proxy inverso en puerto 4200 (público)
  nginx:
    image: nginx:1.27-alpine
    container_name: sismo-nginx
    ports:
      - "4200:80"  # Acceso público en :4200
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      frontend:
        condition: service_healthy
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /var/cache/nginx:uid=101,gid=101
      - /var/run:uid=101,gid=101
      - /tmp:uid=101,gid=101
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 128M
    networks:
      - frontend

networks:
  frontend:
    driver: bridge
```

### 8.4 Variables de Entorno

```bash
# .env.production (para servidor SSR)
PORT=4000
SSR_API_URL=http://app:8080          # URL interna en contenedor
NODE_ENV=production
```

### 8.5 Cambios Necesarios en Producción

Si despliegas en producción con dominio personalizado:

**1. Actualizar `angular.json`:**
```json
"security": {
  "allowedHosts": ["localhost", "tu-dominio.com", "sismologia.ice.go.cr"]
}
```

**2. Actualizar `docker-compose.yml`:**
```yaml
environment:
  - SSR_API_URL=http://backend-service:8080  # Cambiar según tu red
```

**3. Verificar `nginx.conf`:**
```nginx
upstream backend {
  server app:8080;  # Cambiar nombre del servicio si corresponde
}
upstream ssr {
  server frontend:4000;  # Cambiar si renombras servicio
}
```

---

## 9. Checklist de Implementación

Al crear nuevos componentes o páginas, verificar:

- [ ] **Colores**: Usar solo paleta Tailwind (sky, rose, slate, green)
- [ ] **Tipografía**: Escala correcta (text-xs a text-4xl), pesos (400, 600, 700)
- [ ] **Espaciado**: Usar escala Tailwind (múltiplos de 4px)
- [ ] **Bordes**: Usar `rounded-xl` (botones/tarjetas) o `rounded-2xl` (modales)
- [ ] **Sombras**: Progresiva según elevación (shadow-md para tarjetas)
- [ ] **Nombres**: PascalCase componentes, camelCase métodos/propiedades
- [ ] **Responsive**: Mobile-first con `sm:` y `lg:` breakpoints
- [ ] **Accesibilidad**: `aria-label`, `role`, `aria-modal` en interactivos
- [ ] **Docker**: Validar healthchecks, variables de entorno

---

## 10. Recursos Rápidos

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Tailwind Color Palette**: https://tailwindcss.com/docs/customizing-colors
- **Angular Docs**: https://angular.io/docs
- **Proyecto CONTEXT**: Ver CLAUDE.md para arquitectura
- **Especificaciones de Despliegue**: Ver DEPLOY-SSR.md

---

**Última actualización**: 2026-05-25  
**Responsable**: Equipo de Desarrollo SISMO Frontend  
**Versión**: 1.0 — Design System Completo
