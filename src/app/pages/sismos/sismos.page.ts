import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { SismoService } from '../../services/sismo.service';
import { SismoUltimoRespuesta, VistaTerremotoRespuesta } from '../../interfaces/api.interfaces';
import { Sismo } from '../../interfaces/sismo.interface';
import { VistaTerremotoService } from '../../services/vista-terremoto.service';

@Component({
  standalone: true,
  selector: 'app-sismos',
  imports: [CommonModule, SismoMapComponent, StatusBadgeComponent, PaginacionComponent],
  templateUrl: './sismos.page.html'
})
export class SismosPage implements OnInit {
  ultimoSismo = signal<SismoUltimoRespuesta | null>(null);
  sismosMapa = signal<Sismo[]>([]);
  aceleraciones = signal<VistaTerremotoRespuesta[]>([]);
  cargando = signal(true);
  pagina = signal(1);
  totalPaginas = signal(1);
  readonly pageSize = 10;

  constructor(
    private sismoService: SismoService,
    private vistaService: VistaTerremotoService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    try {
      const [ultimo, resumenes] = await Promise.all([
        this.sismoService.getUltimoSismo(),
        this.sismoService.getUltimosSismos(50),
      ]);
      this.ultimoSismo.set(ultimo);
      this.sismosMapa.set(resumenes);
      await this.cargarAceleraciones();
    } catch { /* mostrar mock */ } finally {
      this.cargando.set(false);
    }
  }

  private async cargarAceleraciones(): Promise<void> {
    try {
      const res = await this.vistaService.getTerremotos({
        page: this.pagina() - 1,
        size: this.pageSize
      });
      this.aceleraciones.set(res.content);
      this.totalPaginas.set(res.totalPages || 1);
    } catch { this.aceleraciones.set([]); }
  }

  cambiarPagina(p: number): void {
    this.pagina.set(p);
    this.cargarAceleraciones();
  }

  get magnitudColor(): string {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 3) return '#22c55e';
    if (m < 4) return '#eab308';
    if (m < 5) return '#f97316';
    if (m < 6) return '#ef4444';
    return '#7c2d12';
  }

  get precision(): number {
    const count = this.sismosMapa().length;
    if (count === 0) return 0;
    return Math.min(99, Math.round(85 + count / 10));
  }
}
