import { Component, input, signal, computed, Signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-status-badge',
  template: `
    <span [class]="badgeClass()"
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wide">
      <span [class]="dotClass()" class="h-1.5 w-1.5 rounded-full"></span>
      {{ estadoLabel() }}
    </span>
  `
})
export class StatusBadgeComponent {
  estado = input<string>('');

  private estadoNormalizado = computed(() =>
    (this.estado() ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()
      .replace(/[\s-]+/g, '_')
  );

  estadoLabel = computed(() => {
    if (this.estadoNormalizado() === 'FUERA_DE_SERVICIO') return 'FUERA DE SERVICIO';
    return this.estado();
  });

  badgeClass = computed(() => {
    switch (this.estadoNormalizado()) {
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
  });

  dotClass = computed(() => {
    switch (this.estadoNormalizado()) {
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
  });
}
