import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { EstacionMiniMapComponent } from '../../components/estacion-mini-map/estacion-mini-map.component';
import { EstacionRespuesta, EstadoEstacion } from '../../interfaces/api.interfaces';
import { CentroService } from '../../services/centro.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, MapPin, Satellite, Server, TriangleAlert, Wrench, CheckCircle, XCircle } from 'lucide-angular';

interface EstacionVista extends EstacionRespuesta {
  tipoSensor: string;
  ubicacionDetalle: string;
}

const SENSORES: Record<string, string> = {
  'ICE-ACC-001': 'RefTek',
  'ICE-ACC-009': 'RefTek',
  'ICE-ACC-099': 'RefTek',
  'ICE-ACC-112': 'RefTek',
  'ICE-ACC-115': 'RefTek',
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
  mostrarDropdown = signal(false);
  mensajeEstado = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  readonly serverIcon = Server;
  readonly satelliteIcon = Satellite;
  readonly warningIcon = TriangleAlert;
  readonly wrenchIcon = Wrench;
  readonly mapPinIcon = MapPin;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;

  constructor(private centroService: CentroService, public auth: AuthService) {}

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
          tipoSensor: SENSORES[e.codEstacion] ?? 'RefTek',
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
  get enLinea(): number { return this.estaciones().filter(e => e.estado === 'ACTIVA').length; }
  get enMantenimiento(): number { return this.estaciones().filter(e => e.estado === 'MANTENIMIENTO').length; }
  get incidencias(): number { return this.estaciones().filter(e => e.estado === 'FUERA_DE_SERVICIO').length; }

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

  toggleDropdown(): void {
    if (this.cambiandoEstado()) return;
    this.mostrarDropdown.update(v => !v);
  }

  async seleccionarNuevoEstado(est: EstacionVista, nuevoEstado: EstadoEstacion): Promise<void> {
    this.mostrarDropdown.set(false);
    if (nuevoEstado === est.estado) return;

    this.cambiandoEstado.set(true);
    this.mensajeEstado.set(null);

    try {
      await this.centroService.actualizarEstacion(est.codCentroPrd, est.codEstacion, {
        codCentroPrd: est.codCentroPrd,
        codEstacion: est.codEstacion,
        nomEstacion: est.nomEstacion,
        coordenadaX: est.coordenadaX,
        coordenadaY: est.coordenadaY,
        estado: nuevoEstado,
      });

      const actualizadas = this.estaciones().map(e =>
        e.codEstacion === est.codEstacion && e.codCentroPrd === est.codCentroPrd
          ? { ...e, estado: nuevoEstado }
          : e
      );
      this.estaciones.set(actualizadas);
      const actualizada = { ...est, estado: nuevoEstado };
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
    const s = (raw ?? '').toUpperCase().trim().replace(/\s+/g, '_');
    if (s.includes('FUERA_DE_SERVICIO') || s.includes('INACTIVO') || s.includes('INACTIVA') || s.includes('OFFLINE') || s.includes('DESACTIVADO')) return 'FUERA_DE_SERVICIO';
    if (s.includes('ACTIVO') || s.includes('ACTIVA')) return 'ACTIVA';
    return 'MANTENIMIENTO';
  }

  estadoTexto(estado: EstadoEstacion): string {
    return estado === 'FUERA_DE_SERVICIO' ? 'FUERA DE SERVICIO' : estado;
  }

  telemetriaLabel(estado: string): string {
    switch (estado) {
      case 'ACTIVA':        return 'TRANSMITIENDO';
      case 'MANTENIMIENTO': return 'EN MANTENIMIENTO';
      default:              return 'SIN SEÑAL';
    }
  }

  telemetriaBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':        return 'bg-green-100 text-green-700';
      case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-700';
      default:              return 'bg-rose-100 text-rose-700';
    }
  }

  telemetriaDotClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':        return 'bg-green-500';
      case 'MANTENIMIENTO': return 'bg-yellow-500';
      default:              return 'bg-rose-500';
    }
  }

  gpsLabel(estado: string): string {
    switch (estado) {
      case 'ACTIVA':        return 'GPS LOCK';
      case 'MANTENIMIENTO': return 'SUSPENDIDO';
      default:              return 'SIN SEÑAL';
    }
  }

  gpsClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':        return 'text-green-600';
      case 'MANTENIMIENTO': return 'text-yellow-600';
      default:              return 'text-rose-600';
    }
  }

  private mockEstaciones(): EstacionVista[] {
    return [
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-001', nomEstacion: 'Represa Arenal', coordenadaX: -84.9, coordenadaY: 10.3, estado: 'ACTIVA', tipoSensor: 'RefTek', ubicacionDetalle: 'Alajuela' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-009', nomEstacion: 'Volcán Poás', coordenadaX: -84.2, coordenadaY: 10.2, estado: 'ACTIVA', tipoSensor: 'RefTek', ubicacionDetalle: 'Sector 4' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-099', nomEstacion: 'Puerto Limón Terminal', coordenadaX: -83.0, coordenadaY: 9.99, estado: 'FUERA_DE_SERVICIO', tipoSensor: 'RefTek', ubicacionDetalle: 'Limón' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-112', nomEstacion: 'Golfito Muelle Técnico', coordenadaX: -83.1, coordenadaY: 8.64, estado: 'MANTENIMIENTO', tipoSensor: 'RefTek', ubicacionDetalle: 'Golfito' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-115', nomEstacion: 'San José Edificio Sabana', coordenadaX: -84.1, coordenadaY: 9.93, estado: 'ACTIVA', tipoSensor: 'RefTek', ubicacionDetalle: 'San José' },
    ];
  }
}
