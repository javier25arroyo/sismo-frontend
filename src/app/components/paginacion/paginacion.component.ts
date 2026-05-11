import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-paginacion',
  imports: [CommonModule],
  template: `
    <nav
      aria-label="Paginación"
      class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-md text-text-primary shadow-sm transition-colors duration-300"
    >
      <span class="text-label-sm uppercase tracking-wide text-slate-500 tabular-nums">
        {{ info() || ('Página ' + paginaActual() + ' de ' + totalPaginas()) }}
      </span>
      <div class="flex items-center gap-1.5 rounded-lg bg-surface-container-low p-1 ring-1 ring-slate-200/80">
        <button
          type="button"
          (click)="ir(paginaActual() - 1)"
          [disabled]="paginaActual() <= 1"
          class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:bg-white hover:text-slate-700 hover:shadow-sm active:scale-95 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none"
          aria-label="Página anterior">
          ‹
        </button>
        <ng-container *ngFor="let p of pages()">
          <button
            type="button"
            (click)="ir(p)"
            [attr.aria-current]="p === paginaActual() ? 'page' : null"
            [class]="p === paginaActual()
              ? 'gradient-cta text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'"
            class="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-label-sm font-semibold tabular-nums transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-95">
            {{ p }}
          </button>
        </ng-container>
        <button
          type="button"
          (click)="ir(paginaActual() + 1)"
          [disabled]="paginaActual() >= totalPaginas()"
          class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:bg-white hover:text-slate-700 hover:shadow-sm active:scale-95 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none"
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
  info         = input<string>('');
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
