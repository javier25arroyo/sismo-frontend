import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-paginacion',
  imports: [CommonModule],
  template: `
    <nav
      aria-label="Paginación"
      class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-body-md text-text-primary transition-colors duration-300"
    >
      <span class="text-label-sm uppercase tracking-wide text-slate-500 tabular-nums">
        Página {{ paginaActual() }} de {{ totalPaginas() }}
      </span>
      <div class="flex items-center gap-1.5 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/70">
        <button
          type="button"
          (click)="ir(paginaActual() - 1)"
          [disabled]="paginaActual() <= 1"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:translate-y-0 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          aria-label="Página anterior">
          ‹
        </button>
        <ng-container *ngFor="let p of pages()">
          <button
            type="button"
            (click)="ir(p)"
            [attr.aria-current]="p === paginaActual() ? 'page' : null"
            [class]="p === paginaActual()
              ? 'gradient-cta text-white shadow-sm scale-[1.02]'
              : 'text-slate-600 hover:-translate-y-px hover:bg-slate-100 hover:text-slate-800'"
            class="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-label-sm font-semibold tabular-nums transition-all duration-200 ease-out active:scale-95">
            {{ p }}
          </button>
        </ng-container>
        <button
          type="button"
          (click)="ir(paginaActual() + 1)"
          [disabled]="paginaActual() >= totalPaginas()"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:translate-y-0 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          aria-label="Página siguiente">
          ›
        </button>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginacionComponent {
  paginaActual = input<number>(1);
  totalPaginas = input<number>(1);
  paginaCambio = output<number>();

  pages = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaActual();
    const max = Math.min(total, 5);
    let start = Math.max(1, actual - 2);
    const end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  ir(p: number): void {
    if (p >= 1 && p <= this.totalPaginas()) {
      this.paginaCambio.emit(p);
    }
  }
}
