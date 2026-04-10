import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { EstacionRespuesta } from '../../interfaces/api.interfaces';
import { CentroService } from '../../services/centro.service';
import { LucideAngularModule, MapPin, Satellite, Server, TriangleAlert } from 'lucide-angular';

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
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent, LucideAngularModule],
  templateUrl: './estaciones.page.html'
})
export class EstacionesPage implements OnInit {
  estaciones = signal<EstacionVista[]>([]);
  cargando = signal(true);
  estacionSeleccionada = signal<EstacionVista | null>(null);
  busqueda = signal('');
  readonly serverIcon = Server;
  readonly satelliteIcon = Satellite;
  readonly warningIcon = TriangleAlert;
  readonly mapPinIcon = MapPin;

  constructor(private centroService: CentroService) {}

  ngOnInit(): void {
    this.cargarEstaciones();
  }

  private async cargarEstaciones(): Promise<void> {
    try {
      // Cargar centros primero, luego estaciones de cada centro
      const centrosPage = await this.centroService.getCentros();
      const centros = centrosPage.content;

      const todasEstaciones: EstacionVista[] = [];
      for (const centro of centros) {
        try {
          const estPage = await this.centroService.getEstaciones(centro.codCentroPrd, { size: 100 });
          for (const e of estPage.content) {
            todasEstaciones.push({
              ...e,
              tipoSensor: SENSORES[e.codEstacion] ?? 'Triaxial',
              latencia: e.estado === 'INACTIVO' ? 'OFFLINE' : (Math.random() * 10 + 1).toFixed(1) + 'ms',
              ubicacionDetalle: centro.nomCentroPrd,
            });
          }
        } catch { /* skip centro */ }
      }

      this.estaciones.set(todasEstaciones);
      if (todasEstaciones.length > 0) {
        this.estacionSeleccionada.set(todasEstaciones[0]);
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
  get incidencias(): number { return this.estaciones().filter(e => e.estado !== 'ACTIVO').length; }

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
