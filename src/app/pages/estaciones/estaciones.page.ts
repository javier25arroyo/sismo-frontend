import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { EstacionMiniMapComponent } from '../../components/estacion-mini-map/estacion-mini-map.component';
import { EstacionRespuesta, EstadoEstacion } from '../../interfaces/api.interfaces';
import { CentroService } from '../../services/centro.service';
import { LucideAngularModule, MapPin, Satellite, Server, TriangleAlert, Wrench, CheckCircle, XCircle } from 'lucide-angular';

interface EstacionVista extends EstacionRespuesta {
  tipoSensor: string;
  latencia: string;
  ubicacionDetalle: string;
}

const SENSORES: Record<string, string> = {
  'ICE-ACC-001': 'Triaxial Monitoreo',
  'ICE-ACC-009': 'Digital High-Res',
  'ICE-ACC-099': 'Triaxial Alto Sismo',
  'ICE-ACC-112': 'Digital High-Res',
  'ICE-ACC-115': 'Fuerza Balanceada',
};

@Component({
  standalone: true,
  selector: 'app-estaciones',
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent, EstacionMiniMapComponent, LucideAngularModule],
  templateUrl: './estaciones.page.html'
})
export class EstacionesPage implements OnInit {
  estaciones = signal<EstacionVista[]>([]);
  cargando = signal(true);
  estacionSeleccionada = signal<EstacionVista | null>(null);
  busqueda = signal('');
  cambiandoEstado = signal(false);
  mensajeEstado = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  readonly serverIcon = Server;
  readonly satelliteIcon = Satellite;
  readonly warningIcon = TriangleAlert;
  readonly wrenchIcon = Wrench;
  readonly mapPinIcon = MapPin;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;

  constructor(private centroService: CentroService) {}

  ngOnInit(): void {
    this.cargarEstaciones();
  }

  private async cargarEstaciones(): Promise<void> {
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      const vistas: EstacionVista[] = page.content.map(e => {
        const estado = this.normalizarEstado(e.estado);
        return {
          ...e,
          estado,
          tipoSensor: SENSORES[e.codEstacion] ?? 'Triaxial',
          latencia: estado === 'INACTIVO' ? 'OFFLINE' : (Math.random() * 10 + 1).toFixed(1) + 'ms',
          ubicacionDetalle: e.codCentroPrd,
        };
      });

      this.estaciones.set(vistas);
      if (vistas.length > 0) {
        this.estacionSeleccionada.set(vistas[0]);
      }
    } catch {
      // Usar datos de ejemplo si no hay conexión
      this.estaciones.set(this.mockEstaciones());
      this.estacionSeleccionada.set(this.mockEstaciones()[0]);
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionar(e: EstacionVista): void {
    this.estacionSeleccionada.set(e);
  }

  get total(): number { return this.estaciones().length; }
  get enLinea(): number { return this.estaciones().filter(e => e.estado === 'ACTIVO').length; }
  get enMantenimiento(): number { return this.estaciones().filter(e => e.estado === 'MANTENIMIENTO').length; }
  get incidencias(): number { return this.estaciones().filter(e => e.estado === 'INACTIVO').length; }

  get filtradas(): EstacionVista[] {
    const q = this.busqueda().toLowerCase();
    if (!q) return this.estaciones();
    return this.estaciones().filter(e =>
      e.codEstacion.toLowerCase().includes(q) ||
      e.nomEstacion.toLowerCase().includes(q) ||
      e.ubicacionDetalle.toLowerCase().includes(q)
    );
  }

  setBusqueda(ev: Event): void {
    this.busqueda.set((ev.target as HTMLInputElement).value);
  }

  async cambiarEstado(est: EstacionVista, ev: Event): Promise<void> {
    const nuevoEstado = (ev.target as HTMLSelectElement).value as EstadoEstacion;
    if (nuevoEstado === est.estado) return;

    this.cambiandoEstado.set(true);
    this.mensajeEstado.set(null);

    try {
      await this.centroService.actualizarEstacion(est.codCentroPrd, est.codEstacion, {
        nomEstacion: est.nomEstacion,
        coordenadaX: est.coordenadaX,
        coordenadaY: est.coordenadaY,
        estado: nuevoEstado,
      });

      const actualizadas = this.estaciones().map(e =>
        e.codEstacion === est.codEstacion && e.codCentroPrd === est.codCentroPrd
          ? { ...e, estado: nuevoEstado, latencia: nuevoEstado === 'INACTIVO' ? 'OFFLINE' : e.latencia }
          : e
      );
      this.estaciones.set(actualizadas);
      const actualizada = { ...est, estado: nuevoEstado, latencia: nuevoEstado === 'INACTIVO' ? 'OFFLINE' : est.latencia };
      this.estacionSeleccionada.set(actualizada);
      this.mensajeEstado.set({ tipo: 'ok', texto: 'Estado actualizado correctamente' });
    } catch {
      this.mensajeEstado.set({ tipo: 'error', texto: 'No se pudo actualizar el estado' });
    } finally {
      this.cambiandoEstado.set(false);
      setTimeout(() => this.mensajeEstado.set(null), 3000);
    }
  }

  private normalizarEstado(raw: string | null | undefined): EstacionVista['estado'] {
    switch ((raw ?? '').toUpperCase()) {
      case 'ACTIVO':
      case 'ACTIVA':   return 'ACTIVO';
      case 'INACTIVO':
      case 'INACTIVA': return 'INACTIVO';
      default:         return 'MANTENIMIENTO';
    }
  }

  telemetriaLabel(estado: string): string {
    switch (estado) {
      case 'ACTIVO':        return 'TRANSMITIENDO';
      case 'MANTENIMIENTO': return 'EN MANTENIMIENTO';
      default:              return 'SIN SEÑAL';
    }
  }

  telemetriaBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVO':        return 'bg-green-100 text-green-700';
      case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-700';
      default:              return 'bg-rose-100 text-rose-700';
    }
  }

  telemetriaDotClass(estado: string): string {
    switch (estado) {
      case 'ACTIVO':        return 'bg-green-500';
      case 'MANTENIMIENTO': return 'bg-yellow-500';
      default:              return 'bg-rose-500';
    }
  }

  gpsLabel(estado: string): string {
    switch (estado) {
      case 'ACTIVO':        return 'GPS LOCK';
      case 'MANTENIMIENTO': return 'SUSPENDIDO';
      default:              return 'SIN SEÑAL';
    }
  }

  gpsClass(estado: string): string {
    switch (estado) {
      case 'ACTIVO':        return 'text-green-600';
      case 'MANTENIMIENTO': return 'text-yellow-600';
      default:              return 'text-rose-600';
    }
  }

  private mockEstaciones(): EstacionVista[] {
    return [
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-001', nomEstacion: 'Represa Arenal', coordenadaX: -84.9, coordenadaY: 10.3, estado: 'ACTIVO', tipoSensor: 'Triaxial Monitoreo', latencia: '3.1ms', ubicacionDetalle: 'Alajuela' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-009', nomEstacion: 'Volcán Poás', coordenadaX: -84.2, coordenadaY: 10.2, estado: 'ACTIVO', tipoSensor: 'Digital High-Res', latencia: '5.2ms', ubicacionDetalle: 'Sector 4' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-099', nomEstacion: 'Puerto Limón Terminal', coordenadaX: -83.0, coordenadaY: 9.99, estado: 'INACTIVO', tipoSensor: 'Triaxial Alto Sismo', latencia: 'OFFLINE', ubicacionDetalle: 'Limón' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-112', nomEstacion: 'Golfito Muelle Técnico', coordenadaX: -83.1, coordenadaY: 8.64, estado: 'MANTENIMIENTO', tipoSensor: 'Digital High-Res', latencia: '11.9ms', ubicacionDetalle: 'Golfito' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-115', nomEstacion: 'San José Edificio Sabana', coordenadaX: -84.1, coordenadaY: 9.93, estado: 'ACTIVO', tipoSensor: 'Fuerza Balanceada', latencia: '6.8ms', ubicacionDetalle: 'San José' },
    ];
  }
}
