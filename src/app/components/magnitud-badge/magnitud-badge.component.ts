import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-magnitud-badge',
  template: `
    <span [class]="badgeClass()"
      class="inline-flex items-center rounded-md px-2 py-0.5 text-label-sm font-bold tabular-nums">
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
    if (val < 3.0) return 'bg-green-100/50 text-green-900';
    if (val < 4.5) return 'bg-yellow-100/50 text-yellow-900';
    if (val < 6.0) return 'bg-orange-100/50 text-orange-900';
    return 'bg-rose-100/50 text-rose-950';
  });
}
