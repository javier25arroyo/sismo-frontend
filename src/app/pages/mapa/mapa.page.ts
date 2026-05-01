import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { SismoService } from '../../services/sismo.service';
import { CentroService } from '../../services/centro.service';
import { EstacionRespuesta } from '../../interfaces/api.interfaces';
import { Sismo } from '../../interfaces/sismo.interface';
import { UbicacionNormalizadaPipe } from '../../pipes/ubicacion-normalizada.pipe';
import { UtcLocalPipe, parseUtcDate } from '../../pipes/utc-local.pipe';

@Component({
  standalone: true,
  selector: 'app-mapa-page',
  imports: [CommonModule, FormsModule, SismoMapComponent, UbicacionNormalizadaPipe, UtcLocalPipe],
  templateUrl: './mapa.page.html'
})
export class MapaPage implements OnInit {
  sismos: Sismo[] = [];
  estaciones: EstacionRespuesta[] = [];
  loading = true;
  error = '';

  magnitudMin = 0;
  cantidadSismos = 50;

  readonly magnitudOptions = [
    { value: 0, label: 'Todas' },
    { value: 3, label: '≥ 3.0' },
    { value: 4, label: '≥ 4.0' },
    { value: 5, label: '≥ 5.0' },
    { value: 6, label: '≥ 6.0' }
  ];

  readonly cantidadOptions = [20, 50, 100];

  constructor(private sismoService: SismoService, private centroService: CentroService) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargarSismos(), this.cargarEstaciones()]);
  }

  async cargarEstaciones(): Promise<void> {
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      this.estaciones = page.content;
    } catch {
      this.estaciones = [];
    }
  }

  async cargarSismos(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      if (this.magnitudMin > 0) {
        this.sismos = await this.sismoService.getSismosPorMagnitud(this.magnitudMin);
      } else {
        this.sismos = await this.sismoService.getUltimosSismos(this.cantidadSismos);
      }
    } catch (e) {
      this.error = 'Error al cargar los sismos. Verifique la conexión con el servidor.';
      console.error('Error cargando sismos:', e);
    } finally {
      this.loading = false;
    }
  }

  async aplicarFiltros(): Promise<void> {
    await this.cargarSismos();
  }

  async setMagnitudMin(value: number): Promise<void> {
    if (this.magnitudMin === value) return;
    this.magnitudMin = value;
    await this.cargarSismos();
  }

  async setCantidad(value: number): Promise<void> {
    if (this.cantidadSismos === value) return;
    this.cantidadSismos = value;
    if (this.magnitudMin === 0) await this.cargarSismos();
  }

  get sismoMasReciente(): Sismo | null {
    return this.sismos.length > 0 ? this.sismos[0] : null;
  }

  get sismoMayorMagnitud(): Sismo | null {
    if (this.sismos.length === 0) return null;
    return this.sismos.reduce((max, s) => s.magnitud > max.magnitud ? s : max, this.sismos[0]);
  }

  get profundidadPromedio(): number {
    if (this.sismos.length === 0) return 0;
    const sum = this.sismos.reduce((acc, s) => acc + (s.profundidad ?? 0), 0);
    return sum / this.sismos.length;
  }

  get sismosUltimas24h(): number {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return this.sismos.filter(s => new Date(s.feSismo).getTime() >= cutoff).length;
  }

  magnitudColorClass(m: number): string {
    if (m >= 6) return 'text-red-900';
    if (m >= 5) return 'text-red-500';
    if (m >= 4) return 'text-orange-500';
    if (m >= 3) return 'text-yellow-500';
    return 'text-green-500';
  }

  magnitudBgClass(m: number): string {
    if (m >= 6) return 'bg-red-900 text-white';
    if (m >= 5) return 'bg-red-500 text-white';
    if (m >= 4) return 'bg-orange-500 text-white';
    if (m >= 3) return 'bg-yellow-500 text-slate-900';
    return 'bg-green-500 text-white';
  }

  magnitudRingClass(m: number): string {
    if (m >= 6) return 'ring-red-900/30';
    if (m >= 5) return 'ring-red-500/30';
    if (m >= 4) return 'ring-orange-500/30';
    if (m >= 3) return 'ring-yellow-500/30';
    return 'ring-green-500/30';
  }

  timeAgo(fecha: string | Date): string {
    const d = typeof fecha === 'string' ? parseUtcDate(fecha) : fecha;
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'hace ' + sec + ' s';
    const min = Math.floor(sec / 60);
    if (min < 60) return 'hace ' + min + ' min';
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return 'hace ' + hrs + ' h';
    const days = Math.floor(hrs / 24);
    if (days < 30) return 'hace ' + days + ' d';
    const months = Math.floor(days / 30);
    return 'hace ' + months + ' mes' + (months > 1 ? 'es' : '');
  }

  profundidadBar(prof: number): number {
    const max = 200;
    return Math.min(100, Math.max(3, (prof / max) * 100));
  }

  now(): Date {
    return new Date();
  }

  get mapHeight(): string {
    if (typeof window === 'undefined') return '450px';
    return window.innerWidth < 640 ? '300px' : window.innerWidth < 1024 ? '450px' : '620px';
  }
}
