import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import {
  GeneracionReporteRespuesta,
  ResumenHistoricoRespuesta,
  SismoRespuesta
} from '../../interfaces/api.interfaces';
import { Sismo } from '../../interfaces/sismo.interface';
import { HistoricoService } from '../../services/historico.service';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-sismos',
  imports: [CommonModule, SismoMapComponent, StatusBadgeComponent, PaginacionComponent],
  templateUrl: './sismos.page.html'
})
export class SismosPage implements OnInit, OnDestroy {
  ultimoSismo = signal<SismoRespuesta | null>(null);
  sismosMapa = signal<Sismo[]>([]);
  detalleEstaciones = signal<ResumenHistoricoRespuesta[]>([]);
  cargando = signal(true);
  cargandoDetalle = signal(false);
  errorCarga = signal('');
  errorDetalle = signal('');
  mensajeAccion = signal('');
  estadoReporte = signal<GeneracionReporteRespuesta | null>(null);
  generandoPdf = signal(false);
  pagina = signal(1);
  totalPaginas = signal(1);
  totalEstaciones = signal(0);
  readonly pageSize = 10;
  private pollingId: ReturnType<typeof setTimeout> | null = null;
  private destruido = false;

  constructor(
    private sismoService: SismoService,
    private historicoService: HistoricoService,
    private reporteService: ReporteService,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    void this.cargar();
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarPolling();
  }

  private async cargar(): Promise<void> {
    this.errorCarga.set('');
    try {
      const [listaUltimo, resumenes] = await Promise.all([
        this.sismoService.listarSismos({ page: 0, size: 1 }),
        this.sismoService.getUltimosSismos(50),
      ]);
      const ultimo = listaUltimo.content[0] ?? null;
      this.ultimoSismo.set(ultimo);
      this.sismosMapa.set(resumenes);
      if (ultimo) await this.cargarDetalleEstaciones(1, ultimo.feSismo);
    } catch (error) {
      this.ultimoSismo.set(null);
      this.sismosMapa.set([]);
      this.detalleEstaciones.set([]);
      this.totalEstaciones.set(0);
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible cargar la información sísmica.'));
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarDetalleEstaciones(
    pagina = this.pagina(),
    feSismo = this.ultimoSismo()?.feSismo
  ): Promise<void> {
    if (!feSismo) {
      this.detalleEstaciones.set([]);
      this.totalPaginas.set(1);
      this.totalEstaciones.set(0);
      return;
    }

    this.cargandoDetalle.set(true);
    this.errorDetalle.set('');
    this.pagina.set(pagina);

    try {
      const res = await this.historicoService.getHistorico({
        desde: feSismo,
        hasta: feSismo,
        page: pagina - 1,
        size: this.pageSize
      });

      const detalleEvento = res.content.filter(evento => evento.feSismo === feSismo);
      this.detalleEstaciones.set(detalleEvento);
      this.totalPaginas.set(res.totalPages || 1);
      this.totalEstaciones.set(res.totalElements || detalleEvento.length);
    } catch (error) {
      this.detalleEstaciones.set([]);
      this.totalPaginas.set(1);
      this.totalEstaciones.set(0);
      this.errorDetalle.set(this.obtenerMensajeError(error, 'No fue posible cargar el detalle por estación.'));
    } finally {
      this.cargandoDetalle.set(false);
    }
  }

  cambiarPagina(p: number): void {
    void this.cargarDetalleEstaciones(p);
  }

  async compartirDatos(): Promise<void> {
    const sismo = this.ultimoSismo();
    if (!sismo) return;
    const nav = typeof window !== 'undefined' ? window.navigator : null;

    const resumen = [
      'Sismo en Costa Rica',
      `Magnitud: ${sismo.magnitud.toFixed(1)} Mw`,
      `Ubicación: ${sismo.ubicacion}`,
      `Profundidad: ${sismo.profundidad} km`,
      `Fecha UTC: ${new Date(sismo.feSismo).toISOString().replace('T', ' ').slice(0, 19)}`
    ].join('\n');

    try {
      if (nav?.share) {
        await nav.share({
          title: 'Sismo en Costa Rica',
          text: resumen
        });
        this.mensajeAccion.set('Resumen del sismo compartido.');
        return;
      }

      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(resumen);
        this.mensajeAccion.set('Resumen del sismo copiado al portapapeles.');
        return;
      }

      this.mensajeAccion.set('El navegador no permite compartir o copiar desde esta sesión.');
    } catch {
      this.mensajeAccion.set('No fue posible compartir los datos del sismo.');
    }
  }

  async solicitarPdf(): Promise<void> {
    const sismo = this.ultimoSismo();
    if (!sismo || this.generandoPdf() || !this.auth.isAdmin()) return;

    this.generandoPdf.set(true);
    this.estadoReporte.set(null);
    this.mensajeAccion.set('');
    this.cancelarPolling();

    try {
      const generacion = await this.reporteService.solicitarGeneracion(sismo.feSismo, sismo.magnitud);
      this.estadoReporte.set(generacion);
      this.actualizarMensajeReporte(generacion);

      if (generacion.finalizado) {
        this.generandoPdf.set(false);
        return;
      }

      this.programarConsultaReporte(generacion.id);
    } catch (error) {
      this.generandoPdf.set(false);
      this.mensajeAccion.set(this.obtenerMensajeError(error, 'No fue posible solicitar el PDF del evento.'));
    }
  }

  private programarConsultaReporte(id: string, intento = 0): void {
    if (this.destruido) return;

    this.pollingId = setTimeout(async () => {
      try {
        const estado = await this.reporteService.consultarEstadoGeneracion(id);
        this.estadoReporte.set(estado);
        this.actualizarMensajeReporte(estado);

        if (estado.finalizado) {
          this.generandoPdf.set(false);
          this.cancelarPolling();
          return;
        }

        if (intento >= 29) {
          this.generandoPdf.set(false);
          this.cancelarPolling();
          this.mensajeAccion.set('La generación del PDF sigue en proceso. Puede revisar su estado más tarde en el repositorio.');
          return;
        }

        this.programarConsultaReporte(id, intento + 1);
      } catch (error) {
        this.generandoPdf.set(false);
        this.cancelarPolling();
        this.mensajeAccion.set(this.obtenerMensajeError(error, 'No fue posible consultar el estado del PDF.'));
      }
    }, 2500);
  }

  private actualizarMensajeReporte(estado: GeneracionReporteRespuesta): void {
    switch (estado.estado) {
      case 'COMPLETADO':
        this.mensajeAccion.set('PDF generado correctamente. Puede descargarlo desde el repositorio de reportes.');
        break;
      case 'ERROR':
        this.mensajeAccion.set(estado.mensajeError || 'La generación del PDF finalizó con error.');
        break;
      default:
        this.mensajeAccion.set(estado.mensajeEstado || 'Generando PDF del evento...');
        break;
    }
  }

  private cancelarPolling(): void {
    if (this.pollingId) {
      clearTimeout(this.pollingId);
      this.pollingId = null;
    }
  }

  private obtenerMensajeError(error: unknown, respaldo: string): string {
    return error instanceof Error && error.message ? error.message : respaldo;
  }

  get puedeCompartir(): boolean {
    return !!this.ultimoSismo();
  }

  get puedeSolicitarPdf(): boolean {
    return !!this.ultimoSismo() && this.auth.isAdmin() && !this.generandoPdf();
  }

  get etiquetaPdf(): string {
    if (this.generandoPdf()) return 'Generando...';
    return this.auth.isAdmin() ? 'Solicitar PDF' : 'PDF';
  }

  getEstadoRed(evento: ResumenHistoricoRespuesta): string {
    const m = evento.magnitud;
    const d = evento.distanciaHipocentral ?? 0;

    if (m >= 6.0 && d <= 600) return 'NIVEL 4';
    if (m >= 5.0 && d <= 400) return 'NIVEL 3';
    if (m >= 4.0 && d <= 70)  return 'NIVEL 2';
    if (m >= 3.5 && d <= 20)  return 'NIVEL 1';

    if (!evento.vaAceleracion) return 'INACTIVO';
    if (evento.vaAceleracion > 50) return 'FALLA RED';
    return 'ACTIVO';
  }

  get magnitudColor(): string {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 3.0) return '#22c55e'; // Verde - Nivel 1
    if (m < 4.5) return '#eab308'; // Amarillo - Nivel 2
    if (m < 6.0) return '#f97316'; // Naranja - Nivel 3
    return '#ef4444';             // Rojo - Nivel 4
  }

  get precision(): number {
    const count = this.sismosMapa().length;
    if (count === 0) return 0;
    return Math.min(99, Math.round(85 + count / 10));
  }
}
