import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-magnitud-badge',
  template: `
    <span [class]="badgeClass"
      class="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold tabular-nums">
      Mw {{ magnitud | number:'1.1-1' }}
    </span>
  `,
  imports: [DecimalPipe]
})
export class MagnitudBadgeComponent {
  @Input() magnitud = 0;

  get badgeClass(): string {
    if (this.magnitud < 3.0) return 'bg-green-100 text-green-700';
    if (this.magnitud < 4.5) return 'bg-yellow-100 text-yellow-700';
    if (this.magnitud < 6.0) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }
}
