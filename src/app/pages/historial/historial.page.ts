import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MagnitudBadgeComponent } from '../../components/magnitud-badge/magnitud-badge.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import { SismoRespuesta } from '../../interfaces/api.interfaces';
import { ArrowLeft, ArrowUp, ArrowUpRight, Check, ChevronDown, ClipboardList, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type FiltroSentido = '' | 'sentido' | 'no_sentido';
type FiltroLocalizacion = '' | 'valle_central' | 'zona_atlantica' | 'zona_pacifica';

@Component({
  standalone: true,
  selector: 'app-historial',
  imports: [CommonModule, FormsModule, MagnitudBadgeComponent, StatusBadgeComponent, PaginacionComponent, LucideAngularModule, RouterLink],
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
  magnitudMin = signal('');
  filtroSentido = signal<FiltroSentido>('');
  localizacion = signal<FiltroLocalizacion>('');

  // Filtros en edición (se aplican al tocar "Aplicar Filtros")
  desdeDraft = signal('');
  hastaDraft = signal('');
  magnitudMinDraft = signal('');
  filtroSentidoDraft = signal<FiltroSentido>('');
  localizacionDraft = signal<FiltroLocalizacion>('');

  // Dropdown states
  showMagnitudDropdown = signal(false);
  showLocalizacionDropdown = signal(false);

  // Sidebar stats
  magnitudPromedio = signal(0);
  eventoCritico = signal<SismoRespuesta | null>(null);

  readonly arrowLeftIcon = ArrowLeft;
  readonly arrowUpIcon = ArrowUp;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly reportIcon = ClipboardList;
  readonly warningIcon = TriangleAlert;
  readonly chevronDownIcon = ChevronDown;
  readonly checkIcon = Check;

  constructor(private sismoService: SismoService) {}

  ngOnInit(): void {
    void this.cargarEventos();
  }

  toggleMagnitudDropdown(): void {
    this.showMagnitudDropdown.set(!this.showMagnitudDropdown());
    this.showLocalizacionDropdown.set(false);
  }

  toggleLocalizacionDropdown(): void {
    this.showLocalizacionDropdown.set(!this.showLocalizacionDropdown());
    this.showMagnitudDropdown.set(false);
  }

  setMagnitudDraft(val: string): void {
    this.magnitudMinDraft.set(val);
    this.showMagnitudDropdown.set(false);
  }

  setLocalizacionDraft(val: FiltroLocalizacion): void {
    this.localizacionDraft.set(val);
    this.showLocalizacionDropdown.set(false);
  }

  getMagnitudLabel(val: string): string {
    switch (val) {
      case '3': return '≥ 3.0';
      case '4': return '≥ 4.0';
      case '5': return '≥ 5.0';
      case '6': return '≥ 6.0';
      default: return 'Todas las magnitudes';
    }
  }

  getLocalizacionLabel(val: string): string {
    switch (val) {
      case 'valle_central': return 'Valle Central';
      case 'zona_atlantica': return 'Zona Atlántica';
      case 'zona_pacifica': return 'Zona Pacífica';
      default: return 'Todo el territorio';
    }
  }

  onLocalizacionDraftChange(valor: string): void {
    if (valor === 'valle_central' || valor === 'zona_atlantica' || valor === 'zona_pacifica') {
      this.localizacionDraft.set(valor);
      return;
    }
    this.localizacionDraft.set('');
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
    const magnitudMin = this.magnitudMin() ? Number(this.magnitudMin()) : null;
    const sentido = this.filtroSentido();
    const localizacion = this.localizacion();

    return eventos.filter((evento) => {
      const fechaEvento = new Date(evento.feSismo);
      if (desde && fechaEvento < desde) return false;
      if (hasta && fechaEvento > hasta) return false;
      if (magnitudMin !== null && !Number.isNaN(magnitudMin) && evento.magnitud < magnitudMin) return false;

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
        return this.contieneAlguno(valor, ['pacifica', 'pacifico', 'puntarenas', 'guanacaste', 'nicoya', 'golfito', 'osa']);
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
    this.magnitudMin.set(this.magnitudMinDraft());
    this.filtroSentido.set(this.filtroSentidoDraft());
    this.localizacion.set(this.localizacionDraft());
    this.aplicarFiltrosEnMemoria(1);

    this.showMagnitudDropdown.set(false);
    this.showLocalizacionDropdown.set(false);
  }

  cambiarSentido(valor: FiltroSentido): void {
    this.filtroSentidoDraft.set(this.filtroSentidoDraft() === valor ? '' : valor);
  }

  limpiarFiltros(): void {
    this.desdeDraft.set('');
    this.hastaDraft.set('');
    this.magnitudMinDraft.set('');
    this.filtroSentidoDraft.set('');
    this.localizacionDraft.set('');

    this.desde.set('');
    this.hasta.set('');
    this.magnitudMin.set('');
    this.filtroSentido.set('');
    this.localizacion.set('');
    this.aplicarFiltrosEnMemoria(1);

    this.showMagnitudDropdown.set(false);
    this.showLocalizacionDropdown.set(false);
  }

  cambiarPagina(p: number): void {
    this.aplicarFiltrosEnMemoria(p);
  }

  getEstadoRed(e: SismoRespuesta): string {
    const m = e.magnitud;
    if (m >= 6.0) return 'NIVEL 4';
    if (m >= 5.0) return 'NIVEL 3';
    if (m >= 4.0) return 'NIVEL 2';
    if (m >= 3.5) return 'NIVEL 1';
    return 'ACTIVO';
  }

  get magnitudColor(): string {
    const m = this.eventoCritico()?.magnitud ?? 0;
    if (m < 3.0) return 'text-green-700';
    if (m < 4.5) return 'text-yellow-700';
    if (m < 6.0) return 'text-orange-700';
    return 'text-rose-700';
  }
}
