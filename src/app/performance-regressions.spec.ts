import { readFileSync } from 'node:fs';
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
});
