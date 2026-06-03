import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Calculator,
  CheckCircle,
  Edit3,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  XCircle,
  LucideAngularModule
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  AlarmaPorEstacionRespuesta,
  CalculoUmbralEstacionRespuesta,
  CrearAlarmaPorEstacionSolicitud,
  EstacionRespuesta,
  ParametroIntensidadRespuesta,
  UmbralRespuesta
} from '../../interfaces/api.interfaces';
import { AlarmaService } from '../../services/alarma.service';
import { CentroService } from '../../services/centro.service';
import { ParametroIntensidadService } from '../../services/parametro-intensidad.service';
import { UmbralService } from '../../services/umbral.service';

const MENSAJES_UMBRAL = ['Normal', 'Alerta baja', 'Alerta media', 'Alerta alta'] as const;

interface FormUmbralEstacion {
  codCentroPrd: string;
  codEstacion: string;
  codParametro: string;
  codUmbral: string;
  limiteInferior: string;
  usarCalculoAutomatico: boolean;
  mensaje: string;
}

function formVacio(): FormUmbralEstacion {
  return {
    codCentroPrd: '',
    codEstacion: '',
    codParametro: '',
    codUmbral: '',
    limiteInferior: '',
    usarCalculoAutomatico: true,
    mensaje: '',
  };
}

@Component({
  standalone: true,
  selector: 'app-umbrales-estaciones',
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './umbrales-estaciones.page.html'
})
export class UmbralesEstacionesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly alarmaService = inject(AlarmaService);
  private readonly centroService = inject(CentroService);
  private readonly parametroService = inject(ParametroIntensidadService);
  private readonly umbralService = inject(UmbralService);

  readonly mensajesUmbral = MENSAJES_UMBRAL;
  readonly sliderIcon = SlidersHorizontal;
  readonly filterIcon = Filter;
  readonly refreshIcon = RefreshCw;
  readonly plusIcon = Plus;
  readonly editIcon = Edit3;
  readonly trashIcon = Trash2;
  readonly calculatorIcon = Calculator;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;
  readonly loaderIcon = Loader2;

  alarmas = signal<AlarmaPorEstacionRespuesta[]>([]);
  estaciones = signal<EstacionRespuesta[]>([]);
  parametros = signal<ParametroIntensidadRespuesta[]>([]);
  umbralesPorParametro = signal<Record<number, UmbralRespuesta[]>>({});

  cargando = signal(true);
  cargandoCatalogos = signal(true);
  guardando = signal(false);
  eliminando = signal(false);
  calculando = signal(false);

  pagina = signal(0);
  readonly pageSize = 25;

  filtroCentro = signal('');
  filtroEstacion = signal('');
  filtroParametro = signal('');
  filtroUmbral = signal('');

  modoFormulario = signal<'create' | 'edit'>('create');
  form = signal<FormUmbralEstacion>(formVacio());
  alarmaEditando = signal<AlarmaPorEstacionRespuesta | null>(null);
  alarmaEliminar = signal<AlarmaPorEstacionRespuesta | null>(null);
  calculo = signal<CalculoUmbralEstacionRespuesta | null>(null);
  mensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  readonly alarmasFiltradas = computed(() => {
    const parametro = Number(this.filtroParametro());
    const umbral = this.filtroUmbral().trim();

    return this.alarmas().filter(alarma => {
      const coincideParametro = !this.filtroParametro() || alarma.codParametro === parametro;
      const coincideUmbral = !umbral || alarma.codUmbral === umbral;
      return coincideParametro && coincideUmbral;
    });
  });

  readonly totalElementos = computed(() => this.alarmasFiltradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalElementos() / this.pageSize)));
  readonly alarmasPagina = computed(() => {
    const inicio = this.pagina() * this.pageSize;
    return this.alarmasFiltradas().slice(inicio, inicio + this.pageSize);
  });

  readonly estacionesDisponibles = computed(() => {
    return [...this.estaciones()].sort((a, b) =>
      a.codCentroPrd.localeCompare(b.codCentroPrd) ||
      a.codEstacion.localeCompare(b.codEstacion, 'es', { numeric: true })
    );
  });

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    this.filtroCentro.set(query.get('codCentroPrd') ?? '');
    this.filtroEstacion.set(query.get('codEstacion') ?? '');
    void this.cargarTodo();
  }

  async cargarTodo(): Promise<void> {
    await this.cargarCatalogos();
    await this.cargarAlarmas();

    const centro = this.filtroCentro();
    const estacion = this.filtroEstacion();
    if (centro && estacion) {
      this.iniciarCrear({ codCentroPrd: centro, codEstacion: estacion });
    }
  }

  async cargarCatalogos(): Promise<void> {
    this.cargandoCatalogos.set(true);
    try {
      const [estacionesPage, parametrosPage] = await Promise.all([
        this.centroService.getTodasEstaciones({ size: 500 }),
        this.parametroService.getParametros(0, 100)
      ]);

      this.estaciones.set(estacionesPage.content);
      const parametros = [...parametrosPage.content].sort((a, b) => a.codParametro - b.codParametro);
      this.parametros.set(parametros);

      const pares = await Promise.all(
        parametros.map(async parametro => {
          try {
            const umbrales = await this.umbralService.getUmbralesPorParametro(parametro.codParametro);
            return [parametro.codParametro, this.ordenarUmbrales(umbrales)] as const;
          } catch {
            return [parametro.codParametro, []] as const;
          }
        })
      );
      this.umbralesPorParametro.set(Object.fromEntries(pares));
    } catch (err) {
      this.mostrarMensaje('error', (err as Error).message || 'No se pudieron cargar los catálogos');
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  async cargarAlarmas(): Promise<void> {
    this.cargando.set(true);
    try {
      const filtros = {
        codCentroPrd: this.filtroCentro().trim() || undefined,
        codEstacion: this.filtroEstacion().trim() || undefined,
        size: 500
      };
      const primera = await this.alarmaService.getAlarmas({
        ...filtros,
        page: 0
      });

      const restantes = await Promise.all(
        Array.from({ length: Math.max(primera.totalPages - 1, 0) }, (_, index) =>
          this.alarmaService.getAlarmas({
            ...filtros,
            page: index + 1
          })
        )
      );

      this.alarmas.set(this.ordenarAlarmas([
        ...primera.content,
        ...restantes.flatMap(page => page.content)
      ]));
      this.pagina.set(0);
    } catch (err) {
      this.alarmas.set([]);
      this.mostrarMensaje('error', (err as Error).message || 'No se pudieron cargar los umbrales por estación');
    } finally {
      this.cargando.set(false);
    }
  }

  aplicarFiltros(): void {
    void this.cargarAlarmas();
  }

  limpiarFiltros(): void {
    this.filtroCentro.set('');
    this.filtroEstacion.set('');
    this.filtroParametro.set('');
    this.filtroUmbral.set('');
    void this.cargarAlarmas();
  }

  irPagina(delta: number): void {
    const siguiente = this.pagina() + delta;
    if (siguiente < 0 || siguiente >= this.totalPaginas()) return;
    this.pagina.set(siguiente);
  }

  iniciarCrear(preseleccion?: { codCentroPrd: string; codEstacion: string }): void {
    const estacion = preseleccion
      ? this.estaciones().find(e =>
          e.codCentroPrd === preseleccion.codCentroPrd && e.codEstacion === preseleccion.codEstacion
        )
      : this.estacionesDisponibles()[0];
    const parametro = this.parametros()[0];
    const umbral = parametro ? this.umbralesParametro(parametro.codParametro)[0] : null;

    this.modoFormulario.set('create');
    this.alarmaEditando.set(null);
    this.calculo.set(null);
    this.form.set({
      codCentroPrd: estacion?.codCentroPrd ?? preseleccion?.codCentroPrd ?? '',
      codEstacion: estacion?.codEstacion ?? preseleccion?.codEstacion ?? '',
      codParametro: parametro ? String(parametro.codParametro) : '',
      codUmbral: umbral?.codUmbral ?? '',
      limiteInferior: '',
      usarCalculoAutomatico: true,
      mensaje: '',
    });
  }

  editar(alarma: AlarmaPorEstacionRespuesta): void {
    const global = this.umbralGlobal(alarma.codParametro, alarma.codUmbral);
    this.modoFormulario.set('edit');
    this.alarmaEditando.set(alarma);
    this.calculo.set(null);
    this.form.set({
      codCentroPrd: alarma.codCentroPrd,
      codEstacion: alarma.codEstacion,
      codParametro: String(alarma.codParametro),
      codUmbral: alarma.codUmbral,
      limiteInferior: this.formatearNumeroInput(alarma.limiteInferior),
      usarCalculoAutomatico: false,
      mensaje: global?.mensaje ?? '',
    });
  }

  cancelarFormulario(): void {
    this.modoFormulario.set('create');
    this.alarmaEditando.set(null);
    this.calculo.set(null);
    this.form.set(formVacio());
  }

  setFiltroCentro(ev: Event): void {
    this.filtroCentro.set((ev.target as HTMLInputElement).value);
  }

  setFiltroEstacion(ev: Event): void {
    this.filtroEstacion.set((ev.target as HTMLInputElement).value);
  }

  setFiltroParametro(ev: Event): void {
    this.filtroParametro.set((ev.target as HTMLSelectElement).value);
    this.filtroUmbral.set('');
    this.pagina.set(0);
  }

  setFiltroUmbral(ev: Event): void {
    this.filtroUmbral.set((ev.target as HTMLSelectElement).value);
    this.pagina.set(0);
  }

  setFormEstacion(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    const [codCentroPrd, codEstacion] = raw.split('|');
    this.calculo.set(null);
    this.form.update(form => ({ ...form, codCentroPrd, codEstacion }));
  }

  setFormParametro(ev: Event): void {
    const codParametro = Number((ev.target as HTMLSelectElement).value);
    const umbral = this.umbralesParametro(codParametro)[0];
    this.calculo.set(null);
    this.form.update(form => ({
      ...form,
      codParametro: Number.isFinite(codParametro) ? String(codParametro) : '',
      codUmbral: umbral?.codUmbral ?? '',
      limiteInferior: ''
    }));
  }

  setFormUmbral(ev: Event): void {
    this.calculo.set(null);
    this.form.update(form => ({ ...form, codUmbral: (ev.target as HTMLSelectElement).value, limiteInferior: '' }));
  }

  setLimite(ev: Event): void {
    this.calculo.set(null);
    this.form.update(form => ({ ...form, limiteInferior: (ev.target as HTMLInputElement).value }));
  }

  setUsarCalculoAutomatico(ev: Event): void {
    this.form.update(form => ({ ...form, usarCalculoAutomatico: (ev.target as HTMLInputElement).checked }));
  }

  setMensaje(ev: Event): void {
    this.form.update(form => ({ ...form, mensaje: (ev.target as HTMLSelectElement).value }));
  }

  async previsualizarCalculo(): Promise<void> {
    const seleccion = this.seleccionFormulario();
    if (!seleccion) {
      this.mostrarMensaje('error', 'Selecciona estación, parámetro y nivel de umbral');
      return;
    }

    this.calculando.set(true);
    try {
      const calculo = await this.umbralService.calcularUmbralEstacion(
        seleccion.codCentroPrd,
        seleccion.codEstacion,
        seleccion.codParametro,
        seleccion.codUmbral
      );
      this.calculo.set(calculo);
      this.form.update(form => ({
        ...form,
        limiteInferior: this.formatearNumeroInput(calculo.limiteInferiorCalculado)
      }));
    } catch (err) {
      this.mostrarMensaje('error', (err as Error).message || 'No se pudo calcular el umbral');
    } finally {
      this.calculando.set(false);
    }
  }

  async guardar(ev: Event): Promise<void> {
    ev.preventDefault();
    if (this.guardando()) return;

    const seleccion = this.seleccionFormulario();
    if (!seleccion) {
      this.mostrarMensaje('error', 'Selecciona estación, parámetro y nivel de umbral');
      return;
    }

    const form = this.form();
    let limiteInferior: number | null = null;
    if (!form.usarCalculoAutomatico) {
      limiteInferior = this.parsearLimite(form.limiteInferior);
      if (limiteInferior === null) {
        this.mostrarMensaje('error', 'El límite inferior debe ser mayor a cero');
        return;
      }
    }

    this.guardando.set(true);
    try {
      if (this.modoFormulario() === 'edit') {
        if (form.usarCalculoAutomatico) {
          await this.previsualizarCalculo();
          limiteInferior = this.calculo()?.limiteInferiorCalculado ?? null;
        }

        if (limiteInferior === null) {
          this.mostrarMensaje('error', 'No hay un límite calculado para guardar');
          return;
        }

        await this.alarmaService.actualizarAlarma(
          seleccion.codCentroPrd,
          seleccion.codEstacion,
          seleccion.codParametro,
          seleccion.codUmbral,
          { limiteInferior }
        );

        const global = this.umbralGlobal(seleccion.codParametro, seleccion.codUmbral);
        if (global && form.mensaje) {
          await this.umbralService.actualizarUmbral(
            seleccion.codParametro,
            seleccion.codUmbral,
            { limiteInferior: global.limiteInferior, mensaje: form.mensaje }
          );
          const actualizados = await this.umbralService.getUmbralesPorParametro(seleccion.codParametro);
          this.umbralesPorParametro.update(mapa => ({
            ...mapa,
            [seleccion.codParametro]: this.ordenarUmbrales(actualizados)
          }));
        }

        this.mostrarMensaje('ok', 'Umbral por estación actualizado');
      } else {
        const solicitud: CrearAlarmaPorEstacionSolicitud = {
          codCentroPrd: seleccion.codCentroPrd,
          codEstacion: seleccion.codEstacion,
          codParametro: seleccion.codParametro,
          codUmbral: seleccion.codUmbral,
          limiteInferior: form.usarCalculoAutomatico ? null : limiteInferior
        };
        await this.alarmaService.crearAlarma(solicitud);
        this.mostrarMensaje('ok', 'Umbral por estación creado');
      }

      await this.cargarAlarmas();
      this.cancelarFormulario();
    } catch (err) {
      this.mostrarMensaje('error', (err as Error).message || 'No se pudo guardar el umbral por estación');
    } finally {
      this.guardando.set(false);
    }
  }

  pedirEliminar(alarma: AlarmaPorEstacionRespuesta): void {
    this.alarmaEliminar.set(alarma);
  }

  cancelarEliminar(): void {
    this.alarmaEliminar.set(null);
  }

  async confirmarEliminar(): Promise<void> {
    const alarma = this.alarmaEliminar();
    if (!alarma || this.eliminando()) return;

    this.eliminando.set(true);
    try {
      await this.alarmaService.eliminarAlarma(
        alarma.codCentroPrd,
        alarma.codEstacion,
        alarma.codParametro,
        alarma.codUmbral
      );
      this.mostrarMensaje('ok', 'Umbral por estación eliminado');
      this.alarmaEliminar.set(null);
      if (this.alarmaEditando()?.codCentroPrd === alarma.codCentroPrd &&
          this.alarmaEditando()?.codEstacion === alarma.codEstacion &&
          this.alarmaEditando()?.codParametro === alarma.codParametro &&
          this.alarmaEditando()?.codUmbral === alarma.codUmbral) {
        this.cancelarFormulario();
      }
      await this.cargarAlarmas();
    } catch (err) {
      this.mostrarMensaje('error', (err as Error).message || 'No se pudo eliminar el umbral por estación');
    } finally {
      this.eliminando.set(false);
    }
  }

  estacionKey(estacion: Pick<EstacionRespuesta, 'codCentroPrd' | 'codEstacion'>): string {
    return `${estacion.codCentroPrd}|${estacion.codEstacion}`;
  }

  estacionLabel(codCentroPrd: string, codEstacion: string): string {
    const estacion = this.estaciones().find(e =>
      e.codCentroPrd === codCentroPrd && e.codEstacion === codEstacion
    );
    return estacion ? `${estacion.nomEstacion}` : 'Estación no cargada';
  }

  parametroLabel(codParametro: number): string {
    const parametro = this.parametros().find(p => p.codParametro === codParametro);
    return parametro ? `${parametro.nomParametro} (${parametro.simboloUnidad})` : `Parámetro ${codParametro}`;
  }

  parametroSimbolo(codParametro: number): string {
    return this.parametros().find(p => p.codParametro === codParametro)?.simboloUnidad ?? '';
  }

  umbralesParametro(codParametro: number): UmbralRespuesta[] {
    return this.umbralesPorParametro()[codParametro] ?? [];
  }

  umbralesFiltro(): UmbralRespuesta[] {
    const codParametro = Number(this.filtroParametro());
    if (!Number.isFinite(codParametro)) return [];
    return this.umbralesParametro(codParametro);
  }

  umbralesFormulario(): UmbralRespuesta[] {
    const codParametro = Number(this.form().codParametro);
    if (!Number.isFinite(codParametro)) return [];
    return this.umbralesParametro(codParametro);
  }

  umbralGlobal(codParametro: number, codUmbral: string): UmbralRespuesta | null {
    return this.umbralesParametro(codParametro).find(u => u.codUmbral === codUmbral) ?? null;
  }

  claseColorUmbral(color?: string): string {
    const normalizado = (color ?? '').toUpperCase();
    if (normalizado.includes('VERDE')) return 'bg-green-100 text-green-700';
    if (normalizado.includes('AMARILLO')) return 'bg-yellow-100 text-yellow-700';
    if (normalizado.includes('NARANJA')) return 'bg-orange-100 text-orange-700';
    if (normalizado.includes('ROJO')) return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  }

  mensajeEliminar(): string {
    const alarma = this.alarmaEliminar();
    if (!alarma) return '';
    return `¿Eliminar ${alarma.codUmbral} del parámetro ${alarma.codParametro} para ${alarma.codCentroPrd}-${alarma.codEstacion}?`;
  }

  private seleccionFormulario(): {
    codCentroPrd: string;
    codEstacion: string;
    codParametro: number;
    codUmbral: string;
  } | null {
    const form = this.form();
    const codParametro = Number(form.codParametro);
    const codUmbral = form.codUmbral.trim();

    if (!form.codCentroPrd || !form.codEstacion || !Number.isFinite(codParametro) || !codUmbral) {
      return null;
    }

    return {
      codCentroPrd: form.codCentroPrd,
      codEstacion: form.codEstacion,
      codParametro,
      codUmbral
    };
  }

  private ordenarAlarmas(alarmas: AlarmaPorEstacionRespuesta[]): AlarmaPorEstacionRespuesta[] {
    return [...alarmas].sort((a, b) =>
      a.codCentroPrd.localeCompare(b.codCentroPrd) ||
      a.codEstacion.localeCompare(b.codEstacion, 'es', { numeric: true }) ||
      a.codParametro - b.codParametro ||
      a.codUmbral.localeCompare(b.codUmbral, 'es', { numeric: true })
    );
  }

  private ordenarUmbrales(umbrales: UmbralRespuesta[]): UmbralRespuesta[] {
    return [...umbrales].sort((a, b) =>
      a.codUmbral.localeCompare(b.codUmbral, 'es', { numeric: true })
    );
  }

  private parsearLimite(valor: string): number | null {
    const numero = Number(valor.replace(',', '.'));
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  private formatearNumeroInput(valor: number): string {
    return Number.isFinite(valor) ? String(Number(valor.toFixed(6))) : '';
  }

  private mostrarMensaje(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje.set({ tipo, texto });
    setTimeout(() => {
      if (this.mensaje()?.texto === texto) this.mensaje.set(null);
    }, 4500);
  }
}
