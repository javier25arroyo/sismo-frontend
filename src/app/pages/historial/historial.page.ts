import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener,
  OnInit, ViewChild, computed, effect, signal
} from '@angular/core';
import { FocusTrap } from '../../utils/focus-trap';
import { MagnitudBadgeComponent } from '../../components/magnitud-badge/magnitud-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import { EstacionesCacheService } from '../../services/estaciones-cache.service';
import { EstacionRespuesta, SismoRespuesta } from '../../interfaces/api.interfaces';
import {
  ArrowLeft, ArrowUp, ArrowUpRight, Calendar, Check,
  ClipboardList, LucideAngularModule, MapPin, SlidersHorizontal, TriangleAlert, X
} from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { UbicacionNormalizadaPipe } from '../../pipes/ubicacion-normalizada.pipe';
import { UtcLocalPipe } from '../../pipes/utc-local.pipe';

type FiltroSentido = '' | 'sentido' | 'no_sentido';
type FiltroLocalizacion = '' | 'valle_central' | 'zona_atlantica' | 'zona_pacifica' | 'zona_sur';
type RangoRapido = 'hoy' | '7d' | '30d' | '90d' | 'anio';

@Component({
  standalone: true,
  selector: 'app-historial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MagnitudBadgeComponent, PaginacionComponent,
    LucideAngularModule, RouterLink, SismoMapComponent, UbicacionNormalizadaPipe, UtcLocalPipe
  ],
  templateUrl: './historial.page.html'
})
export class HistorialPage implements OnInit {
  eventos = signal<SismoRespuesta[]>([]);
  cargando = signal(true);
  pagina = signal(1);
  totalPaginas = signal(1);
  totalElementos = signal(0);
  readonly pageSize = 10;

  // Filtros aplicados (enviados al API)
  desde = signal('');
  hasta = signal('');
  filtroSentido = signal<FiltroSentido>('');
  localizacion = signal<FiltroLocalizacion>('');

  // Filtros en edición
  desdeDraft = signal('');
  hastaDraft = signal('');
  filtroSentidoDraft = signal<FiltroSentido>('');
  localizacionDraft = signal<FiltroLocalizacion>('');

  // Panel de detalle
  sismoDetalle = signal<SismoRespuesta | null>(null);
  estaciones = signal<EstacionRespuesta[]>([]);

  @ViewChild('panelDetalle') panelDetalleEl?: ElementRef<HTMLElement>;
  private readonly trap = new FocusTrap();
  private detalleTrigger: HTMLElement | null = null;

  // Filtro localizacion aplicado sobre la página actual (client-side, el API no lo soporta)
  readonly eventosFiltradosLocalizacion = computed(() => {
    const loc = this.localizacion();
    if (!loc) return this.eventos();
    return this.eventos().filter(e => this.coincideLocalizacion(e.ubicacion, loc));
  });

  // Stats basados en la página actual
  readonly magnitudPromedio = computed(() => {
    const evts = this.eventosFiltradosLocalizacion();
    if (evts.length === 0) return 0;
    const mags = evts.map(e => e.magnitud);
    return mags.reduce((a, b) => a + b, 0) / mags.length;
  });

  readonly eventoCritico = computed(() => {
    const evts = this.eventosFiltradosLocalizacion();
    if (evts.length === 0) return null;
    return evts.reduce((prev, cur) => cur.magnitud > prev.magnitud ? cur : prev);
  });

  readonly magnitudColor = computed(() => {
    const m = this.eventoCritico()?.magnitud ?? 0;
    if (m < 3.0) return 'text-green-700';
    if (m < 4.5) return 'text-yellow-700';
    if (m < 6.0) return 'text-orange-700';
    return 'text-rose-700';
  });

  readonly arrowLeftIcon    = ArrowLeft;
  readonly arrowUpIcon      = ArrowUp;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly calendarIcon     = Calendar;
  readonly reportIcon       = ClipboardList;
  readonly warningIcon      = TriangleAlert;
  readonly checkIcon        = Check;
  readonly closeIcon        = X;
  readonly mapPinIcon       = MapPin;
  readonly filterIcon       = SlidersHorizontal;

  readonly rangosRapidos: readonly { value: RangoRapido; label: string }[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: 'anio', label: 'Este año' }
  ];

  readonly zonasFiltro: readonly { value: FiltroLocalizacion; label: string }[] = [
    { value: '', label: 'Todo el territorio' },
    { value: 'valle_central', label: 'Central' },
    { value: 'zona_atlantica', label: 'Huetar Atlántica' },
    { value: 'zona_pacifica', label: 'Chorotega' },
    { value: 'zona_sur', label: 'Zona Sur' }
  ];

  readonly sentidoOpciones: readonly { value: FiltroSentido; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'sentido', label: 'Sentidos' },
    { value: 'no_sentido', label: 'No sentidos' }
  ];

  get filtrosActivos(): number {
    let n = 0;
    if (this.desdeDraft()) n++;
    if (this.hastaDraft()) n++;
    if (this.filtroSentidoDraft()) n++;
    if (this.localizacionDraft()) n++;
    return n;
  }

  get hayCambiosPendientes(): boolean {
    return this.desdeDraft() !== this.desde()
      || this.hastaDraft() !== this.hasta()
      || this.filtroSentidoDraft() !== this.filtroSentido()
      || this.localizacionDraft() !== this.localizacion();
  }

  get eventosFiltrados(): SismoRespuesta[] {
    return this.eventosFiltradosLocalizacion();
  }

  constructor(
    private sismoService: SismoService,
    private estacionesCache: EstacionesCacheService,
    private router: Router
  ) {
    effect(() => {
      if (this.sismoDetalle()) {
        setTimeout(() => {
          const panel = this.panelDetalleEl?.nativeElement;
          if (!panel) return;
          const closeBtn = panel.querySelector<HTMLElement>('button[aria-label="Cerrar panel"]');
          this.trap.activate(panel, closeBtn ?? undefined, this.detalleTrigger ?? undefined);
        });
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.sismoDetalle()) this.cerrarDetalle();
  }

  ngOnInit(): void {
    void this.cargarPagina(1);
    void this.cargarEstaciones();
  }

  private async cargarEstaciones(): Promise<void> {
    const data = await this.estacionesCache.getEstaciones();
    this.estaciones.set(data);
  }

  private async cargarPagina(pagina: number): Promise<void> {
    this.cargando.set(true);
    try {
      const sentido = this.filtroSentido() || undefined;
      const res = await this.sismoService.listarSismos({
        desde: this.desde() || undefined,
        hasta: this.hasta() || undefined,
        sentido,
        page: pagina - 1,
        size: this.pageSize
      });
      this.eventos.set(res.content);
      this.pagina.set(pagina);
      this.totalPaginas.set(res.totalPages || 1);
      this.totalElementos.set(res.totalElements || res.content.length);
    } catch {
      this.eventos.set([]);
      this.totalPaginas.set(1);
      this.totalElementos.set(0);
    } finally {
      this.cargando.set(false);
    }
  }

  getLocalizacionLabel(val: string): string {
    switch (val) {
      case 'valle_central': return 'Central';
      case 'zona_atlantica': return 'Huetar Atlántica';
      case 'zona_pacifica': return 'Chorotega';
      case 'zona_sur': return 'Zona Sur';
      default: return 'Todo el territorio';
    }
  }

  getSentidoLabel(val: FiltroSentido): string {
    switch (val) {
      case 'sentido': return 'Sentidos';
      case 'no_sentido': return 'No sentidos';
      default: return 'Todos';
    }
  }

  setRangoRapido(rango: RangoRapido): void {
    const { desde, hasta } = this.obtenerRangoRapido(rango);
    this.desdeDraft.set(desde);
    this.hastaDraft.set(hasta);
  }

  esRangoRapidoActivo(rango: RangoRapido): boolean {
    const actual = this.obtenerRangoRapido(rango);
    return this.desdeDraft() === actual.desde && this.hastaDraft() === actual.hasta;
  }

  private obtenerRangoRapido(rango: RangoRapido): { desde: string; hasta: string } {
    const hoy = new Date();
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    let inicio = new Date(fin);

    switch (rango) {
      case '7d': inicio.setDate(fin.getDate() - 6); break;
      case '30d': inicio.setDate(fin.getDate() - 29); break;
      case '90d': inicio.setDate(fin.getDate() - 89); break;
      case 'anio': inicio = new Date(fin.getFullYear(), 0, 1); break;
    }

    return {
      desde: this.formatearFechaInput(inicio),
      hasta: this.formatearFechaInput(fin)
    };
  }

  private formatearFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const day = `${fecha.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private coincideLocalizacion(ubicacion: string, filtro: FiltroLocalizacion): boolean {
    const valor = this.normalizarTexto(ubicacion);
    if (!valor) return false;
    switch (filtro) {
      case 'valle_central':
        return this.contieneAlguno(valor, ['san jose', 'alajuela', 'cartago', 'heredia', 'valle central']);
      case 'zona_atlantica':
        return this.contieneAlguno(valor, ['limon', 'caribe', 'atlantica', 'atlantico', 'talamanca', 'siquirres']);
      case 'zona_pacifica':
        return this.contieneAlguno(valor, ['pacifica', 'pacifico', 'puntarenas', 'guanacaste', 'nicoya', 'chorotega']);
      case 'zona_sur':
        return this.contieneAlguno(valor, ['osa', 'golfito', 'coto brus', 'buenos aires', 'san vito', 'palmar', 'perez zeledon', 'brunca', 'zona sur']);
      default: return true;
    }
  }

  private contieneAlguno(valor: string, palabras: string[]): boolean {
    return palabras.some(p => valor.includes(p));
  }

  private normalizarTexto(valor: string): string {
    return valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  private esSentido(valor: unknown): boolean {
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'number') return valor === 1;
    if (typeof valor !== 'string') return false;
    const n = this.normalizarTexto(valor.trim());
    return n === 'si' || n === 's' || n === 'true' || n === '1' || n === 'sentido';
  }

  esEventoSentido(evento: SismoRespuesta): boolean {
    return this.esSentido(evento.sentido);
  }

  aplicarFiltros(): void {
    this.desde.set(this.desdeDraft());
    this.hasta.set(this.hastaDraft());
    this.filtroSentido.set(this.filtroSentidoDraft());
    this.localizacion.set(this.localizacionDraft());
    void this.cargarPagina(1);
  }

  cambiarSentido(valor: FiltroSentido): void {
    this.filtroSentidoDraft.set(this.filtroSentidoDraft() === valor ? '' : valor);
  }

  limpiarFiltros(): void {
    this.desdeDraft.set('');
    this.hastaDraft.set('');
    this.filtroSentidoDraft.set('');
    this.localizacionDraft.set('');
    this.desde.set('');
    this.hasta.set('');
    this.filtroSentido.set('');
    this.localizacion.set('');
    void this.cargarPagina(1);
  }

  cambiarPagina(p: number): void {
    void this.cargarPagina(p);
  }

  verDetalle(e: SismoRespuesta): void {
    this.detalleTrigger = document.activeElement as HTMLElement;
    this.sismoDetalle.set(e);
  }

  irAAnalisis(s: SismoRespuesta): void {
    void this.router.navigate(['/sismos'], {
      queryParams: { id: s.feSismo },
      state: { sismo: s }
    });
  }

  cerrarDetalle(): void {
    this.trap.deactivate();
    this.sismoDetalle.set(null);
  }

  colorMagnitud(m: number): string {
    if (m >= 6.0) return '#ef4444';
    if (m >= 5.0) return '#f97316';
    if (m >= 4.0) return '#eab308';
    if (m >= 3.5) return '#22c55e';
    return '#94a3b8';
  }

  trackBySismo(_: number, e: SismoRespuesta): string {
    return e.feSismo;
  }
}
