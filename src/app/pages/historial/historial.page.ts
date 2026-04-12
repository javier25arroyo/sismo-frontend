import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { MagnitudBadgeComponent } from '../../components/magnitud-badge/magnitud-badge.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import { SismoRespuesta } from '../../interfaces/api.interfaces';
import { ArrowLeft, ArrowUp, ArrowUpRight, ClipboardList, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-historial',
  imports: [CommonModule, MagnitudBadgeComponent, StatusBadgeComponent, PaginacionComponent, LucideAngularModule, RouterLink],
  templateUrl: './historial.page.html'
})
export class HistorialPage implements OnInit {
  @ViewChild('inputDesde')     private inputDesde!:     ElementRef<HTMLInputElement>;
  @ViewChild('inputHasta')     private inputHasta!:     ElementRef<HTMLInputElement>;
  @ViewChild('selectMagnitud') private selectMagnitud!: ElementRef<HTMLSelectElement>;

  eventos      = signal<SismoRespuesta[]>([]);
  cargando     = signal(true);
  pagina       = signal(1);
  totalPaginas = signal(1);
  totalElementos = signal(0);
  readonly pageSize = 10;

  // Filtros (valores comprometidos al aplicar)
  desde        = signal('');
  hasta        = signal('');
  magnitudMin  = signal('');
  filtroSentido = signal<'' | 'sentido' | 'no_sentido'>('');

  // Sidebar stats
  magnitudPromedio = signal(0);
  eventoCritico    = signal<SismoRespuesta | null>(null);

  readonly arrowLeftIcon   = ArrowLeft;
  readonly arrowUpIcon     = ArrowUp;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly reportIcon      = ClipboardList;
  readonly warningIcon     = TriangleAlert;

  constructor(private sismoService: SismoService) {}

  ngOnInit(): void { this.cargar(); }

  private sentidoParam(): string | undefined {
    if (this.filtroSentido() === 'sentido')    return 'SI';
    if (this.filtroSentido() === 'no_sentido') return 'NO';
    return undefined;
  }

  async cargar(p = 1): Promise<void> {
    this.cargando.set(true);
    this.pagina.set(p);
    try {
      const res = await this.sismoService.listarSismos({
        desde:       this.desde()       || undefined,
        hasta:       this.hasta()       || undefined,
        magnitudMin: this.magnitudMin() ? Number(this.magnitudMin()) : undefined,
        sentido:     this.sentidoParam(),
        page:        p - 1,
        size:        this.pageSize,
      });
      this.eventos.set(res.content);
      this.totalPaginas.set(res.totalPages   || 1);
      this.totalElementos.set(res.totalElements || res.content.length);

      if (res.content.length > 0) {
        const mags = res.content.map(e => e.magnitud);
        this.magnitudPromedio.set(mags.reduce((a, b) => a + b, 0) / mags.length);
        this.eventoCritico.set(res.content.reduce((prev, cur) =>
          cur.magnitud > prev.magnitud ? cur : prev));
      } else {
        this.magnitudPromedio.set(0);
        this.eventoCritico.set(null);
      }
    } catch {
      this.eventos.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  get eventosFiltrados(): SismoRespuesta[] { return this.eventos(); }

  /** Lee los valores actuales del DOM y lanza la búsqueda. */
  aplicarFiltros(): void {
    this.desde.set(this.inputDesde.nativeElement.value);
    this.hasta.set(this.inputHasta.nativeElement.value);
    this.magnitudMin.set(this.selectMagnitud.nativeElement.value);
    this.cargar(1);
  }

  cambiarSentido(valor: '' | 'sentido' | 'no_sentido'): void {
    this.filtroSentido.set(this.filtroSentido() === valor ? '' : valor);
    this.cargar(1);
  }

  limpiarFiltros(): void {
    this.inputDesde.nativeElement.value     = '';
    this.inputHasta.nativeElement.value     = '';
    this.selectMagnitud.nativeElement.value = '';
    this.desde.set('');
    this.hasta.set('');
    this.magnitudMin.set('');
    this.filtroSentido.set('');
    this.cargar(1);
  }

  cambiarPagina(p: number): void { this.cargar(p); }

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
