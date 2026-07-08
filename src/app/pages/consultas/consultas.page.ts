import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { ScatterChartComponent, ScatterDato } from '../../components/scatter-chart/scatter-chart.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { HistorialSismoService } from '../../services/historial-sismo.service';
import { HistorialRsnService } from '../../services/historial-rsn.service';
import { CentroService } from '../../services/centro.service';
import {
  CentroProduccionRespuesta,
  EstacionRespuesta,
  HistorialSismoRespuesta,
  HistorialRsnRespuesta
} from '../../interfaces/api.interfaces';
import { SismoResumenRespuesta } from '../../interfaces/api.interfaces';
import { Download, Search, LucideAngularModule } from 'lucide-angular';

interface EventoAgregado {
  feSismo: string;
  coordenadaX: number;
  coordenadaY: number;
  magnitud: number;
  profundidad: number;
  distanciaHipocentral: number;
  distanciaEpicentral: number;
  vaAceleracion: number;
  vaDesplazamiento: number;
}

@Component({
  standalone: true,
  selector: 'app-consultas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SismoMapComponent,
    ScatterChartComponent,
    PaginacionComponent,
    LucideAngularModule
  ],
  templateUrl: './consultas.page.html'
})
export class ConsultasPage {
  readonly downloadIcon = Download;
  readonly searchIcon   = Search;

  private readonly tabs: ('acelerografos' | 'rsn')[] = ['acelerografos', 'rsn'];
  tab = signal<'acelerografos' | 'rsn'>('acelerografos');

  estaciones = signal<EstacionRespuesta[]>([]);
  estacionesCargadas = signal(false);
  cargandoEstaciones = signal(false);

  centros = signal<CentroProduccionRespuesta[]>([]);
  centrosCargados = signal(false);
  cargandoCentros = signal(false);

  anioSeleccionado = signal<number | null>(null);
  plantaSeleccionada = signal<CentroProduccionRespuesta | null>(null);

  // ── Acelerógrafos ─────────────────────────────────────────────
  historialDatos = signal<HistorialSismoRespuesta[]>([]);
  cargandoHistorial = signal(false);
  errorHistorial = signal('');
  hasBuscadoAcel = signal(false);
  paginaHistorial = signal(1);
  readonly pageSizeHistorial = 10;

  // ── RSN ───────────────────────────────────────────────────────
  rsnDatos = signal<HistorialRsnRespuesta[]>([]);
  cargandoRsn = signal(false);
  errorRsn = signal('');
  hasBuscadoRsn = signal(false);
  paginaRsn = signal(1);
  readonly pageSizeRsn = 10;

  readonly anos: number[] = (() => {
    const anioActual = new Date().getFullYear();
    const anos: number[] = [];
    for (let a = anioActual; a >= 2018; a--) anos.push(a);
    return anos;
  })();

  constructor(
    private historialSismoService: HistorialSismoService,
    private historialRsnService: HistorialRsnService,
    private centroService: CentroService
  ) {}

  async cargarEstacionesSiNecesario(): Promise<void> {
    if (this.estacionesCargadas() || this.cargandoEstaciones()) return;
    this.cargandoEstaciones.set(true);
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      this.estaciones.set(page.content);
      this.estacionesCargadas.set(true);
    } catch {
      this.estaciones.set([]);
    } finally {
      this.cargandoEstaciones.set(false);
    }
  }

  async cargarCentrosSiNecesario(): Promise<void> {
    if (this.centrosCargados() || this.cargandoCentros()) return;
    this.cargandoCentros.set(true);
    try {
      const res = await this.centroService.getCentros(undefined, undefined, 0, 200);
      this.centros.set(res.content);
      this.centrosCargados.set(true);
    } catch {
      this.centros.set([]);
    } finally {
      this.cargandoCentros.set(false);
    }
  }

  setTab(t: 'acelerografos' | 'rsn'): void {
    this.tab.set(t);
  }

  onTabKeydown(event: KeyboardEvent, currentTab: 'acelerografos' | 'rsn'): void {
    let nextTab: 'acelerografos' | 'rsn' | null = null;
    const currentIndex = this.tabs.indexOf(currentTab);

    if (event.key === 'ArrowRight') {
      nextTab = this.tabs[(currentIndex + 1) % this.tabs.length];
    } else if (event.key === 'ArrowLeft') {
      nextTab = this.tabs[(currentIndex - 1 + this.tabs.length) % this.tabs.length];
    } else if (event.key === 'Home') {
      nextTab = this.tabs[0];
    } else if (event.key === 'End') {
      nextTab = this.tabs[this.tabs.length - 1];
    }

    if (!nextTab) return;

    event.preventDefault();
    this.setTab(nextTab);
    document.getElementById(`tab-${nextTab}`)?.focus();
  }

  setAnio(valor: string): void {
    this.anioSeleccionado.set(valor ? Number(valor) : null);
  }

  setPlanta(codigo: string): void {
    const centro = this.centros().find(c => c.codCentroPrd === codigo) ?? null;
    this.plantaSeleccionada.set(centro);
  }

  async buscar(): Promise<void> {
    await this.cargarCentrosSiNecesario();
    const estacionesPromise = this.cargarEstacionesSiNecesario();
    if (this.tab() === 'acelerografos') {
      await Promise.all([this.buscarHistorial(), estacionesPromise]);
    } else {
      await Promise.all([this.buscarRsn(), estacionesPromise]);
    }
  }

  private async buscarHistorial(): Promise<void> {
    this.cargandoHistorial.set(true);
    this.errorHistorial.set('');
    this.hasBuscadoAcel.set(true);
    this.paginaHistorial.set(1);
    try {
      const planta = this.plantaSeleccionada()?.nomCentroPrd;
      const anio   = this.anioSeleccionado() ?? undefined;
      const datos  = await this.historialSismoService.getHistorial(planta, anio);
      this.historialDatos.set(datos);
    } catch (err) {
      this.errorHistorial.set((err as Error).message ?? 'Error al cargar datos');
      this.historialDatos.set([]);
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  private async buscarRsn(): Promise<void> {
    this.cargandoRsn.set(true);
    this.errorRsn.set('');
    this.hasBuscadoRsn.set(true);
    this.paginaRsn.set(1);
    try {
      const planta = this.plantaSeleccionada()?.nomCentroPrd;
      const anio   = this.anioSeleccionado() ?? undefined;
      const datos  = await this.historialRsnService.getHistorialRsn(planta, anio);
      this.rsnDatos.set(datos);
    } catch (err) {
      this.errorRsn.set((err as Error).message ?? 'Error al cargar datos RSN');
      this.rsnDatos.set([]);
    } finally {
      this.cargandoRsn.set(false);
    }
  }

  async exportarCsv(): Promise<void> {
    try {
      const planta = this.plantaSeleccionada()?.nomCentroPrd;
      const anio   = this.anioSeleccionado() ?? undefined;
      const { blob, filename } = await this.historialSismoService.descargarCsv(planta, anio);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silenciar errores de descarga */ }
  }

  // ── Paginación Acelerógrafos ───────────────────────────────────

  readonly historialPagina = computed((): HistorialSismoRespuesta[] => {
    const inicio = (this.paginaHistorial() - 1) * this.pageSizeHistorial;
    return this.historialDatos().slice(inicio, inicio + this.pageSizeHistorial);
  });

  readonly historialTotalPaginas = computed((): number =>
    Math.max(1, Math.ceil(this.historialDatos().length / this.pageSizeHistorial))
  );

  cambiarPaginaHistorial(p: number): void {
    this.paginaHistorial.set(p);
  }

  // ── Paginación RSN ────────────────────────────────────────────

  readonly rsnPagina = computed((): HistorialRsnRespuesta[] => {
    const inicio = (this.paginaRsn() - 1) * this.pageSizeRsn;
    return this.rsnDatos().slice(inicio, inicio + this.pageSizeRsn);
  });

  readonly rsnTotalPaginas = computed((): number =>
    Math.max(1, Math.ceil(this.rsnDatos().length / this.pageSizeRsn))
  );

  cambiarPaginaRsn(p: number): void {
    this.paginaRsn.set(p);
  }

  // ── Mapa ─────────────────────────────────────────────────────

  readonly estacionesMapa = computed((): EstacionRespuesta[] =>
    this.estacionesCargadas() ? this.estaciones() : []
  );

  readonly sismosMapaAcel = computed((): SismoResumenRespuesta[] => {
    const eventosPorSismo = new Map<string, HistorialSismoRespuesta>();

    for (const h of this.historialDatos()) {
      const actual = eventosPorSismo.get(h.feSismo);
      if (!actual || this.distanciaParaOrden(h.distanciaHipocentral) < this.distanciaParaOrden(actual.distanciaHipocentral)) {
        eventosPorSismo.set(h.feSismo, h);
      }
    }

    return Array.from(eventosPorSismo.values())
      .map(h => this.toSismoResumen(h));
  });

  readonly sismosMapaRsn = computed((): SismoResumenRespuesta[] =>
    this.rsnDatos().map(r => ({
      codCentroPrd: '',
      nomCentroPrd: r.nombre,
      codEstacion: '',
      nomEstacion: '',
      feDato: r.feSismo,
      feSismo: r.feSismo,
      magnitud: r.magnitud,
      profundidad: r.profundidad,
      ubicacion: r.ubicacion,
      coordenadaX: r.coordenadaX,
      coordenadaY: r.coordenadaY,
      distanciaHipocentral: r.distanciaHipocentral,
      distanciaEpicentral: r.distanciaEpicentral
    }))
  );

  private toSismoResumen(h: HistorialSismoRespuesta): SismoResumenRespuesta {
    return {
      codCentroPrd: h.codCentroPrd,
      nomCentroPrd: h.nomCentroPrd,
      codEstacion:  h.codEstacion,
      nomEstacion:  h.nomEstacion,
      feDato:       h.feDato,
      vaAceleracion: h.vaAceleracion ?? undefined,
      vaDesplazamiento: h.vaDesplazamiento ?? undefined,
      feSismo:      h.feSismo,
      magnitud:     h.magnitud,
      profundidad:  h.profundidad,
      ubicacion:    h.ubicacion,
      coordenadaX:  h.coordenadaX,
      coordenadaY:  h.coordenadaY,
      distanciaHipocentral: h.distanciaHipocentral,
      distanciaEpicentral:  h.distanciaEpicentral
    };
  }

  private distanciaParaOrden(distancia: number | null): number {
    return typeof distancia === 'number' && Number.isFinite(distancia) ? distancia : Number.POSITIVE_INFINITY;
  }

  // ── Datos para gráficas ───────────────────────────────────────

  private readonly eventosAgregadosAcel = computed((): EventoAgregado[] => {
    const map = new Map<string, EventoAgregado>();
    for (const d of this.historialDatos()) {
      if (!map.has(d.feSismo)) {
        map.set(d.feSismo, {
          feSismo: d.feSismo,
          coordenadaX: d.coordenadaX,
          coordenadaY: d.coordenadaY,
          magnitud: d.magnitud,
          profundidad: d.profundidad,
          distanciaHipocentral: d.distanciaHipocentral ?? 0,
          distanciaEpicentral: d.distanciaEpicentral ?? 0,
          vaAceleracion: d.vaAceleracion ?? 0,
          vaDesplazamiento: d.vaDesplazamiento ?? 0
        });
      } else {
        const e = map.get(d.feSismo)!;
        e.distanciaHipocentral = Math.max(e.distanciaHipocentral, d.distanciaHipocentral ?? 0);
        e.distanciaEpicentral  = Math.max(e.distanciaEpicentral, d.distanciaEpicentral ?? 0);
        e.vaAceleracion        = Math.max(e.vaAceleracion, d.vaAceleracion ?? 0);
        e.vaDesplazamiento     = Math.max(e.vaDesplazamiento, d.vaDesplazamiento ?? 0);
      }
    }
    return Array.from(map.values());
  });

  readonly chartMagnitudDistanciaAcel = computed((): ScatterDato[] =>
    this.eventosAgregadosAcel().map(e => ({ x: e.distanciaEpicentral, y: e.magnitud }))
  );

  readonly chartMagnitudProfundidadAcel = computed((): ScatterDato[] =>
    this.eventosAgregadosAcel().map(e => ({ x: e.profundidad, y: e.magnitud }))
  );

  readonly chartAcelMagnitud = computed((): ScatterDato[] =>
    this.eventosAgregadosAcel().map(e => ({ x: e.vaAceleracion, y: e.magnitud }))
  );

  readonly chartAcelDistancia = computed((): ScatterDato[] =>
    this.eventosAgregadosAcel().map(e => ({ x: e.vaAceleracion, y: e.distanciaHipocentral }))
  );

  readonly chartMagnitudDistanciaRsn = computed((): ScatterDato[] =>
    this.rsnDatos().map(r => ({ x: r.distanciaEpicentral ?? 0, y: r.magnitud }))
  );

  readonly chartMagnitudProfundidadRsn = computed((): ScatterDato[] =>
    this.rsnDatos().map(r => ({ x: r.profundidad, y: r.magnitud }))
  );

  // ── Helpers UI ────────────────────────────────────────────────

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const utc = /[Z+-]\d*$/.test(fecha.trim()) ? fecha : fecha + 'Z';
    return new Date(utc).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatTipoSismo(tipo: string | null): string {
    if (!tipo) return '';

    let text = tipo
      .trim()
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ');

    text = text.replace(/[´‘’']/g, '');

    const searchKey = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

    const categorias: [RegExp, string][] = [
      [/\bDEFORMACION\b/, 'Sismo por deformación'],
      [/\bINTERPLACA\b/, 'Subducción interplaca'],
      [/\bINTRAPLACA\b/, 'Subducción intraplaca'],
      [/\bCOCOS?\b/, 'Subducción placa del Coco'],
      [/\bCARIBE\b/, 'Subducción placa Caribe'],
      [/\bSUBDUC(CION|TIVO|TION)\b/, 'Sismo por subducción'],
      [/\bCORTEZA|CORTICAL|FALLA|TECTONIC/, 'Sismo tectónico'],
      [/\bVOLCAN|VOLCANIC|MAGMATIC/, 'Sismo volcánico'],
      [/\bLOCAL\b/, 'Sismo local'],
      [/\bREGIONAL\b/, 'Sismo regional'],
      [/\bDISTANTE|TELESISM/, 'Sismo distante']
    ];

    const categoria = categorias.find(([patron]) => patron.test(searchKey));
    if (categoria) return categoria[1];

    const lower = text.toLowerCase();
    const normalizado = lower.charAt(0).toUpperCase() + lower.slice(1);
    return normalizado.length > 28 ? `${normalizado.slice(0, 27).trimEnd()}...` : normalizado;
  }

  colorMagnitud(m: number): string {
    if (m >= 6.0) return '#ef4444';
    if (m >= 5.0) return '#f97316';
    if (m >= 4.0) return '#eab308';
    return '#94a3b8';
  }

  readonly tituloResultado = computed((): string => {
    const planta = this.plantaSeleccionada()?.nomCentroPrd ?? 'todas las plantas';
    const anio   = this.anioSeleccionado() ?? 'todos los años';
    return this.tab() === 'acelerografos'
      ? `Registro de sismos para ${planta} durante ${anio}`
      : `Eventos RSN para ${planta} durante ${anio}`;
  });
}
