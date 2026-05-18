import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acelerograma-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-hidden border-y border-slate-200 bg-white" [style.height]="height()">
      <!-- Imagen estática -->
      <div 
        class="h-full w-full bg-no-repeat bg-contain bg-center"
        [style.background-image]="'url(/acelerogramas/acelerograma1.png)'"
        style="mix-blend-multiply">
      </div>
      
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
