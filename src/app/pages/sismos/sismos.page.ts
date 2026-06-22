import { Component, DestroyRef, HostListener, OnDestroy, OnInit, inject, signal, computed, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { UtcLocalPipe } from '../../pipes/utc-local.pipe';
import { ActivatedRoute } from '@angular/router';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { SismoService } from '../../services/sismo.service';
import { AcelerogramasService } from '../../services/acelerogramas.service';
import { EstacionesCacheService } from '../../services/estaciones-cache.service';
import {
  EstacionRespuesta,
  GeneracionReporteRespuesta,
  ResumenAlertaSismicaRespuesta,
  SismoRespuesta
} from '../../interfaces/api.interfaces';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SismoMapComponent,
    LucideAngularModule,
    UtcLocalPipe
  ],
  templateUrl: './sismos.page.html'
})
export class SismosPage implements OnInit, OnDestroy {
  ultimoSismo = signal<SismoRespuesta | null>(null);
  estaciones = signal<EstacionRespuesta[]>([]);
  resumenAcelerogramas = signal<ResumenAlertaSismicaRespuesta[]>([]);
  cargando = signal(true);
  errorCarga = signal('');
  mensajeAccion = signal('');
  estadoReporte = signal<GeneracionReporteRespuesta | null>(null);
  generandoPdf = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private pollingId: ReturnType<typeof setTimeout> | null = null;
  private destruido = false;
  private readonly windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

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

  // Computed signals replacing getters evaluated on every CD cycle
  readonly magnitudColor = computed(() => {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 3.0) return '#22c55e';
    if (m < 4.5) return '#eab308';
    if (m < 6.0) return '#f97316';
    return '#ef4444';
  });

  readonly puedeCompartir = computed(() => !!this.ultimoSismo());

  readonly puedeSolicitarPdf = computed(() =>
    !!this.ultimoSismo() && this.auth.isAdmin() && !this.generandoPdf()
  );

  readonly etiquetaPdf = computed(() => {
    if (this.generandoPdf()) return 'Generando...';
    return this.auth.isAdmin() ? 'Solicitar PDF' : 'PDF';
  });

  readonly mapHeight = computed(() => {
    const w = this.windowWidth();
    if (w < 640) return '320px';
    if (w < 1024) return '480px';
    return '640px';
  });

  readonly resumenAcelerogramasArray = computed(() =>
    this.completarDistanciasHipocentrales(
      this.resumenAcelerogramas(),
      this.ultimoSismo(),
      this.estaciones()
    )
  );

  @HostListener('window:resize', ['$event'])
  onResize(e: UIEvent): void {
    this.windowWidth.set((e.target as Window).innerWidth);
  }

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private sismoService: SismoService,
    private acelerogramasService: AcelerogramasService,
    private reporteService: ReporteService,
    readonly auth: AuthService,
    private route: ActivatedRoute,
    private estacionesCache: EstacionesCacheService
  ) {}

  ngOnInit(): void {
    void this.cargarEstaciones();
    const sismoFromState = this.isBrowser
      ? (window.history.state as { sismo?: SismoRespuesta })?.sismo ?? null
      : null;
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      void this.cargar(id, sismoFromState);
    });
  }

  private async cargarEstaciones(): Promise<void> {
    const data = await this.estacionesCache.getEstaciones();
    this.estaciones.set(data);
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarPolling();
  }

  private async cargar(id?: string, sismoFromState: SismoRespuesta | null = null): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.resumenAcelerogramas.set([]);
    try {
      let sismo: SismoRespuesta | null = null;

      if (sismoFromState && id && sismoFromState.feSismo === id) {
        sismo = sismoFromState;
      }

      if (!sismo) {
        const res = await this.sismoService.listarSismos({ page: 0, size: 1 });
        sismo = res.content[0] || null;
      }

      this.ultimoSismo.set(sismo);

      if (sismo) {
        try {
          await this.cargarResumenAcelerografico(sismo.feSismo);
        } catch {
          this.resumenAcelerogramas.set([]);
        }
      }
    } catch (error) {
      this.ultimoSismo.set(null);
      this.resumenAcelerogramas.set([]);
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible cargar la información sísmica.'));
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarResumenAcelerografico(feSismo: string): Promise<void> {
    const resumen = await this.acelerogramasService.obtenerResumenPorEstacion(feSismo);
    if (resumen.length > 0) {
      this.resumenAcelerogramas.set(resumen);
      return;
    }

    const acelerogramas = await this.acelerogramasService.listarAcelerogramas(undefined, undefined, 0, 1);
    const fechaDisponible = acelerogramas.content[0]?.feTerremoto;
    if (!fechaDisponible || fechaDisponible === feSismo) {
      this.resumenAcelerogramas.set([]);
      return;
    }

    this.resumenAcelerogramas.set(
      await this.acelerogramasService.obtenerResumenPorEstacion(fechaDisponible)
    );
  }

  alertaSismicaLabel(alerta: string | null | undefined): string {
    const valor = alerta?.trim();
    if (!valor || valor.toUpperCase() === 'SIN_CONFIGURACION') {
      return 'Sin definir';
    }
    return valor;
  }

  private completarDistanciasHipocentrales(
    resumen: ResumenAlertaSismicaRespuesta[],
    sismo: SismoRespuesta | null,
    estaciones: EstacionRespuesta[]
  ): ResumenAlertaSismicaRespuesta[] {
    if (!sismo || estaciones.length === 0) {
      return resumen;
    }

    return resumen.map(registro => {
      if (this.esNumeroFinito(registro.distanciaHipocentralKm)) {
        return registro;
      }

      const estacion = this.buscarEstacionParaResumen(registro, estaciones, sismo);
      const distanciaHipocentralKm = estacion
        ? this.calcularDistanciaHipocentralKm(sismo, estacion)
        : null;

      return distanciaHipocentralKm === null
        ? registro
        : { ...registro, distanciaHipocentralKm };
    });
  }

  private buscarEstacionParaResumen(
    registro: ResumenAlertaSismicaRespuesta,
    estaciones: EstacionRespuesta[],
    sismo: SismoRespuesta
  ): EstacionRespuesta | null {
    const codigo = this.normalizarCodigo(registro.codigoEstacion);
    const nombre = this.normalizarTexto(registro.nombre);
    const candidatas = estaciones.filter(estacion =>
      this.normalizarCodigo(estacion.codEstacion) === codigo
    );

    if (candidatas.length === 0) {
      return null;
    }

    const candidatasPorNombre = candidatas.filter(estacion =>
      this.normalizarTexto(estacion.nomEstacion) === nombre
    );
    const opciones = candidatasPorNombre.length > 0 ? candidatasPorNombre : candidatas;

    return opciones.reduce((mejor, actual) => {
      const distanciaMejor = this.calcularDistanciaEpicentralKm(sismo, mejor) ?? Number.POSITIVE_INFINITY;
      const distanciaActual = this.calcularDistanciaEpicentralKm(sismo, actual) ?? Number.POSITIVE_INFINITY;
      return distanciaActual < distanciaMejor ? actual : mejor;
    });
  }

  private calcularDistanciaHipocentralKm(sismo: SismoRespuesta, estacion: EstacionRespuesta): number | null {
    const distanciaEpicentralKm = this.calcularDistanciaEpicentralKm(sismo, estacion);
    if (distanciaEpicentralKm === null || !this.esNumeroFinito(sismo.profundidad)) {
      return null;
    }

    return Math.sqrt((distanciaEpicentralKm ** 2) + (sismo.profundidad ** 2));
  }

  private calcularDistanciaEpicentralKm(sismo: SismoRespuesta, estacion: EstacionRespuesta): number | null {
    if (
      !this.esNumeroFinito(sismo.coordenadaX) ||
      !this.esNumeroFinito(sismo.coordenadaY) ||
      !this.esNumeroFinito(estacion.coordenadaX) ||
      !this.esNumeroFinito(estacion.coordenadaY)
    ) {
      return null;
    }

    const radioTierraKm = 6371.0088;
    const latSismo = this.gradosARadianes(sismo.coordenadaY);
    const latEstacion = this.gradosARadianes(estacion.coordenadaY);
    const deltaLat = this.gradosARadianes(estacion.coordenadaY - sismo.coordenadaY);
    const deltaLon = this.gradosARadianes(estacion.coordenadaX - sismo.coordenadaX);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(latSismo) * Math.cos(latEstacion) * Math.sin(deltaLon / 2) ** 2;

    return radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private gradosARadianes(grados: number): number {
    return grados * Math.PI / 180;
  }

  private normalizarCodigo(valor: string | null | undefined): string {
    return (valor ?? '').trim().toUpperCase();
  }

  private normalizarTexto(valor: string | null | undefined): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private esNumeroFinito(valor: unknown): valor is number {
    return typeof valor === 'number' && Number.isFinite(valor);
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
        await nav.share({ title: 'Sismo en Costa Rica', text: resumen });
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

  getColorEstadoUbicacion(estado: string): string {
    switch (estado) {
      case 'verificada': return 'green';
      case 'revision': return 'amber';
      default: return 'slate';
    }
  }

  getEstadoUbicacion(ubicacion: string | undefined): 'verificada' | 'revision' | 'pendiente' | 'desconocida' {
    if (!ubicacion) return 'desconocida';
    if (/revisada?\s*(?:por\s*)?(?:la\s*)?rsn|ya\s+ha\s+sido\s+revisada?/i.test(ubicacion)) return 'verificada';
    if (/en\s+revisión|en\s+revision|pendiente\s+de\s+revisión/i.test(ubicacion)) return 'revision';
    if (/sin\s+revisar|no\s+revisada?|no\s+ha\s+sido\s+revisada?/i.test(ubicacion)) return 'pendiente';
    return 'desconocida';
  }

  formatearUbicacion(ubicacion: string | undefined): string {
    if (!ubicacion) return 'Sin información de ubicación';
    const estado = this.getEstadoUbicacion(ubicacion);
    switch (estado) {
      case 'verificada': return 'Ya ha sido revisado por la RSN';
      case 'revision': return 'Ubicación en proceso de verificación';
      case 'pendiente': return 'Ubicación pendiente de verificación';
      default: {
        let txt = ubicacion.replace(/\s*\)\s*$/, '').trim();
        txt = txt.replace(/\brevisada\b/g, 'revisado').replace(/\bRevisada\b/g, 'Revisado');
        return txt.length > 0 ? txt.charAt(0).toUpperCase() + txt.slice(1) : txt;
      }
    }
  }

}
