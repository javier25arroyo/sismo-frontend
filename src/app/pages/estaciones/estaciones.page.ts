import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { EstacionMiniMapComponent } from '../../components/estacion-mini-map/estacion-mini-map.component';
import { EstacionFormModalComponent } from '../../components/estacion-form-modal/estacion-form-modal.component';
import { EstacionRespuesta, EstadoEstacion, CrearEstacionSolicitud, ActualizarEstacionSolicitud } from '../../interfaces/api.interfaces';
import { CentroService } from '../../services/centro.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, MapPin, Satellite, Server, TriangleAlert, Wrench, CheckCircle, XCircle, Pencil, Plus } from 'lucide-angular';

interface EstacionVista extends EstacionRespuesta {
  tipoSensor: string;
  ubicacionDetalle: string;
}

@Component({
  standalone: true,
  selector: 'app-estaciones',
  imports: [
    CommonModule,
    StatCardComponent,
    StatusBadgeComponent,
    EstacionMiniMapComponent,
    EstacionFormModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './estaciones.page.html'
})
export class EstacionesPage implements OnInit {
  estaciones            = signal<EstacionVista[]>([]);
  cargando              = signal(true);
  estacionSeleccionada  = signal<EstacionVista | null>(null);
  busqueda              = signal('');
  cambiandoEstado       = signal(false);
  mostrarDropdown       = signal(false);
  mensajeEstado         = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // CRUD admin
  mostrarModal          = signal(false);
  modoModal             = signal<'create' | 'edit'>('create');
  estacionParaEditar    = signal<EstacionVista | null>(null);
  guardandoEstacion     = signal(false);
  mensajeCrud           = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  readonly serverIcon    = Server;
  readonly satelliteIcon = Satellite;
  readonly warningIcon   = TriangleAlert;
  readonly wrenchIcon    = Wrench;
  readonly mapPinIcon    = MapPin;
  readonly checkIcon     = CheckCircle;
  readonly xIcon         = XCircle;
  readonly editIcon      = Pencil;
  readonly plusIcon      = Plus;

  constructor(private centroService: CentroService, public auth: AuthService) {}

  ngOnInit(): void { this.cargarEstaciones(); }

  private async cargarEstaciones(): Promise<void> {
    try {
      const page = await this.centroService.getTodasEstaciones({ size: 500 });
      const vistas = page.content.map(e => this.toVista(e));
      this.estaciones.set(vistas);
      if (vistas.length > 0) this.estacionSeleccionada.set(vistas[0]);
    } catch {
      const mocks = this.mockEstaciones();
      this.estaciones.set(mocks);
      this.estacionSeleccionada.set(mocks[0]);
    } finally {
      this.cargando.set(false);
    }
  }

  private toVista(e: EstacionRespuesta): EstacionVista {
    return {
      ...e,
      estado: this.normalizarEstado(e.estado),
      tipoSensor: e.modInst ?? 'N/A',
      ubicacionDetalle: e.codCentroPrd,
    };
  }

  seleccionar(e: EstacionVista): void { this.estacionSeleccionada.set(e); }

  get total(): number          { return this.estaciones().length; }
  get enLinea(): number        { return this.estaciones().filter(e => e.estado === 'ACTIVA').length; }
  get enMantenimiento(): number { return this.estaciones().filter(e => e.estado === 'MANTENIMIENTO').length; }
  get incidencias(): number    { return this.estaciones().filter(e => e.estado === 'FUERA_DE_SERVICIO').length; }

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
      await this.centroService.actualizarEstacion(est.codCentroPrd, est.codEstacion, { estado: nuevoEstado });
      const actualizadas = this.estaciones().map(e =>
        e.codEstacion === est.codEstacion && e.codCentroPrd === est.codCentroPrd
          ? { ...e, estado: nuevoEstado } : e
      );
      this.estaciones.set(actualizadas);
      this.estacionSeleccionada.set({ ...est, estado: nuevoEstado });
      this.mensajeEstado.set({ tipo: 'ok', texto: 'Estado actualizado correctamente' });
    } catch {
      this.mensajeEstado.set({ tipo: 'error', texto: 'No se pudo actualizar el estado' });
    } finally {
      this.cambiandoEstado.set(false);
      setTimeout(() => this.mensajeEstado.set(null), 3000);
    }
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  abrirCrear(): void {
    this.modoModal.set('create');
    this.estacionParaEditar.set(null);
    this.mostrarModal.set(true);
  }

  abrirEditar(est: EstacionVista): void {
    this.modoModal.set('edit');
    this.estacionParaEditar.set(est);
    this.mostrarModal.set(true);
  }

  cerrarModal(): void { this.mostrarModal.set(false); }

  async onGuardado(event: { mode: 'create'; payload: CrearEstacionSolicitud } | { mode: 'edit'; payload: ActualizarEstacionSolicitud }): Promise<void> {
    this.guardandoEstacion.set(true);
    this.mensajeCrud.set(null);
    try {
      if (event.mode === 'create') {
        const resp  = await this.centroService.crearEstacion(event.payload);
        const vista = this.toVista(resp);
        this.estaciones.update(es => [...es, vista]);
        this.estacionSeleccionada.set(vista);
        this.mensajeCrud.set({ tipo: 'ok', texto: 'Estación creada correctamente' });
      } else {
        const est  = this.estacionParaEditar()!;
        const resp = await this.centroService.actualizarEstacion(est.codCentroPrd, est.codEstacion, event.payload);
        const vista = this.toVista(resp);
        this.estaciones.update(es => es.map(e =>
          e.codEstacion === est.codEstacion && e.codCentroPrd === est.codCentroPrd ? vista : e
        ));
        this.estacionSeleccionada.set(vista);
        this.mensajeCrud.set({ tipo: 'ok', texto: 'Estación actualizada correctamente' });
      }
      this.mostrarModal.set(false);
    } catch {
      this.mensajeCrud.set({ tipo: 'error', texto: 'Error al guardar la estación' });
    } finally {
      this.guardandoEstacion.set(false);
      setTimeout(() => this.mensajeCrud.set(null), 3000);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

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
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-001', nomEstacion: 'Represa Arenal',          coordenadaX: -84.9, coordenadaY: 10.3,  estado: 'ACTIVA',            modInst: undefined, tipoSensor: 'N/A', ubicacionDetalle: 'ICE' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-009', nomEstacion: 'Volcán Poás',              coordenadaX: -84.2, coordenadaY: 10.2,  estado: 'ACTIVA',            modInst: undefined, tipoSensor: 'N/A', ubicacionDetalle: 'ICE' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-099', nomEstacion: 'Puerto Limón Terminal',    coordenadaX: -83.0, coordenadaY:  9.99, estado: 'FUERA_DE_SERVICIO', modInst: undefined, tipoSensor: 'N/A', ubicacionDetalle: 'ICE' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-112', nomEstacion: 'Golfito Muelle Técnico',  coordenadaX: -83.1, coordenadaY:  8.64, estado: 'MANTENIMIENTO',     modInst: undefined, tipoSensor: 'N/A', ubicacionDetalle: 'ICE' },
      { codCentroPrd: 'ICE', codEstacion: 'ICE-ACC-115', nomEstacion: 'San José Edificio Sabana', coordenadaX: -84.1, coordenadaY:  9.93, estado: 'ACTIVA',            modInst: undefined, tipoSensor: 'N/A', ubicacionDetalle: 'ICE' },
    ];
  }
}
