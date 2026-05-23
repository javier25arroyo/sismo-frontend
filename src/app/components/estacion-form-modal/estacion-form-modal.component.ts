import { Component, afterNextRender, effect, input, output, ElementRef, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearEstacionSolicitud, ActualizarEstacionSolicitud, EstadoEstacion } from '../../interfaces/api.interfaces';

interface DatosEstacion {
  codCentroPrd?: string;
  codEstacion?: string;
  nomEstacion?: string;
  coordenadaX?: number;
  coordenadaY?: number;
  modInst?: string;
  estado?: string;
}

interface FormEstacion {
  codCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  coordenadaX: string;
  coordenadaY: string;
  nuSerie: string;
  idCanal: string;
  tipoInstrumento: string;
  eleEstacion: string;
  tipoSuelo: string;
  condiSitio: string;
  deltaT: string;
  azimut: string;
  chn1Long: string;
  chn2Vert: string;
  chn3Trans: string;
  bitWeightCh1: string;
  bitWeightCh2: string;
  bitWeightCh3: string;
  vpuCh1: string;
  vpuCh2: string;
  vpuCh3: string;
  modInst: string;
  estado: string;
}

function formVacio(): FormEstacion {
  return {
    codCentroPrd: '', codEstacion: '', nomEstacion: '',
    coordenadaX: '', coordenadaY: '',
    nuSerie: '', idCanal: '', tipoInstrumento: '',
    eleEstacion: '', tipoSuelo: '', condiSitio: '',
    deltaT: '', azimut: '',
    chn1Long: '', chn2Vert: '', chn3Trans: '',
    bitWeightCh1: '', bitWeightCh2: '', bitWeightCh3: '',
    vpuCh1: '', vpuCh2: '', vpuCh3: '',
    modInst: '', estado: 'ACTIVA',
  };
}

@Component({
  standalone: true,
  selector: 'app-estacion-form-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './estacion-form-modal.component.html',
})
export class EstacionFormModalComponent {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly injector = inject(Injector);
  visible = input<boolean>(false);
  mode    = input<'create' | 'edit'>('create');
  datos   = input<DatosEstacion | null>(null);

  guardado  = output<{ mode: 'create'; payload: CrearEstacionSolicitud } | { mode: 'edit'; payload: ActualizarEstacionSolicitud }>();
  cancelado = output<void>();

  formData: FormEstacion = formVacio();
  mostrarAvanzado = false;

  readonly estadoOpciones = ['ACTIVA', 'MANTENIMIENTO', 'FUERA_DE_SERVICIO'];

  get titulo(): string { return this.mode() === 'create' ? 'Nueva Estación' : 'Editar Estación'; }
  get esEdicion(): boolean { return this.mode() === 'edit'; }

  constructor() {
    effect(() => {
      if (this.visible()) {
        const d    = this.datos();
        const base = formVacio();
        if (d) {
          base.codCentroPrd = d.codCentroPrd ?? '';
          base.codEstacion  = d.codEstacion  ?? '';
          base.nomEstacion  = d.nomEstacion  ?? '';
          base.coordenadaX  = d.coordenadaX  != null ? String(d.coordenadaX) : '';
          base.coordenadaY  = d.coordenadaY  != null ? String(d.coordenadaY) : '';
          base.modInst      = d.modInst      ?? '';
          base.estado       = d.estado       ?? 'ACTIVA';
        }
        this.formData        = { ...base };
        this.mostrarAvanzado = false;

        afterNextRender(() => this.focusPrimerCampo(), { injector: this.injector });
      }
    });
  }

  private focusPrimerCampo(): void {
    const selector = [
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])'
    ].join(', ');
    const first = this.el.nativeElement.querySelector<HTMLElement>(selector);
    first?.focus();
  }

  private num(v: string): number | undefined { return v !== '' ? parseFloat(v)    : undefined; }
  private int(v: string): number | undefined { return v !== '' ? parseInt(v, 10)  : undefined; }
  private str(v: string): string | undefined { return v !== '' ? v                : undefined; }

  onSubmit(): void {
    const f = this.formData;

    if (this.mode() === 'create') {
      const payload: CrearEstacionSolicitud = {
        codCentroPrd:  f.codCentroPrd,
        codEstacion:   f.codEstacion,
        nomEstacion:   f.nomEstacion,
        coordenadaX:   this.num(f.coordenadaX)!,
        coordenadaY:   this.num(f.coordenadaY)!,
        nuSerie:       this.str(f.nuSerie),
        idCanal:       this.int(f.idCanal),
        tipoInstrumento: this.str(f.tipoInstrumento),
        eleEstacion:   this.num(f.eleEstacion),
        tipoSuelo:     this.str(f.tipoSuelo),
        condiSitio:    this.str(f.condiSitio),
        deltaT:        this.num(f.deltaT),
        azimut:        this.num(f.azimut),
        chn1Long:      this.str(f.chn1Long),
        chn2Vert:      this.str(f.chn2Vert),
        chn3Trans:     this.str(f.chn3Trans),
        bitWeightCh1:  this.num(f.bitWeightCh1),
        bitWeightCh2:  this.num(f.bitWeightCh2),
        bitWeightCh3:  this.num(f.bitWeightCh3),
        vpuCh1:        this.num(f.vpuCh1),
        vpuCh2:        this.num(f.vpuCh2),
        vpuCh3:        this.num(f.vpuCh3),
        modInst:       this.str(f.modInst),
        estado:        f.estado as EstadoEstacion || undefined,
      };
      this.guardado.emit({ mode: 'create', payload });
    } else {
      const payload: ActualizarEstacionSolicitud = {
        nomEstacion:   this.str(f.nomEstacion),
        coordenadaX:   this.num(f.coordenadaX),
        coordenadaY:   this.num(f.coordenadaY),
        nuSerie:       this.str(f.nuSerie),
        idCanal:       this.int(f.idCanal),
        tipoInstrumento: this.str(f.tipoInstrumento),
        eleEstacion:   this.num(f.eleEstacion),
        tipoSuelo:     this.str(f.tipoSuelo),
        condiSitio:    this.str(f.condiSitio),
        deltaT:        this.num(f.deltaT),
        azimut:        this.num(f.azimut),
        chn1Long:      this.str(f.chn1Long),
        chn2Vert:      this.str(f.chn2Vert),
        chn3Trans:     this.str(f.chn3Trans),
        bitWeightCh1:  this.num(f.bitWeightCh1),
        bitWeightCh2:  this.num(f.bitWeightCh2),
        bitWeightCh3:  this.num(f.bitWeightCh3),
        vpuCh1:        this.num(f.vpuCh1),
        vpuCh2:        this.num(f.vpuCh2),
        vpuCh3:        this.num(f.vpuCh3),
        modInst:       this.str(f.modInst),
        estado:        this.str(f.estado),
      };
      this.guardado.emit({ mode: 'edit', payload });
    }
  }

  onCancel(): void { this.cancelado.emit(); }
}
