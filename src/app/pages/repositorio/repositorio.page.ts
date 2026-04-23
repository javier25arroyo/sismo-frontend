import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import {
  FileDown, FileText, Search, Filter, ChevronLeft, ChevronRight,
  FilePlus2, RefreshCw, Clock, CheckCircle2, XCircle, Loader2,
  AlertTriangle, TableProperties, LucideAngularModule
} from 'lucide-angular';
import { ReporteService } from '../../services/reporte.service';
import { HistoricoService } from '../../services/historico.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  ReporteRespuesta, FiltroReportes, GeneracionReporteRespuesta
} from '../../interfaces/api.interfaces';
import { environment } from '../../../environments/environment';

type Tab = 'descargar' | 'generar' | 'csv';

type EstadoGen =
  | 'PENDIENTE' | 'EN_PROCESO' | 'PROCESANDO'
  | 'COMPLETADO' | 'EXITOSO'
  | 'ERROR' | 'FALLIDO' | 'CANCELADO';

@Component({
  standalone: true,
  selector: 'app-repositorio',
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './repositorio.page.html'
})
export class RepositorioPage implements OnInit, OnDestroy {
  private reporteService  = inject(ReporteService);
  private historicoService= inject(HistoricoService);
  private auth            = inject(AuthService);

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  tabActivo = signal<Tab>('descargar');

  // ─── Tab Descargar ────────────────────────────────────────────────────────
  reportes        = signal<ReporteRespuesta[]>([]);
  cargando        = signal(true);
  errorLista      = signal<string | null>(null);
  descargando     = signal<string | null>(null);
  mensajeDescarga = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  filtroBusqueda  = signal('');
  filtroAutor     = signal('');
  filtroDesde     = signal('');
  filtroHasta     = signal('');
  mostrarFiltros  = signal(false);

  paginaActual    = signal(0);
  totalPaginas    = signal(0);
  totalElementos  = signal(0);
  readonly PAGE_SIZE = 10;

  // ─── Tab Generar ──────────────────────────────────────────────────────────
  generaciones       = signal<GeneracionReporteRespuesta[]>([]);
  cargandoGen        = signal(false);
  enviandoGen        = signal(false);
  mensajeGen         = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  descargandoGen     = signal<string | null>(null);
  cancelarDialogId   = signal<string | null>(null);   // id a cancelar
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  // ─── Iconos ───────────────────────────────────────────────────────────────
  readonly documentIcon  = FileText;
  readonly downloadIcon  = FileDown;
  readonly searchIcon    = Search;
  readonly filterIcon    = Filter;
  readonly chevronLeft   = ChevronLeft;
  readonly chevronRight  = ChevronRight;
  readonly generateIcon  = FilePlus2;
  readonly refreshIcon   = RefreshCw;
  readonly clockIcon     = Clock;
  readonly checkIcon     = CheckCircle2;
  readonly errorIcon     = XCircle;
  readonly loadingIcon   = Loader2;
  readonly warnIcon      = AlertTriangle;
  readonly csvIcon       = TableProperties;

  // ─── Tab CSV ──────────────────────────────────────────────────────────────
  exportandoReportes  = signal(false);
  exportandoSismos    = signal(false);
  exportandoHistorico = signal(false);

  // ─── Estado "descargado" por botón CSV ───────────────────────────────────
  private _csvDescargados = signal<Set<string>>(new Set());
  csvEstaDescargado(tipo: string): boolean { return this._csvDescargados().has(tipo); }
  private marcarCsvDescargado(tipo: string): void {
    this._csvDescargados.update(s => new Set([...s, tipo]));
    setTimeout(() => this._csvDescargados.update(s => { const n = new Set(s); n.delete(tipo); return n; }), 5000);
  }

  // ─── Filas descargadas con éxito (IDs) ───────────────────────────────────
  private _descargadasExito = signal<Set<string>>(new Set());

  // Filtros CSV sismos (backend requiere fecha ISO LocalDateTime)
  csvSismoDesde = signal('');
  csvSismoHasta = signal('');

  // Filtros CSV historial
  csvHistDesde = signal('');
  csvHistHasta = signal('');

  // PDF consolidado
  pdfConsolidadoDesde       = signal('');
  pdfConsolidadoHasta       = signal('');
  descargandoPdfConsolidado = signal(false);

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarReportes();
    this.cargarGeneraciones();
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  setTab(t: Tab): void {
    this.tabActivo.set(t);
    if (t === 'generar') this.cargarGeneraciones();
  }

  // ─── Descargar: carga y filtros ───────────────────────────────────────────
  private async cargarReportes(pagina = 0): Promise<void> {
    this.cargando.set(true);
    this.errorLista.set(null);
    try {
      const filtros: FiltroReportes = { page: pagina, size: this.PAGE_SIZE };
      if (this.filtroBusqueda().trim()) filtros.titulo = this.filtroBusqueda().trim();
      if (this.filtroAutor().trim())    filtros.autor  = this.filtroAutor().trim();
      if (this.filtroDesde().trim())    filtros.desde  = this.filtroDesde().trim();
      if (this.filtroHasta().trim())    filtros.hasta  = this.filtroHasta().trim();
      const res = await this.reporteService.getReportes(filtros);
      this.reportes.set(res.content);
      this.paginaActual.set(res.page);
      this.totalPaginas.set(res.totalPages);
      this.totalElementos.set(res.totalElements);
    } catch (err) {
      this.errorLista.set((err as Error).message || 'No se pudieron cargar los reportes.');
      this.reportes.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  aplicarFiltros(): void  { this.cargarReportes(0); }

  limpiarFiltros(): void {
    this.filtroBusqueda.set(''); this.filtroAutor.set('');
    this.filtroDesde.set('');    this.filtroHasta.set('');
    this.cargarReportes(0);
  }

  irAPagina(p: number): void {
    if (p < 0 || p >= this.totalPaginas()) return;
    this.cargarReportes(p);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas() }, (_, i) => i);
  }

  // ─── Descargar: descarga autenticada ─────────────────────────────────────
  async descargar(r: ReporteRespuesta): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    await this.fetchYDescargar(r.fecha, r.titulo, r.fecha);
  }

  // ─── Generar: carga y polling ────────────────────────────────────────────
  async cargarGeneraciones(): Promise<void> {
    this.cargandoGen.set(true);
    try {
      const lista = await this.reporteService.getMisGeneraciones();
      this.generaciones.set(lista);
      this.iniciarPolling();
    } catch { this.generaciones.set([]); }
    finally { this.cargandoGen.set(false); }
  }

  private iniciarPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    const pendientes = this.generaciones().filter(g => !g.finalizado);
    if (pendientes.length === 0) return;

    this.pollTimer = setInterval(async () => {
      const actuales = this.generaciones();
      const sinFinalizar = actuales.filter(g => !g.finalizado);
      if (sinFinalizar.length === 0) {
        clearInterval(this.pollTimer!);
        this.pollTimer = null;
        return;
      }
      for (const g of sinFinalizar) {
        try {
          const actualizado = await this.reporteService.consultarEstadoGeneracion(g.id);
          this.generaciones.update(list =>
            list.map(item => item.id === g.id ? actualizado : item)
          );
        } catch { /* ignora errores de red en polling */ }
      }
    }, 5000);
  }

  // ─── Generar: solicitar generación ───────────────────────────────────────
  async onSolicitarGeneracion(ev: Event): Promise<void> {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const d    = new FormData(form);
    const feSismo  = String(d.get('feSismo')  ?? '').trim();
    const magnitud = parseFloat(String(d.get('magnitud') ?? '0'));

    if (!feSismo || isNaN(magnitud)) {
      this.mensajeGen.set({ tipo: 'error', texto: 'Completa la fecha del sismo y la magnitud.' });
      return;
    }

    this.enviandoGen.set(true);
    this.mensajeGen.set(null);
    try {
      const gen = await this.reporteService.solicitarGeneracion(feSismo, magnitud);
      this.generaciones.update(list => [gen, ...list]);
      this.iniciarPolling();
      this.mensajeGen.set({ tipo: 'ok', texto: 'Generación solicitada. El PDF estará listo en breve.' });
      form.reset();
    } catch (err) {
      this.mensajeGen.set({ tipo: 'error', texto: (err as Error).message || 'No se pudo solicitar la generación.' });
    } finally {
      this.enviandoGen.set(false);
    }
  }

  // ─── Generar: cancelar ────────────────────────────────────────────────────
  async confirmarCancelar(): Promise<void> {
    const id = this.cancelarDialogId();
    this.cancelarDialogId.set(null);
    if (!id) return;
    try {
      await this.reporteService.cancelarGeneracion(id);
      this.generaciones.update(list => list.filter(g => g.id !== id));
    } catch (err) {
      this.mensajeGen.set({ tipo: 'error', texto: (err as Error).message || 'No se pudo cancelar.' });
    }
  }

  // ─── Generar: descargar completado ───────────────────────────────────────
  async descargarGenerado(g: GeneracionReporteRespuesta): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    await this.fetchYDescargar(g.feSismo, `Reporte_${g.feSismo}`, g.id);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  estaDescargado(id: string): boolean {
    return this._descargadasExito().has(id);
  }

  private marcarDescargado(id: string): void {
    this._descargadasExito.update(s => new Set([...s, id]));
    setTimeout(() => {
      this._descargadasExito.update(s => { const n = new Set(s); n.delete(id); return n; });
    }, 5000);
  }

  private async fetchYDescargar(feReporte: string, titulo: string, trackId: string): Promise<void> {
    this.descargando.set(trackId);
    this.descargandoGen.set(trackId);
    this.mensajeDescarga.set(null);
    try {
      const url     = environment.apiUrl + `/api/reportes/${encodeURIComponent(feReporte)}/descargar`;
      const token   = this.auth.getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob    = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href        = blobUrl;
      const disp    = res.headers.get('Content-Disposition') ?? '';
      const match   = disp.match(/filename[^;=\n]*=(?:(\\?["'])(.*?)\1|([^;\n]*))/i);
      a.download    = match?.[2] ?? match?.[3] ?? `${titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      this.marcarDescargado(trackId);
      this.mensajeDescarga.set({ tipo: 'ok', texto: `"${titulo}" descargado correctamente.` });
    } catch (err) {
      this.mensajeDescarga.set({ tipo: 'error', texto: (err as Error).message || 'No se pudo descargar.' });
    } finally {
      this.descargando.set(null);
      this.descargandoGen.set(null);
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
    }
  }

  // ─── Estado helpers ───────────────────────────────────────────────────────
  estadoBadgeClass(estado: string): string {
    const e = estado?.toUpperCase() as EstadoGen;
    if (['COMPLETADO', 'EXITOSO'].includes(e))  return 'bg-green-100 text-green-700';
    if (['PENDIENTE'].includes(e))               return 'bg-yellow-100 text-yellow-700';
    if (['EN_PROCESO', 'PROCESANDO'].includes(e)) return 'bg-sky-100 text-sky-700';
    if (['ERROR', 'FALLIDO'].includes(e))        return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  }

  estaCompleto(g: GeneracionReporteRespuesta): boolean {
    const e = g.estado?.toUpperCase();
    return e === 'COMPLETADO' || e === 'EXITOSO';
  }

  estaEnProceso(g: GeneracionReporteRespuesta): boolean {
    const e = g.estado?.toUpperCase();
    return e === 'EN_PROCESO' || e === 'PROCESANDO' || e === 'PENDIENTE';
  }

  estaEnError(g: GeneracionReporteRespuesta): boolean {
    const e = g.estado?.toUpperCase();
    return e === 'ERROR' || e === 'FALLIDO';
  }

  formatFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return fecha; }
  }

  formatDuracion(seg: number | undefined): string {
    if (!seg) return '—';
    if (seg < 60) return `${seg}s`;
    return `${Math.floor(seg / 60)}m ${seg % 60}s`;
  }

  // ─── CSV: exportar reportes ───────────────────────────────────────────────
  async exportarReportesCsv(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    this.exportandoReportes.set(true);
    this.mensajeDescarga.set(null);
    try {
      const todos: ReporteRespuesta[] = [];
      let pagina = 0;
      let ultima = false;
      while (!ultima) {
        const res = await this.reporteService.getReportes({ page: pagina, size: 500 });
        todos.push(...res.content);
        ultima = res.last;
        pagina++;
      }
      const cabeceras = ['Fecha', 'Título', 'Autor', 'Resumen', 'URL'];
      const filas = todos.map(r => [
        r.fecha ?? '',
        r.titulo ?? '',
        r.autor ?? '',
        r.resumen ?? '',
        r.url ?? '',
      ]);
      const nombre = `reportes_${this.fechaHoy()}.csv`;
      this.descargarCsv(cabeceras, filas, nombre);
      this.marcarCsvDescargado('reportes');
      this.mensajeDescarga.set({ tipo: 'ok', texto: `${todos.length} reportes exportados — ${nombre}` });
    } catch (err) {
      this.mensajeDescarga.set({ tipo: 'error', texto: (err as Error).message || 'Error al exportar reportes.' });
    } finally {
      this.exportandoReportes.set(false);
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
    }
  }

  // ─── CSV: exportar sismos (via backend /api/reportes/consolidado/csv) ────
  async exportarSismosCsv(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    const desde = this.csvSismoDesde();
    const hasta = this.csvSismoHasta();
    if (!desde || !hasta) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Selecciona rango de fechas (desde y hasta) para exportar.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    this.exportandoSismos.set(true);
    this.mensajeDescarga.set(null);
    try {
      const { blob, filename } = await this.reporteService.descargarConsolidadoCsv(
        this.toLocalDateTime(desde),
        this.toLocalDateTime(hasta, true)
      );
      this.triggerBlobDownload(blob, filename);
      this.marcarCsvDescargado('sismos');
      this.mensajeDescarga.set({ tipo: 'ok', texto: `Descargado: ${filename}` });
    } catch (err) {
      this.mensajeDescarga.set({ tipo: 'error', texto: (err as Error).message || 'Error al exportar sismos.' });
    } finally {
      this.exportandoSismos.set(false);
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
    }
  }

  // ─── CSV: exportar historial (via backend /api/resumen/historico/csv) ────
  async exportarHistoricoCsv(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    this.exportandoHistorico.set(true);
    this.mensajeDescarga.set(null);
    try {
      const { blob, filename } = await this.historicoService.descargarCsv(
        this.csvHistDesde() ? this.toLocalDateTime(this.csvHistDesde()) : undefined,
        this.csvHistHasta() ? this.toLocalDateTime(this.csvHistHasta(), true) : undefined
      );
      this.triggerBlobDownload(blob, filename);
      this.marcarCsvDescargado('historico');
      this.mensajeDescarga.set({ tipo: 'ok', texto: `Descargado: ${filename}` });
    } catch (err) {
      this.mensajeDescarga.set({ tipo: 'error', texto: (err as Error).message || 'Error al exportar historial.' });
    } finally {
      this.exportandoHistorico.set(false);
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
    }
  }

  // ─── PDF Consolidado ─────────────────────────────────────────────────────
  async descargarPdfConsolidado(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Debes iniciar sesión para descargar reportes.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    const desde = this.pdfConsolidadoDesde();
    const hasta = this.pdfConsolidadoHasta();
    if (!desde || !hasta) {
      this.mensajeDescarga.set({ tipo: 'error', texto: 'Selecciona un rango de fechas para generar el PDF.' });
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
      return;
    }
    this.descargandoPdfConsolidado.set(true);
    this.mensajeDescarga.set(null);
    try {
      const { blob, filename } = await this.reporteService.descargarConsolidadoPdf(
        this.toLocalDateTime(desde),
        this.toLocalDateTime(hasta, true)
      );
      this.triggerBlobDownload(blob, filename);
      this.mensajeDescarga.set({ tipo: 'ok', texto: `Descargado: ${filename}` });
    } catch (err) {
      this.mensajeDescarga.set({ tipo: 'error', texto: (err as Error).message || 'Error al generar el PDF consolidado.' });
    } finally {
      this.descargandoPdfConsolidado.set(false);
      setTimeout(() => this.mensajeDescarga.set(null), 4000);
    }
  }

  // ─── CSV: helpers de resumen de filtros ──────────────────────────────────
  get resumenFiltroSismos(): string {
    const partes: string[] = [];
    if (this.csvSismoDesde() && this.csvSismoHasta()) partes.push(`${this.csvSismoDesde()} → ${this.csvSismoHasta()}`);
    else if (this.csvSismoDesde()) partes.push(`desde ${this.csvSismoDesde()}`);
    else if (this.csvSismoHasta()) partes.push(`hasta ${this.csvSismoHasta()}`);
    return partes.length ? partes.join(' · ') : '';
  }

  get resumenFiltroHistorico(): string {
    const partes: string[] = [];
    if (this.csvHistDesde() && this.csvHistHasta()) partes.push(`${this.csvHistDesde()} → ${this.csvHistHasta()}`);
    else if (this.csvHistDesde()) partes.push(`desde ${this.csvHistDesde()}`);
    else if (this.csvHistHasta()) partes.push(`hasta ${this.csvHistHasta()}`);
    return partes.length ? partes.join(' · ') : '';
  }

  limpiarFiltrosSismosCsv(): void {
    this.csvSismoDesde.set(''); this.csvSismoHasta.set('');
  }

  limpiarFiltrosHistoricoCsv(): void {
    this.csvHistDesde.set(''); this.csvHistHasta.set('');
  }

  // ─── Helpers de descarga ──────────────────────────────────────────────────
  private toLocalDateTime(date: string, endOfDay = false): string {
    if (!date) return '';
    if (date.includes('T')) return date;
    return date + (endOfDay ? 'T23:59:59' : 'T00:00:00');
  }

  private triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ─── CSV helpers ──────────────────────────────────────────────────────────
  private descargarCsv(cabeceras: string[], filas: string[][], nombre: string): void {
    const escapar = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const contenido = [
      cabeceras.map(escapar).join(','),
      ...filas.map(f => f.map(escapar).join(','))
    ].join('\r\n');
    // BOM UTF-8 para que Excel abra correctamente con tildes
    const blob   = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private fechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
