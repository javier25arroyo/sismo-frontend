import { Component, ElementRef, OnInit, OnDestroy, ViewChild, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acelerograma-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-hidden border-y border-slate-100 bg-white" [style.height]="height()">
      <canvas #waveformCanvas class="block h-full w-full"></canvas>
      <!-- Decoración minimalista tipo papel milimetrado muy tenue -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]" 
           style="background-image: radial-gradient(#000 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
  `
})
export class AcelerogramaLiveComponent implements OnInit, OnDestroy {
  @ViewChild('waveformCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  height = input<string>('200px');

  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private points: number[] = [];
  private maxPoints = 300; // Más puntos para una línea más fina y larga
  
  // Lógica de fases
  private frameCounter = 0;
  private currentPhase: 'noise' | 'peak1' | 'plateau' | 'peak2' = 'noise';

  ngOnInit() {
    this.initCanvas();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.points = new Array(this.maxPoints).fill(0);
  }

  private getNextAmplitude(): number {
    this.frameCounter++;
    
    // Ciclo de ~10 segundos (600 frames a 60fps)
    const cycle = this.frameCounter % 600;

    if (cycle < 100) {
      this.currentPhase = 'noise';
      return (Math.random() - 0.5) * 5; // Ruido base suave
    } else if (cycle < 180) {
      this.currentPhase = 'peak1';
      // Simulación de gran sismo (Onda P + S)
      const intensity = Math.sin((cycle - 100) * 0.5) * 60;
      return intensity * Math.random();
    } else if (cycle < 400) {
      this.currentPhase = 'plateau';
      // Calma con pequeñas réplicas
      return (Math.random() - 0.5) * 12;
    } else if (cycle < 480) {
      this.currentPhase = 'peak2';
      // Segundo evento (réplica fuerte)
      const intensity = Math.sin((cycle - 400) * 0.4) * 35;
      return intensity * Math.random();
    } else {
      this.currentPhase = 'noise';
      return (Math.random() - 0.5) * 5;
    }
  }

  private animate = () => {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const centerY = height / 2;

    // Generar el siguiente punto de la señal
    this.points.push(this.getNextAmplitude());
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    // Dibujar
    this.ctx.clearRect(0, 0, width, height);
    
    // Línea base técnica (muy tenue)
    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(width, centerY);
    this.ctx.stroke();

    // Dibujar el acelerograma (Negro sobre Blanco)
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1.2; // Línea fina tipo sismógrafo de aguja
    this.ctx.lineJoin = 'round';

    const step = width / (this.maxPoints - 1);
    for (let i = 0; i < this.points.length; i++) {
      const x = i * step;
      const y = centerY + this.points[i];
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    this.animationId = requestAnimationFrame(this.animate);
  }
}
