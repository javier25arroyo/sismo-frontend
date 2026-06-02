# Sismos Magnitude Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the dark magnitude banner beside the seismic map on desktop, keep it below the map on smaller screens, and remove the previous sidebar cards.

**Architecture:** Keep the change local to the sismos page template. Reuse the existing dark banner inside the main responsive grid and add a source-level template regression test so Leaflet does not need to initialize in the test environment.

**Tech Stack:** Angular 21 standalone templates, Tailwind CSS 4 utility classes, Vitest through Angular CLI.

---

### Task 1: Lock the responsive layout contract

**Files:**
- Create: `src/app/pages/sismos/sismos.page.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('SismosPage template', () => {
  const template = readFileSync(
    join(process.cwd(), 'src/app/pages/sismos/sismos.page.html'),
    'utf8'
  );

  it('muestra el banner de magnitud como panel lateral responsive y elimina las tarjetas anteriores', () => {
    expect(template).toContain(
      "[ngClass]=\"ultimoSismo() ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1'\""
    );
    expect(template).toContain('MAGNITUD MOMENTÁNEA + DATOS — panel lateral');
    expect(template).not.toContain('SIDEBAR — Estado de ubicación');
    expect(template).not.toContain('Quick info strip');
    expect(template).not.toContain('MAGNITUD MOMENTÁNEA + DATOS (full-width, bottom)');
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts`

Expected: FAIL because the template still contains the old sidebar and bottom-banner markers.

### Task 2: Move the magnitude banner into the main grid

**Files:**
- Modify: `src/app/pages/sismos/sismos.page.html`

- [ ] **Step 1: Replace the main map/sidebar composition**

Keep the existing map card as the first child. Change the main grid opening tag to:

```html
<section
  *ngIf="!cargando()"
  class="grid gap-5"
  [ngClass]="ultimoSismo() ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1'">
```

Remove the current location-status and quick-info `<aside>`. Move the existing dark magnitude section into the grid as its second child, update its marker comment to `MAGNITUD MOMENTÁNEA + DATOS — panel lateral`, and make its inner composition vertical:

```html
<section *ngIf="ultimoSismo()" class="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8 lg:h-full lg:p-6">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15),transparent_60%)]"></div>
  <div class="relative flex h-full flex-col">
    <div>
      <div class="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-sky-400">
        <span class="relative inline-flex h-1.5 w-1.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400"></span>
        </span>
        Magnitud momento
      </div>
      <div class="mt-5 flex items-baseline gap-3">
        <span class="text-7xl font-black leading-none tracking-tight tabular-nums sm:text-8xl lg:text-7xl"
          [style.color]="magnitudColor()">
          {{ ultimoSismo()!.magnitud | number:'1.1-1' }}
        </span>
        <span class="text-2xl font-black text-slate-400">Mw</span>
      </div>
      <p class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <i-lucide [img]="shieldIcon" size="12" class="text-green-400"></i-lucide>
        Verificado por estaciones de control
      </p>
    </div>
    <div class="mt-6 grid grid-cols-2 gap-5 border-t border-white/10 pt-6">
      <div>
        <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          <i-lucide [img]="mapPinIcon" size="11"></i-lucide>
          Latitud
        </div>
        <p class="mt-2 font-mono text-xl font-black tabular-nums text-white">
          {{ ultimoSismo()!.coordenadaY | number:'1.3-3' }}°
        </p>
        <p class="mt-0.5 text-xs text-slate-400">Norte</p>
      </div>
      <div>
        <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          <i-lucide [img]="mapPinIcon" size="11"></i-lucide>
          Longitud
        </div>
        <p class="mt-2 font-mono text-xl font-black tabular-nums text-white">
          {{ ultimoSismo()!.coordenadaX | number:'1.3-3' }}°
        </p>
        <p class="mt-0.5 text-xs text-slate-400">Oeste</p>
      </div>
      <div>
        <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          <i-lucide [img]="navIcon" size="11"></i-lucide>
          Profundidad
        </div>
        <p class="mt-2 text-xl font-black tabular-nums text-white">
          {{ ultimoSismo()!.profundidad }} <span class="text-sm font-semibold text-slate-400">km</span>
        </p>
        <p class="mt-0.5 text-xs text-slate-400">Hipocentro</p>
      </div>
      <div>
        <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          <i-lucide [img]="clockIcon" size="11"></i-lucide>
          Hora local
        </div>
        <p class="mt-2 font-mono text-sm font-black tabular-nums text-white">
          {{ ultimoSismo()!.feSismo | utcLocal:'HH:mm:ss' }}
        </p>
        <p class="mt-0.5 font-mono text-xs text-slate-400">{{ ultimoSismo()!.feSismo | utcLocal:'dd MMM yyyy' }}</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Run the focused test to verify it passes**

Run: `pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts`

Expected: PASS.

- [ ] **Step 3: Run lint and build**

Run: `pnpm lint`

Expected: PASS with no ESLint errors.

Run: `pnpm build`

Expected: PASS with Angular browser and server bundles generated.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/app/pages/sismos/sismos.page.html src/app/pages/sismos/sismos.page.spec.ts
git commit -m "feat: move sismos magnitude banner beside map"
```
