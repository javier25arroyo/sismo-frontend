import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
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
      <p class="mb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ titulo }}</p>
      <canvas #canvas></canvas>
    </div>
  `
})
export class ScatterChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() datos: ScatterDato[] = [];
  @Input() tituloX = 'X';
  @Input() tituloY = 'Y';
  @Input() titulo = '';
  @Input() colorPunto = '#22c55e';

  private chart: Chart | null = null;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.buildChart();
  }

  ngOnChanges(): void {
    if (this.initialized) {
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef) return;
    this.chart?.destroy();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [{
          data: this.datos,
          backgroundColor: this.colorPunto + 'cc',
          borderColor: this.colorPunto,
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
            title: { display: true, text: this.tituloX, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          },
          y: {
            title: { display: true, text: this.tituloY, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }
}
