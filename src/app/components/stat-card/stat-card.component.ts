import { Component, input, computed, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="cardClass()" class="flex h-full items-center justify-between gap-4 rounded-lg border p-5 shadow-sm">
      <div class="min-w-0">
        <p class="text-label-sm font-semibold uppercase tracking-wide" [class]="labelClass()">{{ label() }}</p>
        <p class="mt-2 text-3xl font-bold tabular-nums sm:text-4xl" [class]="valueClass()">
          {{ value() }}<span *ngIf="unit()" class="ml-1 text-base font-medium">{{ unit() }}</span>
        </p>
        <p *ngIf="sublabel()" class="mt-1 text-body-md" [class]="sublabelClass()">{{ sublabel() }}</p>
      </div>
      <div *ngIf="icon()" [class]="iconWrapClass()" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl ring-1">
        <i-lucide [img]="icon()" size="20" class="text-current"></i-lucide>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @HostBinding('class') hostClass = 'block';

  label = input<string>('');
  value = input<string | number>('');
  unit = input<string>('');
  sublabel = input<string>('');
  icon = input<LucideIconData | undefined>(undefined);
  variant = input<StatCardVariant>('default');

  cardClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'border-green-200 bg-green-50/80';
      case 'warning': return 'border-amber-200 bg-amber-50/80';
      case 'danger':  return 'border-rose-200 bg-rose-50/80';
      default:        return 'border-slate-200 bg-surface';
    }
  });

  labelClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-800';
      case 'warning': return 'text-amber-800';
      case 'danger':  return 'text-rose-800';
      default:        return 'text-slate-500';
    }
  });

  valueClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-950';
      case 'warning': return 'text-amber-950';
      case 'danger':  return 'text-rose-950';
      default:        return 'text-text-primary';
    }
  });

  sublabelClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-amber-700';
      case 'danger':  return 'text-rose-700';
      default:        return 'text-slate-600';
    }
  });

  iconWrapClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-green-100 text-green-800 ring-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 ring-amber-200';
      case 'danger':  return 'bg-rose-100 text-rose-800 ring-rose-200';
      default:        return 'bg-surface-container-low text-primary ring-slate-200';
    }
  });
}
