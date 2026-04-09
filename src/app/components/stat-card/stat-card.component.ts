import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [CommonModule],
  template: `
    <div [class]="cardClass" class="rounded-xl p-5 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-widest" [class]="labelClass">{{ label }}</p>
        <p class="mt-1 text-3xl font-bold tabular-nums" [class]="valueClass">
          {{ value }}<span *ngIf="unit" class="ml-1 text-base font-medium">{{ unit }}</span>
        </p>
        <p *ngIf="sublabel" class="mt-1 text-xs" [class]="sublabelClass">{{ sublabel }}</p>
      </div>
      <div *ngIf="icon" [class]="iconWrapClass" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
        {{ icon }}
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() unit = '';
  @Input() sublabel = '';
  @Input() icon = '';
  @Input() variant: StatCardVariant = 'default';

  get cardClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-green-50 border border-green-200';
      case 'warning': return 'bg-yellow-50 border border-yellow-200';
      case 'danger':  return 'bg-rose-50 border border-rose-200';
      default:        return 'bg-white border border-slate-200 shadow-sm';
    }
  }

  get labelClass(): string {
    switch (this.variant) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger':  return 'text-rose-600';
      default:        return 'text-slate-500';
    }
  }

  get valueClass(): string {
    switch (this.variant) {
      case 'success': return 'text-green-900';
      case 'warning': return 'text-yellow-900';
      case 'danger':  return 'text-rose-900';
      default:        return 'text-slate-900';
    }
  }

  get sublabelClass(): string {
    switch (this.variant) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger':  return 'text-rose-600';
      default:        return 'text-slate-500';
    }
  }

  get iconWrapClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'danger':  return 'bg-rose-100 text-rose-600';
      default:        return 'bg-slate-100 text-slate-500';
    }
  }
}
