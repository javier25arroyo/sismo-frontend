import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { ScatterChartComponent, ScatterDato } from '../../components/scatter-chart/scatter-chart.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { HistorialSismoService } from '../../services/historial-sismo.service';
import { HistorialRsnService } from '../../services/historial-rsn.service';
import { CentroService } from '../../services/centro.service';
import {
  CentroProduccionRespuesta,
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

  tab = signal<'acelerografos' | 'rsn'>('acelerografos');

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

  setAnio(valor: string): void {
    this.anioSeleccionado.set(valor ? Number(valor) : null);
  }

  setPlanta(codigo: string): void {
    const centro = this.centros().find(c => c.codCentroPrd === codigo) ?? null;
    this.plantaSeleccionada.set(centro);
  }

  async buscar(): Promise<void> {
    await this.cargarCentrosSiNecesario();
    if (this.tab() === 'acelerografos') {
      await this.buscarHistorial();
    } else {
      await this.buscarRsn();
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

  get historialPagina(): HistorialSismoRespuesta[] {
    const inicio = (this.paginaHistorial() - 1) * this.pageSizeHistorial;
    return this.historialDatos().slice(inicio, inicio + this.pageSizeHistorial);
  }

  get historialTotalPaginas(): number {
    return Math.max(1, Math.ceil(this.historialDatos().length / this.pageSizeHistorial));
  }

  cambiarPaginaHistorial(p: number): void {
    this.paginaHistorial.set(p);
  }

  // ── Paginación RSN ────────────────────────────────────────────

  get rsnPagina(): HistorialRsnRespuesta[] {
    const inicio = (this.paginaRsn() - 1) * this.pageSizeRsn;
    return this.rsnDatos().slice(inicio, inicio + this.pageSizeRsn);
  }

  get rsnTotalPaginas(): number {
    return Math.max(1, Math.ceil(this.rsnDatos().length / this.pageSizeRsn));
  }

  cambiarPaginaRsn(p: number): void {
    this.paginaRsn.set(p);
  }

  // ── Mapa ─────────────────────────────────────────────────────

  get sismosMapaAcel(): SismoResumenRespuesta[] {
    const vistos = new Set<string>();
    return this.historialDatos()
      .filter(h => {
        if (vistos.has(h.feSismo)) return false;
        vistos.add(h.feSismo);
        return true;
      })
      .map(h => this.toSismoResumen(h));
  }

  get sismosMapaRsn(): SismoResumenRespuesta[] {
    return this.rsnDatos().map(r => ({
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
      coordenadaY: r.coordenadaY
    }));
  }

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
      coordenadaY:  h.coordenadaY
    };
  }

  // ── Datos para gráficas ───────────────────────────────────────

  private eventosAgregadosAcel(): EventoAgregado[] {
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
  }

  get chartMagnitudDistanciaAcel(): ScatterDato[] {
    return this.eventosAgregadosAcel().map(e => ({ x: e.distanciaEpicentral, y: e.magnitud }));
  }

  get chartMagnitudProfundidadAcel(): ScatterDato[] {
    return this.eventosAgregadosAcel().map(e => ({ x: e.profundidad, y: e.magnitud }));
  }

  get chartAcelMagnitud(): ScatterDato[] {
    return this.eventosAgregadosAcel().map(e => ({ x: e.vaAceleracion, y: e.magnitud }));
  }

  get chartAcelDistancia(): ScatterDato[] {
    return this.eventosAgregadosAcel().map(e => ({ x: e.vaAceleracion, y: e.distanciaHipocentral }));
  }

  get chartMagnitudDistanciaRsn(): ScatterDato[] {
    return this.rsnDatos().map(r => ({ x: r.distanciaEpicentral ?? 0, y: r.magnitud }));
  }

  get chartMagnitudProfundidadRsn(): ScatterDato[] {
    return this.rsnDatos().map(r => ({ x: r.profundidad, y: r.magnitud }));
  }

  // ── Helpers UI ────────────────────────────────────────────────

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const utc = /[Z+\-]\d*$/.test(fecha.trim()) ? fecha : fecha + 'Z';
    return new Date(utc).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatTipoSismo(tipo: string | null): string {
    if (!tipo) return '';
    // NFD descompone; elimina marcas combinadas duplicadas (backend bug: Ó + U+0301 extra);
    // NFC recompone limpio antes del title-case.
    return tipo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]{2,}/g, m => m[0])
      .normalize('NFC')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  colorMagnitud(m: number): string {
    if (m >= 6.0) return '#ef4444';
    if (m >= 5.0) return '#f97316';
    if (m >= 4.0) return '#eab308';
    return '#94a3b8';
  }

  get tituloResultado(): string {
    const planta = this.plantaSeleccionada()?.nomCentroPrd ?? 'todas las plantas';
    const anio   = this.anioSeleccionado() ?? 'todos los años';
    return this.tab() === 'acelerografos'
      ? `Registro de sismos para ${planta} durante ${anio}`
      : `Eventos RSN para ${planta} durante ${anio}`;
  }
}
