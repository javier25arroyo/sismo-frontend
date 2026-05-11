import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-magnitud-badge',
  template: `
    <span [class]="badgeClass()"
      class="inline-flex items-center rounded-md px-2.5 py-1 text-label-sm font-bold tabular-nums ring-1">
      Mw {{ magnitud() | number:'1.1-1' }}
    </span>
  `,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MagnitudBadgeComponent {
  magnitud = input<number>(0);

  badgeClass = computed(() => {
    const val = this.magnitud();
    if (val < 3.0) return 'bg-green-50 text-green-900 ring-green-200';
    if (val < 4.5) return 'bg-amber-50 text-amber-900 ring-amber-200';
    if (val < 6.0) return 'bg-orange-50 text-orange-900 ring-orange-200';
    return 'bg-rose-50 text-rose-950 ring-rose-200';
  });
}
