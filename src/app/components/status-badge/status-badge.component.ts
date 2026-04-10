import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-status-badge',
  template: `
    <span [class]="badgeClass"
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
      <span [class]="dotClass" class="h-1.5 w-1.5 rounded-full"></span>
      {{ estado }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() estado = '';

  get badgeClass(): string {
    switch ((this.estado ?? '').toUpperCase()) {
      case 'ACTIVO':
      case 'ACTIVA':
      case 'OPERATIVO':
      case 'EN LÍNEA':
        return 'bg-green-100 text-green-700';
      case 'INACTIVO':
      case 'INACTIVA':
      case 'FALLA RED':
      case 'CRÍTICO':
      case 'OFFLINE':
        return 'bg-rose-100 text-rose-700';
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-700';
      case 'PRIORIDAD ALTA':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  get dotClass(): string {
    switch ((this.estado ?? '').toUpperCase()) {
      case 'ACTIVO':
      case 'ACTIVA':
      case 'OPERATIVO':
      case 'EN LÍNEA':
        return 'bg-green-500';
      case 'INACTIVO':
      case 'INACTIVA':
      case 'FALLA RED':
      case 'CRÍTICO':
      case 'OFFLINE':
        return 'bg-rose-500';
      case 'MANTENIMIENTO':
        return 'bg-yellow-500';
      case 'PRIORIDAD ALTA':
        return 'bg-orange-500';
      default:
        return 'bg-slate-400';
    }
  }
}
