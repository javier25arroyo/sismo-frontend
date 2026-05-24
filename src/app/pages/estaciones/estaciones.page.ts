import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { EstacionFormModalComponent } from '../../components/estacion-form-modal/estacion-form-modal.component';
import {
  ActualizarEstacionSolicitud,
  AlarmaPorEstacionRespuesta,
  CrearEstacionSolicitud,
  EstacionRespuesta,
  EstadoEstacion,
  ParametroIntensidadRespuesta
} from '../../interfaces/api.interfaces';
import { AlarmaService } from '../../services/alarma.service';
import { CentroService } from '../../services/centro.service';
import { AuthService } from '../../services/auth.service';
import { ParametroIntensidadService } from '../../services/parametro-intensidad.service';
import { EstacionesCacheService } from '../../services/estaciones-cache.service';
import { LucideAngularModule, MapPin, Satellite, Server, TriangleAlert, Wrench, CheckCircle, XCircle, Pencil, Plus, SlidersHorizontal } from 'lucide-angular';

interface EstacionVista extends EstacionRespuesta {
  tipoSensor: string;
  ubicacionDetalle: string;
}

@Component({
  standalone: true,
  selector: 'app-estaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    StatCardComponent,
    StatusBadgeComponent,
    SismoMapComponent,
    EstacionFormModalComponent,
    RouterLink,
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

  // Umbrales por estación
  alarmasEstacion       = signal<AlarmaPorEstacionRespuesta[]>([]);
  cargandoAlarmas       = signal(false);
  parametros            = signal<ParametroIntensidadRespuesta[]>([]);
  cargandoCatalogos     = signal(false);
  mensajeUmbral         = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  readonly serverIcon    = Server;
  readonly satelliteIcon = Satellite;
  readonly warningIcon   = TriangleAlert;
  readonly wrenchIcon    = Wrench;
  readonly mapPinIcon    = MapPin;
  readonly checkIcon     = CheckCircle;
  readonly xIcon         = XCircle;
  readonly editIcon      = Pencil;
  readonly plusIcon      = Plus;
  readonly slidersIcon   = SlidersHorizontal;

  constructor(
    private centroService: CentroService,
    private alarmaService: AlarmaService,
    private parametroService: ParametroIntensidadService,
    public auth: AuthService,
    private estacionesCache: EstacionesCacheService
  ) {}

  ngOnInit(): void {
    void this.cargarEstaciones();
    if (this.auth.isAdmin()) void this.cargarCatalogosUmbrales();
  }

  private async cargarEstaciones(): Promise<void> {
    try {
      const data = await this.estacionesCache.getEstaciones();
      const vistas = data.map(e => this.toVista(e));
      this.estaciones.set(vistas);
      if (vistas.length > 0) {
        this.estacionSeleccionada.set(vistas[0]);
        void this.cargarAlarmasEstacion(vistas[0]);
      }
    } catch {
      const mocks = this.mockEstaciones();
      this.estaciones.set(mocks);
      this.estacionSeleccionada.set(mocks[0]);
      this.alarmasEstacion.set([]);
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

  seleccionar(e: EstacionVista): void {
    this.estacionSeleccionada.set(e);
    void this.cargarAlarmasEstacion(e);
  }

  readonly total          = computed(() => this.estaciones().length);
  readonly enLinea        = computed(() => this.estaciones().filter(e => e.estado === 'ACTIVA').length);
  readonly enMantenimiento = computed(() => this.estaciones().filter(e => e.estado === 'MANTENIMIENTO').length);
  readonly incidencias    = computed(() => this.estaciones().filter(e => e.estado === 'FUERA_DE_SERVICIO').length);

  readonly filtradas = computed(() => {
    const q = this.busqueda().toLowerCase();
    if (!q) return this.estaciones();
    return this.estaciones().filter(e =>
      e.codEstacion.toLowerCase().includes(q) ||
      e.nomEstacion.toLowerCase().includes(q) ||
      e.ubicacionDetalle.toLowerCase().includes(q)
    );
  });

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
    if (this.guardandoEstacion()) return;

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

  // ─── Umbrales por estación ────────────────────────────────────────────────

  private async cargarAlarmasEstacion(est: EstacionVista): Promise<void> {
    this.cargandoAlarmas.set(true);
    try {
      const page = await this.alarmaService.getAlarmas({
        codCentroPrd: est.codCentroPrd,
        codEstacion: est.codEstacion,
        size: 100
      });
      this.alarmasEstacion.set(this.ordenarAlarmas(page.content));
    } catch (err) {
      this.alarmasEstacion.set([]);
      this.mostrarMensajeUmbral('error', (err as Error).message || 'No se pudieron cargar los umbrales de la estación');
    } finally {
      this.cargandoAlarmas.set(false);
    }
  }

  private async cargarCatalogosUmbrales(): Promise<void> {
    if (!this.auth.isAdmin() || this.cargandoCatalogos() || this.parametros().length > 0) return;

    this.cargandoCatalogos.set(true);
    try {
      const page = await this.parametroService.getParametros(0, 100);
      this.parametros.set(
        [...page.content].sort((a, b) => a.codParametro - b.codParametro)
      );
    } catch (err) {
      this.parametros.set([]);
      this.mostrarMensajeUmbral('error', (err as Error).message || 'No se pudieron cargar los parámetros de intensidad');
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  parametroLabel(codParametro: number): string {
    const parametro = this.parametros().find(p => p.codParametro === codParametro);
    if (!parametro) return `Parámetro ${codParametro}`;
    return `${parametro.nomParametro} (${parametro.simboloUnidad})`;
  }

  private ordenarAlarmas(alarmas: AlarmaPorEstacionRespuesta[]): AlarmaPorEstacionRespuesta[] {
    return [...alarmas].sort((a, b) =>
      a.codParametro - b.codParametro ||
      a.codUmbral.localeCompare(b.codUmbral, 'es', { numeric: true })
    );
  }

  private mostrarMensajeUmbral(tipo: 'ok' | 'error', texto: string): void {
    this.mensajeUmbral.set({ tipo, texto });
    setTimeout(() => {
      if (this.mensajeUmbral()?.texto === texto) this.mensajeUmbral.set(null);
    }, 4000);
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

  trackByEstacion(_: number, e: EstacionVista): string {
    return e.codEstacion;
  }

  trackByAlarma(_: number, a: AlarmaPorEstacionRespuesta): string {
    return `${a.codParametro}-${a.codUmbral}`;
  }
}
