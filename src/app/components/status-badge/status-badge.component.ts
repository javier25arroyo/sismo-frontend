import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-status-badge',
  template: `
    <span [class]="badgeClass"
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wide">
      <span [class]="dotClass" class="h-1.5 w-1.5 rounded-full"></span>
      {{ estadoLabel }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() estado = '';

  private get estadoNormalizado(): string {
    return (this.estado ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()
      .replace(/[\s-]+/g, '_');
  }

  get estadoLabel(): string {
    if (this.estadoNormalizado === 'FUERA_DE_SERVICIO') return 'FUERA DE SERVICIO';
    return this.estado;
  }

  get badgeClass(): string {
    switch (this.estadoNormalizado) {
      case 'NIVEL_1':
      case 'ACTIVO':
      case 'ACTIVA':
      case 'OPERATIVO':
      case 'EN_LINEA':
        return 'bg-green-100 text-green-700';
      case 'NIVEL_2':
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-700';
      case 'NIVEL_3':
      case 'PRIORIDAD_ALTA':
        return 'bg-orange-100 text-orange-700';
      case 'NIVEL_4':
      case 'FUERA_DE_SERVICIO':
      case 'INACTIVO':
      case 'INACTIVA':
      case 'FALLA_RED':
      case 'CRITICO':
      case 'OFFLINE':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  get dotClass(): string {
    switch (this.estadoNormalizado) {
      case 'NIVEL_1':
      case 'ACTIVO':
      case 'ACTIVA':
      case 'OPERATIVO':
      case 'EN_LINEA':
        return 'bg-green-500';
      case 'NIVEL_2':
      case 'MANTENIMIENTO':
        return 'bg-yellow-500';
      case 'NIVEL_3':
      case 'PRIORIDAD_ALTA':
        return 'bg-orange-500';
      case 'NIVEL_4':
      case 'FUERA_DE_SERVICIO':
      case 'INACTIVO':
      case 'INACTIVA':
      case 'FALLA_RED':
      case 'CRITICO':
      case 'OFFLINE':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}
