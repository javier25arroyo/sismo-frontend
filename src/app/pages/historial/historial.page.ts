import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MagnitudBadgeComponent } from '../../components/magnitud-badge/magnitud-badge.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { HistoricoService } from '../../services/historico.service';
import { ResumenHistoricoRespuesta } from '../../interfaces/api.interfaces';
import { ArrowLeft, ArrowUp, ArrowUpRight, ClipboardList, LucideAngularModule, TriangleAlert } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-historial',
  imports: [CommonModule, MagnitudBadgeComponent, StatusBadgeComponent, PaginacionComponent, LucideAngularModule],
  templateUrl: './historial.page.html'
})
export class HistorialPage implements OnInit {
  eventos = signal<ResumenHistoricoRespuesta[]>([]);
  cargando = signal(true);
  pagina = signal(1);
  totalPaginas = signal(1);
  totalElementos = signal(0);
  readonly pageSize = 10;

  // Filtros
  desde = signal('');
  hasta = signal('');
  magnitudMin = signal('');
  magnitudMax = signal('');

  // Sidebar stats
  magnitudPromedio = signal(0);
  eventoCritico = signal<ResumenHistoricoRespuesta | null>(null);
  readonly arrowLeftIcon = ArrowLeft;
  readonly arrowUpIcon = ArrowUp;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly reportIcon = ClipboardList;
  readonly warningIcon = TriangleAlert;

  constructor(private historicoService: HistoricoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(p = 1): Promise<void> {
    this.cargando.set(true);
    this.pagina.set(p);
    try {
      const res = await this.historicoService.getHistorico({
        desde: this.desde() || undefined,
        hasta: this.hasta() || undefined,
        page: p - 1,
        size: this.pageSize,
      });
      this.eventos.set(res.content);
      this.totalPaginas.set(res.totalPages || 1);
      this.totalElementos.set(res.totalElements || res.content.length);

      if (res.content.length > 0) {
        const mags = res.content.map(e => e.magnitud);
        this.magnitudPromedio.set(mags.reduce((a, b) => a + b, 0) / mags.length);
        this.eventoCritico.set(res.content.reduce((prev, cur) =>
          cur.magnitud > prev.magnitud ? cur : prev
        ));
      }
    } catch {
      this.eventos.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  aplicarFiltros(): void { this.cargar(1); }
  limpiarFiltros(): void {
    this.desde.set('');
    this.hasta.set('');
    this.magnitudMin.set('');
    this.magnitudMax.set('');
    this.cargar(1);
  }
  cambiarPagina(p: number): void { this.cargar(p); }

  getEstadoRed(e: ResumenHistoricoRespuesta): string {
    const m = e.magnitud;
    const d = e.distanciaHipocentral ?? 0;

    if (m >= 6.0 && d <= 600) return 'NIVEL 4';
    if (m >= 5.0 && d <= 400) return 'NIVEL 3';
    if (m >= 4.0 && d <= 70)  return 'NIVEL 2';
    if (m >= 3.5 && d <= 20)  return 'NIVEL 1';

    if (!e.vaAceleracion) return 'INACTIVO';
    if (e.vaAceleracion > 50) return 'FALLA RED';
    return 'ACTIVO';
  }

  getEpicentro(e: ResumenHistoricoRespuesta): string {
    return `${Math.abs(e.ySismo).toFixed(1)} km ${e.ySismo >= 0 ? 'N' : 'S'} de ${e.nomEstacion}`;
  }
}
