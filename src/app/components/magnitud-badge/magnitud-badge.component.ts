import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-magnitud-badge',
  template: `
    <span [class]="badgeClass"
      class="inline-flex items-center rounded-md px-2 py-0.5 text-label-sm font-bold tabular-nums">
      Mw {{ magnitud | number:'1.1-1' }}
    </span>
  `,
  imports: [DecimalPipe]
})
export class MagnitudBadgeComponent {
  @Input() magnitud = 0;

  get badgeClass(): string {
    if (this.magnitud < 3.0) return 'bg-green-100/50 text-green-900';
    if (this.magnitud < 4.5) return 'bg-yellow-100/50 text-yellow-900';
    if (this.magnitud < 6.0) return 'bg-orange-100/50 text-orange-900';
    return 'bg-rose-100/50 text-rose-950';
  }
}
