import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect
} from '@angular/core';
import {
  Chart,
  ScatterController,
  PointElement,
  LinearScale,
  Tooltip,
  Title,
  Legend
} from 'chart.js';

Chart.register(ScatterController, PointElement, LinearScale, Tooltip, Title, Legend);

export interface ScatterDato {
  x: number;
  y: number;
}

@Component({
  standalone: true,
  selector: 'app-scatter-chart',
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-3">
      <p class="mb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ titulo() }}</p>
      <canvas #canvas></canvas>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  datos = input<ScatterDato[]>([]);
  tituloX = input<string>('X');
  tituloY = input<string>('Y');
  titulo = input<string>('');
  colorPunto = input<string>('#22c55e');

  private chart: Chart | null = null;
  private isInitialized = false;

  constructor() {
    effect(() => {
      // Depender de todos los inputs para reconstruir el gráfico
      const datos = this.datos();
      const tituloX = this.tituloX();
      const tituloY = this.tituloY();
      const color = this.colorPunto();

      if (this.isInitialized) {
        this.buildChart(datos, tituloX, tituloY, color);
      }
    });
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.buildChart(this.datos(), this.tituloX(), this.tituloY(), this.colorPunto());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(datos: ScatterDato[], tituloX: string, tituloY: string, color: string): void {
    if (!this.canvasRef) return;
    this.chart?.destroy();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [{
          data: datos,
          backgroundColor: color + 'cc',
          borderColor: color,
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `(${(ctx.parsed.x ?? 0).toFixed(2)}, ${(ctx.parsed.y ?? 0).toFixed(2)})`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: tituloX, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          },
          y: {
            title: { display: true, text: tituloY, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }
}
