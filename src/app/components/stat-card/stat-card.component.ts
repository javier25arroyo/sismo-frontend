import { Component, input, computed, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  standalone: true,
  selector: 'app-stat-card',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="cardClass()" class="rounded-xl p-5 flex items-center justify-between gap-4 h-full">
      <div class="min-w-0">
        <p class="text-label-sm font-semibold uppercase tracking-wide" [class]="labelClass()">{{ label() }}</p>
        <p class="mt-1 text-display-lg font-bold tabular-nums tracking-tight" [class]="valueClass()">
          {{ value() }}<span *ngIf="unit()" class="ml-1 text-base font-medium">{{ unit() }}</span>
        </p>
        <p *ngIf="sublabel()" class="mt-1 text-body-md" [class]="sublabelClass()">{{ sublabel() }}</p>
      </div>
      <div *ngIf="icon()" [class]="iconWrapClass()" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
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
      case 'success': return 'bg-green-100/50';
      case 'warning': return 'bg-yellow-100/50';
      case 'danger':  return 'bg-rose-100/50';
      default:        return 'bg-surface';
    }
  });

  labelClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-800';
      case 'warning': return 'text-yellow-800';
      case 'danger':  return 'text-rose-800';
      default:        return 'text-slate-500';
    }
  });

  valueClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-950';
      case 'warning': return 'text-yellow-950';
      case 'danger':  return 'text-rose-950';
      default:        return 'text-text-primary';
    }
  });

  sublabelClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'danger':  return 'text-rose-700';
      default:        return 'text-slate-600';
    }
  });

  iconWrapClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-green-200/50 text-green-800';
      case 'warning': return 'bg-yellow-200/50 text-yellow-800';
      case 'danger':  return 'bg-rose-200/50 text-rose-800';
      default:        return 'bg-surface-container-highest text-primary';
    }
  });
}
