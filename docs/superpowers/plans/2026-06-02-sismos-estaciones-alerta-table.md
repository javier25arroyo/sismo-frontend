# Sismos Estaciones Alerta Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a station metrics table below the map on the sismos page, including the seismic alert level derived from station alert thresholds.

**Architecture:** Keep the feature local to `SismosPage`. Load the latest station seismic summary with `SismoService.getUltimosSismos()` and station alert thresholds with `ValorAlertaService.getAlertas()`, then expose a computed table view for the template.

**Tech Stack:** Angular 21 standalone component, signals/computed state, Tailwind CSS, Vitest via Angular CLI.

---

### Task 1: Add Table Data and Alert Calculation

**Files:**
- Modify: `src/app/pages/sismos/sismos.page.ts`
- Modify: `src/app/pages/sismos/sismos.page.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests that instantiate `SismosPage`, set sample station summary data and alert thresholds, and assert:

```typescript
expect(component.registrosEstacionesTabla()).toEqual([
  expect.objectContaining({
    nomEstacion: 'Arenal',
    codEstacion: 'A1',
    vaAceleracion: 18,
    vaDesplazamiento: 2.5,
    distanciaHipocentral: 44,
    alertaSismica: 'Nivel 2'
  })
]);
```

Also assert missing thresholds produce `Sin alerta`.

- [ ] **Step 2: Run focused test and verify failure**

Run: `pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts`

Expected: FAIL because `registrosEstacionesTabla`, station summary state, and alert-threshold state do not exist.

- [ ] **Step 3: Implement data state**

In `SismosPage`, import `Sismo` from `../../interfaces/sismo.interface`, `ValorAlertaEstacionRespuesta` from `../../interfaces/api.interfaces`, and `ValorAlertaService` from `../../services/valor-alerta.service`.

Add:

```typescript
registrosEstaciones = signal<Sismo[]>([]);
valoresAlerta = signal<ValorAlertaEstacionRespuesta[]>([]);
```

Inject `private valorAlertaService: ValorAlertaService` in the constructor.

Add `void this.cargarRegistrosEstaciones();` inside `ngOnInit()`.

Implement:

```typescript
private async cargarRegistrosEstaciones(): Promise<void> {
  try {
    const [registros, alertas] = await Promise.all([
      this.sismoService.getUltimosSismos(100),
      this.valorAlertaService.getAlertas({ page: 0, size: 500 })
    ]);
    this.registrosEstaciones.set(registros);
    this.valoresAlerta.set(alertas.content);
  } catch {
    this.registrosEstaciones.set([]);
    this.valoresAlerta.set([]);
  }
}
```

Add computed view:

```typescript
readonly registrosEstacionesTabla = computed(() =>
  this.registrosEstaciones().map(registro => ({
    ...registro,
    alertaSismica: this.obtenerAlertaSismica(registro)
  }))
);
```

Add public helper:

```typescript
obtenerAlertaSismica(registro: Pick<Sismo, 'codCentroPrd' | 'codEstacion' | 'vaAceleracion'>): string {
  const aceleracion = registro.vaAceleracion;
  if (typeof aceleracion !== 'number' || !Number.isFinite(aceleracion)) return 'Sin alerta';

  const alerta = this.valoresAlerta().find(valor =>
    valor.codEstacion === registro.codEstacion &&
    (!registro.codCentroPrd || valor.codCentroPrd === registro.codCentroPrd)
  );
  if (!alerta) return 'Sin alerta';

  const niveles = [
    { etiqueta: 'Nivel 3', valor: alerta.nivel3 },
    { etiqueta: 'Nivel 2', valor: alerta.nivel2 },
    { etiqueta: 'Nivel 1', valor: alerta.nivel1 },
    { etiqueta: 'Nivel 0', valor: alerta.nivel0 }
  ];

  return niveles.find(nivel =>
    typeof nivel.valor === 'number' &&
    Number.isFinite(nivel.valor) &&
    aceleracion >= nivel.valor
  )?.etiqueta ?? 'Sin alerta';
}
```

- [ ] **Step 4: Run focused test and verify pass**

Run: `pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts`

Expected: PASS.

### Task 2: Render the Responsive Table

**Files:**
- Modify: `src/app/pages/sismos/sismos.page.html`
- Modify: `src/app/pages/sismos/sismos.page.spec.ts`

- [ ] **Step 1: Add failing template assertions**

Extend the template test to assert the table contains:

```typescript
expect(template).toContain('table-estaciones-alerta-title');
expect(template).toContain('Resumen acelerográfico por estación');
expect(template).toContain('<caption class="sr-only">Resumen acelerográfico por estación del último sismo</caption>');
expect(template).toContain('Aceleración (cm/ss)');
expect(template).toContain('Alerta Sísmica');
expect(template).toContain('registrosEstacionesTabla()');
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts`

Expected: FAIL because the table is not rendered yet.

- [ ] **Step 3: Add table below the map section**

Insert after the map/banner section:

```html
<section *ngIf="!cargando()" class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-labelledby="table-estaciones-alerta-title">
  <div class="border-b border-slate-100 px-5 py-4">
    <h2 id="table-estaciones-alerta-title" class="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">
      Resumen acelerográfico por estación
    </h2>
    <p class="mt-1 text-xs text-slate-600">{{ registrosEstacionesTabla().length }} estaciones con datos del evento reciente</p>
  </div>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[900px] border-collapse text-xs sm:text-sm">
      <caption class="sr-only">Resumen acelerográfico por estación del último sismo</caption>
      <thead class="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
        <tr class="border-b border-slate-200">
          <th scope="col" class="px-4 py-3 text-left">Nombre</th>
          <th scope="col" class="px-4 py-3 text-left">Código Estación</th>
          <th scope="col" class="px-4 py-3 text-right">Aceleración (cm/ss)</th>
          <th scope="col" class="px-4 py-3 text-right">Desplazamiento (cm)</th>
          <th scope="col" class="px-4 py-3 text-right">Distancia Hipocentral (km)</th>
          <th scope="col" class="px-4 py-3 text-left">Alerta Sísmica</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        @for (registro of registrosEstacionesTabla(); track (registro.codCentroPrd ?? '') + registro.codEstacion + registro.feSismo) {
          <tr class="transition hover:bg-sky-50/40">
            <td class="px-4 py-3 font-semibold text-slate-800">{{ registro.nomEstacion || 'Sin nombre' }}</td>
            <td class="px-4 py-3 font-mono text-xs font-bold text-sky-700">{{ registro.codEstacion || 'N/D' }}</td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{{ registro.vaAceleracion !== undefined ? (registro.vaAceleracion | number:'1.3-3') : 'N/D' }}</td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{{ registro.vaDesplazamiento !== undefined ? (registro.vaDesplazamiento | number:'1.3-3') : 'N/D' }}</td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{{ registro.distanciaHipocentral !== null && registro.distanciaHipocentral !== undefined ? (registro.distanciaHipocentral | number:'1.2-2') : 'N/D' }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                {{ registro.alertaSismica }}
              </span>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="6" class="px-4 py-8 text-center text-sm font-semibold text-slate-600">Sin registros acelerográficos para mostrar.</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</section>
```

- [ ] **Step 4: Run focused test, suite, lint, and build**

Run:

```bash
pnpm test --watch=false --include src/app/pages/sismos/sismos.page.spec.ts
pnpm test --watch=false
pnpm lint
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sismos/sismos.page.ts src/app/pages/sismos/sismos.page.html src/app/pages/sismos/sismos.page.spec.ts
git commit -m "feat: add sismos station alert table"
```
