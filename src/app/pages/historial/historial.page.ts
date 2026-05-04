import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MagnitudBadgeComponent } from '../../components/magnitud-badge/magnitud-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import { CentroService } from '../../services/centro.service';
import { EstacionRespuesta, SismoRespuesta } from '../../interfaces/api.interfaces';
import { ArrowLeft, ArrowUp, ArrowUpRight, Calendar, Check, ClipboardList, LucideAngularModule, MapPin, SlidersHorizontal, TriangleAlert, X } from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { UbicacionNormalizadaPipe } from '../../pipes/ubicacion-normalizada.pipe';
import { parseUtcDate, UtcLocalPipe } from '../../pipes/utc-local.pipe';

type FiltroSentido = '' | 'sentido' | 'no_sentido';
type FiltroLocalizacion = '' | 'valle_central' | 'zona_atlantica' | 'zona_pacifica' | 'zona_sur';
type RangoRapido = 'hoy' | '7d' | '30d' | '90d' | 'anio';

@Component({
  standalone: true,
  selector: 'app-historial',
  imports: [CommonModule, FormsModule, MagnitudBadgeComponent, PaginacionComponent, LucideAngularModule, RouterLink, SismoMapComponent, UbicacionNormalizadaPipe, UtcLocalPipe],
  templateUrl: './historial.page.html'
})
export class HistorialPage implements OnInit {
  private readonly allEventos = signal<SismoRespuesta[]>([]);

  eventos = signal<SismoRespuesta[]>([]);
  cargando = signal(true);
  pagina = signal(1);
  totalPaginas = signal(1);
  totalElementos = signal(0);
  readonly pageSize = 10;
  private readonly fetchPageSize = 200;

  // Filtros aplicados
  desde = signal('');
  hasta = signal('');
  filtroSentido = signal<FiltroSentido>('');
  localizacion = signal<FiltroLocalizacion>('');

  // Filtros en edición (se aplican al tocar "Aplicar Filtros")
  desdeDraft = signal('');
  hastaDraft = signal('');
  filtroSentidoDraft = signal<FiltroSentido>('');
  localizacionDraft = signal<FiltroLocalizacion>('');

  // Panel de detalle
  sismoDetalle = signal<SismoRespuesta | null>(null);
  estaciones = signal<EstacionRespuesta[]>([]);

  // Sidebar stats
  magnitudPromedio = signal(0);
  eventoCritico = signal<SismoRespuesta | null>(null);

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

  readonly rangosRapidos: ReadonlyArray<{ value: RangoRapido; label: string }> = [
    { value: 'hoy', label: 'Hoy' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: 'anio', label: 'Este año' }
  ];

  readonly zonasFiltro: ReadonlyArray<{ value: FiltroLocalizacion; label: string }> = [
    { value: '', label: 'Todo el territorio' },
    { value: 'valle_central', label: 'Central' },
    { value: 'zona_atlantica', label: 'Huetar Atlántica' },
    { value: 'zona_pacifica', label: 'Chorotega' },
    { value: 'zona_sur', label: 'Zona Sur' }
  ];

  readonly sentidoOpciones: ReadonlyArray<{ value: FiltroSentido; label: string }> = [
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

  constructor(private sismoService: SismoService, private centroService: CentroService, private router: Router) {}

  ngOnInit(): void {
    void this.cargarEventos();
    void this.cargarEstaciones();
  }

  private async cargarEstaciones(): Promise<void> {
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      this.estaciones.set(page.content);
    } catch {
      this.estaciones.set([]);
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
      case 'sentido':
        return 'Sentidos';
      case 'no_sentido':
        return 'No sentidos';
      default:
        return 'Todos';
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
      case 'hoy':
        break;
      case '7d':
        inicio.setDate(fin.getDate() - 6);
        break;
      case '30d':
        inicio.setDate(fin.getDate() - 29);
        break;
      case '90d':
        inicio.setDate(fin.getDate() - 89);
        break;
      case 'anio':
        inicio = new Date(fin.getFullYear(), 0, 1);
        break;
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

  private async cargarEventos(): Promise<void> {
    this.cargando.set(true);
    try {
      const eventos = await this.cargarTodosLosEventos();
      this.allEventos.set(eventos);
      this.aplicarFiltrosEnMemoria(1);
    } catch {
      this.allEventos.set([]);
      this.eventos.set([]);
      this.totalPaginas.set(1);
      this.totalElementos.set(0);
      this.magnitudPromedio.set(0);
      this.eventoCritico.set(null);
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarTodosLosEventos(): Promise<SismoRespuesta[]> {
    const acumulados: SismoRespuesta[] = [];
    let page = 0;
    let totalPages = 1;

    do {
      const res = await this.sismoService.listarSismos({
        page,
        size: this.fetchPageSize,
      });
      acumulados.push(...res.content);
      totalPages = res.totalPages || 1;
      page += 1;
    } while (page < totalPages);

    return acumulados;
  }

  private aplicarFiltrosEnMemoria(paginaSolicitada = 1): void {
    const filtrados = this.filtrarEventos(this.allEventos());
    const total = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / this.pageSize));
    const paginaValida = Math.min(Math.max(1, paginaSolicitada), totalPaginas);
    const inicio = (paginaValida - 1) * this.pageSize;

    this.eventos.set(filtrados.slice(inicio, inicio + this.pageSize));
    this.pagina.set(paginaValida);
    this.totalPaginas.set(totalPaginas);
    this.totalElementos.set(total);

    if (filtrados.length > 0) {
      const mags = filtrados.map((e) => e.magnitud);
      this.magnitudPromedio.set(mags.reduce((a, b) => a + b, 0) / mags.length);
      this.eventoCritico.set(
        filtrados.reduce((prev, cur) => (cur.magnitud > prev.magnitud ? cur : prev))
      );
      return;
    }

    this.magnitudPromedio.set(0);
    this.eventoCritico.set(null);
  }

  private filtrarEventos(eventos: SismoRespuesta[]): SismoRespuesta[] {
    const desde = this.desde() ? new Date(`${this.desde()}T00:00:00`) : null;
    const hasta = this.hasta() ? new Date(`${this.hasta()}T23:59:59.999`) : null;
    const sentido = this.filtroSentido();
    const localizacion = this.localizacion();

    return eventos.filter((evento) => {
      const fechaEvento = parseUtcDate(evento.feSismo);
      if (desde && fechaEvento < desde) return false;
      if (hasta && fechaEvento > hasta) return false;
      const fueSentido = this.esSentido(evento.sentido);
      if (sentido === 'sentido' && !fueSentido) return false;
      if (sentido === 'no_sentido' && fueSentido) return false;

      if (localizacion && !this.coincideLocalizacion(evento.ubicacion, localizacion)) return false;
      return true;
    });
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
      default:
        return true;
    }
  }

  private contieneAlguno(valor: string, palabras: string[]): boolean {
    return palabras.some((palabra) => valor.includes(palabra));
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private esSentido(valor: unknown): boolean {
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'number') return valor === 1;
    if (typeof valor !== 'string') return false;
    const normalizado = this.normalizarTexto(valor.trim());
    return normalizado === 'si'
      || normalizado === 's'
      || normalizado === 'true'
      || normalizado === '1'
      || normalizado === 'sentido';
  }

  esEventoSentido(evento: SismoRespuesta): boolean {
    return this.esSentido(evento.sentido);
  }

  get eventosFiltrados(): SismoRespuesta[] { return this.eventos(); }

  aplicarFiltros(): void {
    this.desde.set(this.desdeDraft());
    this.hasta.set(this.hastaDraft());
    this.filtroSentido.set(this.filtroSentidoDraft());
    this.localizacion.set(this.localizacionDraft());
    this.aplicarFiltrosEnMemoria(1);
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
    this.aplicarFiltrosEnMemoria(1);
  }

  cambiarPagina(p: number): void {
    this.aplicarFiltrosEnMemoria(p);
  }

  verDetalle(e: SismoRespuesta): void {
    this.sismoDetalle.set(e);
  }

  irAAnalisis(s: SismoRespuesta): void {
    void this.router.navigate(['/sismos'], {
      queryParams: { id: s.feSismo },
      state: { sismo: s }
    });
  }

  cerrarDetalle(): void {
    this.sismoDetalle.set(null);
  }

  colorMagnitud(m: number): string {
    if (m >= 6.0) return '#ef4444';
    if (m >= 5.0) return '#f97316';
    if (m >= 4.0) return '#eab308';
    if (m >= 3.5) return '#22c55e';
    return '#94a3b8';
  }

  get magnitudColor(): string {
    const m = this.eventoCritico()?.magnitud ?? 0;
    if (m < 3.0) return 'text-green-700';
    if (m < 4.5) return 'text-yellow-700';
    if (m < 6.0) return 'text-orange-700';
    return 'text-rose-700';
  }
}
