import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acelerograma-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-hidden border-y border-slate-100 bg-white" [style.height]="height()">
      <!-- Imagen estática -->
      <div 
        class="h-full w-full bg-no-repeat bg-contain bg-center"
        [style.background-image]="'url(/acelerogramas/acelerograma1.png)'"
        style="mix-blend-multiply">
      </div>
      
      <!-- Decoración minimalista tipo papel milimetrado muy tenue -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]" 
           style="background-image: radial-gradient(#000 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
  `,
  styles: [``]
})
export class AcelerogramaLiveComponent {
  height = input<string>('200px');
}
