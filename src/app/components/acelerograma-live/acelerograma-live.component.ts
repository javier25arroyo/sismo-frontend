import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acelerograma-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-hidden border-y border-slate-200 bg-white" [style.height]="height()">
      <picture>
        <source srcset="/acelerogramas/acelerograma1.webp" type="image/webp">
        <img
          src="/acelerogramas/acelerograma1.png"
          alt="Acelerograma sísmico en tiempo real"
          fetchpriority="high"
          loading="eager"
          width="800"
          height="280"
          class="h-full w-full object-contain mix-blend-multiply"
        >
      </picture>
      <!-- Trama técnica tenue para lectura de señal. -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]"
           style="background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
    </div>
  `,
  styles: [``]
})
export class AcelerogramaLiveComponent {
  height = input<string>('200px');
}
