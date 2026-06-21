import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = (path: string): string => readFileSync(join(process.cwd(), path), 'utf8');

describe('performance regressions', () => {
  it('carga Chart.js de forma diferida y actualiza el grafico sin reconstruirlo', () => {
    const component = source('src/app/components/scatter-chart/scatter-chart.component.ts');

    expect(component).not.toContain("from 'chart.js'");
    expect(component).toContain("import('chart.js')");
    expect(component).toContain("this.chart.update('none')");
  });

  it('no carga catalogos pesados de consultas al entrar a la ruta', () => {
    const page = source('src/app/pages/consultas/consultas.page.ts');
    const template = source('src/app/pages/consultas/consultas.page.html');

    expect(page).not.toContain('implements OnInit');
    expect(page).toContain('cargarEstacionesSiNecesario');
    expect(template).toContain('[estaciones]="estacionesMapa()"');
  });

  it('usa OnPush en pantallas operativas con listas, formularios o polling', () => {
    const files = [
      'src/app/pages/repositorio/repositorio.page.ts',
      'src/app/pages/umbrales-estaciones/umbrales-estaciones.page.ts',
      'src/app/pages/profile/profile.page.ts',
      'src/app/pages/login/login.page.ts'
    ];

    for (const file of files) {
      expect(source(file)).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
    }
  });

  it('carga las generaciones del repositorio solo cuando el usuario abre ese tab', () => {
    const page = source('src/app/pages/repositorio/repositorio.page.ts');
    const ngOnInitBlock = page.match(/ngOnInit\(\): void \{[\s\S]*?\n\s{2}\}/)?.[0] ?? '';

    expect(ngOnInitBlock).toContain('this.cargarReportes()');
    expect(ngOnInitBlock).not.toContain('this.cargarGeneraciones()');
    expect(page).toContain("if (t === 'generar' && !this.generacionesCargadas())");
  });

  it('escapa textos de API antes de insertarlos en popups de Leaflet', () => {
    const component = source('src/app/components/sismo-map/sismo-map.component.ts');

    expect(component).toContain('private escapeHtml');
    expect(component).toContain('const ubicacion = this.escapeHtml');
    expect(component).toContain('const fuente = sismo.fuente ? this.escapeHtml');
    expect(component).toContain('const nomEstacion = this.escapeHtml');
  });

  it('carga Leaflet en el mapa de sismos solo en el navegador', () => {
    const component = source('src/app/components/sismo-map/sismo-map.component.ts');
    const miniMap = source('src/app/components/estacion-mini-map/estacion-mini-map.component.ts');

    expect(component).not.toMatch(/import\s+\*\s+as\s+L\s+from\s+['"]leaflet['"]/);
    expect(component).toContain("import type * as Leaflet from 'leaflet'");
    expect(component).toContain("await import('leaflet')");
    expect(miniMap).not.toMatch(/import\s+\*\s+as\s+L\s+from\s+['"]leaflet['"]/);
    expect(miniMap).toContain("import type * as Leaflet from 'leaflet'");
    expect(miniMap).toContain("await import('leaflet')");
  });

  it('centraliza la politica SSR de las rutas con mapas', () => {
    const policy = source('src/app/routing/server-render-policy.ts');
    const routes = source('src/app/app.routes.server.ts');

    expect(policy).toContain('MAP_ROUTE_PATHS');
    expect(policy).toContain('AUTH_ROUTE_PATHS');
    expect(policy).toContain('ADMIN_ROUTE_PATHS');

    for (const path of ['sismos', 'historial', 'estaciones', 'consultas']) {
      expect(routes).toContain(`serverRoute('${path}')`);
    }
  });

  it('sirve el SSR con compresion HTTP para recursos textuales', () => {
    const server = source('src/server.ts');

    expect(server).toContain("import compression from 'compression'");
    expect(server).toContain('app.use(compression())');
  });

  it('difiere el preload de rutas no criticas hasta que el navegador este libre', () => {
    const strategy = source('src/app/services/selective-preloading.strategy.ts');

    expect(strategy).toContain('requestIdleCallback');
    expect(strategy).toContain('}, 6000)');
  });

  it('expone llms.txt con titulo y enlaces recomendados', () => {
    const llms = source('public/llms.txt');

    expect(llms).toContain('# Sismologia ICE');
    expect(llms).toContain('[Inicio](/)');
    expect(llms).toContain('[Sismos recientes](/sismos)');
  });

  it('no anima el router outlet durante la primera pintura', () => {
    const config = source('src/app/app.config.ts');
    const layout = source('src/app/components/main-layout/main-layout.component.html');

    expect(config).not.toContain('provideAnimationsAsync');
    expect(config).not.toContain('withEventReplay');
    expect(layout).not.toContain('@routeAnimation');
  });

  it('mantiene fallback SSR estable para los mapas y sus estilos', () => {
    const sismoTemplate = source('src/app/components/sismo-map/sismo-map.component.html');
    const sismoStyles = source('src/app/components/sismo-map/sismo-map.component.css');
    const miniMap = source('src/app/components/estacion-mini-map/estacion-mini-map.component.ts');
    const miniMapStyles = source('src/app/components/estacion-mini-map/estacion-mini-map.component.css');

    expect(sismoTemplate).toContain('mapStatus() !== \'ready\'');
    expect(sismoTemplate).toContain('sismo-map-fallback');
    expect(sismoStyles).toContain('.sismo-map-fallback');
    expect(miniMap).toContain('mapStatus() !== \'ready\'');
    expect(miniMap).toContain('estacion-mini-map-fallback');
    expect(miniMapStyles).toContain('.estacion-mini-map-fallback');
  });

  it('mantiene los assets publicos de Leaflet y la configuracion de public assets', () => {
    const angularConfig = source('angular.json');
    const base = join(process.cwd(), 'public', 'leaflet');

    expect(angularConfig).toContain('"input": "public"');
    expect(existsSync(join(base, 'marker-icon.png'))).toBe(true);
    expect(existsSync(join(base, 'marker-icon-2x.png'))).toBe(true);
    expect(existsSync(join(base, 'marker-shadow.png'))).toBe(true);
  });
});
