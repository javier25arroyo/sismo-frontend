import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-paginacion',
  imports: [CommonModule],
  template: `
    <nav aria-label="Paginación" class="flex items-center justify-between text-sm text-slate-600">
      <span class="text-xs text-slate-400">
        Página {{ paginaActual }} de {{ totalPaginas }}
      </span>
      <div class="flex items-center gap-1">
        <button
          (click)="ir(paginaActual - 1)"
          [disabled]="paginaActual <= 1"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior">
          ‹
        </button>
        <ng-container *ngFor="let p of pages">
          <button
            (click)="ir(p)"
            [class]="p === paginaActual
              ? 'bg-sky-600 text-white border-sky-600'
              : 'border-slate-200 hover:bg-slate-50'"
            class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition">
            {{ p }}
          </button>
        </ng-container>
        <button
          (click)="ir(paginaActual + 1)"
          [disabled]="paginaActual >= totalPaginas"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página siguiente">
          ›
        </button>
      </div>
    </nav>
  `
})
export class PaginacionComponent {
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Output() paginaCambio = new EventEmitter<number>();

  get pages(): number[] {
    const max = Math.min(this.totalPaginas, 5);
    let start = Math.max(1, this.paginaActual - 2);
    const end = Math.min(this.totalPaginas, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ir(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaCambio.emit(p);
    }
  }
}
