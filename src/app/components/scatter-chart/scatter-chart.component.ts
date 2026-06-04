import {
  Component,
  input,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect
} from '@angular/core';

export interface ScatterDato {
  x: number;
  y: number;
}

type ChartModule = typeof import('chart.js');
type ScatterChart = import('chart.js').Chart<'scatter', ScatterDato[]>;
type ScatterTooltipItem = import('chart.js').TooltipItem<'scatter'>;

@Component({
  standalone: true,
  selector: 'app-scatter-chart',
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p class="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600" id="chart-title-{{ uniqueId }}">{{ titulo() }}</p>
      <div class="min-h-48 relative">
        <canvas #canvas
          role="img"
          [attr.aria-label]="'Gráfico de dispersión: ' + titulo() + '. Eje X: ' + tituloX() + ', Eje Y: ' + tituloY()"
          [attr.aria-describedby]="'chart-desc-' + uniqueId">
        </canvas>
        <div [id]="'chart-desc-' + uniqueId" class="sr-only">
          Este gráfico muestra la relación entre {{ tituloX() }} y {{ tituloY() }} para {{ datos().length }} eventos sísmicos.
        </div>
      </div>
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

  protected readonly uniqueId = Math.random().toString(36).substring(2, 9);

  private static chartModulePromise: Promise<ChartModule> | null = null;

  private chart: ScatterChart | null = null;
  private isInitialized = false;
  private destroyed = false;
  private renderToken = 0;

  constructor() {
    effect(() => {
      // Depender de todos los inputs para reconstruir el gráfico
      const datos = this.datos();
      const tituloX = this.tituloX();
      const tituloY = this.tituloY();
      const color = this.colorPunto();

      if (this.isInitialized) {
        void this.syncChart(datos, tituloX, tituloY, color);
      }
    });
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    void this.syncChart(this.datos(), this.tituloX(), this.tituloY(), this.colorPunto());
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.chart?.destroy();
  }

  private static loadChartModule(): Promise<ChartModule> {
    if (!this.chartModulePromise) {
      this.chartModulePromise = import('chart.js').then(module => {
        module.Chart.register(
          module.ScatterController,
          module.PointElement,
          module.LinearScale,
          module.Tooltip,
          module.Title,
          module.Legend
        );
        return module;
      });
    }
    return this.chartModulePromise;
  }

  private async syncChart(datos: ScatterDato[], tituloX: string, tituloY: string, color: string): Promise<void> {
    if (!this.canvasRef) return;
    const token = ++this.renderToken;
    const { Chart } = await ScatterChartComponent.loadChartModule();
    if (this.destroyed || token !== this.renderToken) return;

    if (this.chart) {
      this.chart.data.datasets[0].data = datos;
      this.chart.data.datasets[0].backgroundColor = color + 'cc';
      this.chart.data.datasets[0].borderColor = color;
      if (this.chart.options.scales?.['x']?.title) {
        this.chart.options.scales['x'].title.text = tituloX;
      }
      if (this.chart.options.scales?.['y']?.title) {
        this.chart.options.scales['y'].title.text = tituloY;
      }
      this.chart.update('none');
      return;
    }

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
              label: (ctx: ScatterTooltipItem) => `(${(ctx.parsed.x ?? 0).toFixed(2)}, ${(ctx.parsed.y ?? 0).toFixed(2)})`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: tituloX, font: { size: 11, weight: 600 } },
            grid: { color: '#e8eef1' },
            ticks: { color: '#64748b' }
          },
          y: {
            title: { display: true, text: tituloY, font: { size: 11, weight: 600 } },
            grid: { color: '#e8eef1' },
            ticks: { color: '#64748b' }
          }
        }
      }
    });
  }
}
