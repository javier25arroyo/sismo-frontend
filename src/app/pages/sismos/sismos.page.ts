import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { SismoService } from '../../services/sismo.service';
import { CentroService } from '../../services/centro.service';
import {
  EstacionRespuesta,
  GeneracionReporteRespuesta,
  SismoRespuesta
} from '../../interfaces/api.interfaces';
import { Sismo } from '../../interfaces/sismo.interface';
import { HistoricoService } from '../../services/historico.service';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../services/auth.service';
import {
  LucideAngularModule,
  Share2,
  FileText,
  AlertCircle,
  Info,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Hourglass
} from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-sismos',
  imports: [
    CommonModule,
    SismoMapComponent,
    LucideAngularModule
  ],
  templateUrl: './sismos.page.html'
})
export class SismosPage implements OnInit, OnDestroy {
  ultimoSismo = signal<SismoRespuesta | null>(null);
  sismosMapa = signal<Sismo[]>([]);
  estaciones = signal<EstacionRespuesta[]>([]);
  cargando = signal(true);
  errorCarga = signal('');
  mensajeAccion = signal('');
  estadoReporte = signal<GeneracionReporteRespuesta | null>(null);
  generandoPdf = signal(false);
  private pollingId: ReturnType<typeof setTimeout> | null = null;
  private destruido = false;

  readonly shareIcon = Share2;
  readonly fileTextIcon = FileText;
  readonly alertIcon = AlertCircle;
  readonly infoIcon = Info;
  readonly mapPinIcon = MapPin;
  readonly clockIcon = Clock;
  readonly navIcon = Navigation;
  readonly chevronIcon = ChevronRight;
  readonly shieldIcon = ShieldCheck;
  readonly loaderIcon = Loader2;
  readonly hourglassIcon = Hourglass;

  constructor(
    private sismoService: SismoService,
    private centroService: CentroService,
    private historicoService: HistoricoService,
    private reporteService: ReporteService,
    readonly auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    void this.cargarEstaciones();
    const sismoFromState = (window.history.state as { sismo?: SismoRespuesta })?.sismo ?? null;
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      void this.cargar(id, sismoFromState);
    });
  }

  private async cargarEstaciones(): Promise<void> {
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      this.estaciones.set(page.content);
    } catch {
      this.estaciones.set([]);
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarPolling();
  }

  private async cargar(id?: string, sismoFromState: SismoRespuesta | null = null): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');
    try {
      let sismo: SismoRespuesta | null = null;

      if (sismoFromState && id && sismoFromState.feSismo === id) {
        sismo = sismoFromState;
      }

      if (!sismo) {
        const res = await this.sismoService.listarSismos({ page: 0, size: 1 });
        sismo = res.content[0] || null;
      }

      const resumenes = await this.sismoService.getUltimosSismos(50);

      this.ultimoSismo.set(sismo);
      this.sismosMapa.set(resumenes);
    } catch (error) {
      this.ultimoSismo.set(null);
      this.sismosMapa.set([]);
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible cargar la información sísmica.'));
    } finally {
      this.cargando.set(false);
    }
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

  get magnitudColor(): string {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 3.0) return '#22c55e';
    if (m < 4.5) return '#eab308';
    if (m < 6.0) return '#f97316';
    return '#ef4444';
  }

  get nivelMagnitud(): string {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 2.5) return 'Micro';
    if (m < 4.0) return 'Menor';
    if (m < 5.0) return 'Moderado';
    if (m < 6.0) return 'Fuerte';
    if (m < 7.0) return 'Mayor';
    return 'Extremo';
  }

  getColorEstadoUbicacion(estado: string): string {
    switch (estado) {
      case 'verificada': return 'green';
      case 'revision': return 'amber';
      case 'pendiente': return 'slate';
      default: return 'slate';
    }
  }

  getEstadoUbicacion(ubicacion: string | undefined): 'verificada' | 'revision' | 'pendiente' | 'desconocida' {
    if (!ubicacion) return 'desconocida';

    if (/revisada?\s*(?:por\s*)?(?:la\s*)?rsn|ya\s+ha\s+sido\s+revisada?/i.test(ubicacion)) {
      return 'verificada';
    }
    if (/en\s+revisión|en\s+revision|pendiente\s+de\s+revisión/i.test(ubicacion)) {
      return 'revision';
    }
    if (/sin\s+revisar|no\s+revisada?|no\s+ha\s+sido\s+revisada?/i.test(ubicacion)) {
      return 'pendiente';
    }
    return 'desconocida';
  }

  formatearUbicacion(ubicacion: string | undefined): string {
    if (!ubicacion) return 'Sin información de ubicación';

    const estado = this.getEstadoUbicacion(ubicacion);

    switch (estado) {
      case 'verificada':
        return 'Ubicación verificada por la Red Sísmica Nacional';
      case 'revision':
        return 'Ubicación en proceso de verificación';
      case 'pendiente':
        return 'Ubicación pendiente de verificación';
      default:
        return ubicacion;
    }
  }
}
