import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, BarChart3, FolderOpen, LucideAngularModule, RadioTower } from 'lucide-angular';
import { SismoService } from '../../services/sismo.service';
import { SismoUltimoRespuesta } from '../../interfaces/api.interfaces';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './home.page.html'
})
export class HomePage implements OnInit {
  ultimoSismo = signal<SismoUltimoRespuesta | null>(null);
  cargando = signal(true);
  readonly arrowRightIcon = ArrowRight;
  readonly historyIcon = BarChart3;
  readonly networkIcon = RadioTower;
  readonly repositoryIcon = FolderOpen;

  constructor(private sismoService: SismoService) {}

  ngOnInit(): void {
    this.sismoService.getUltimoSismo()
      .then(s => this.ultimoSismo.set(s))
      .catch(() => {})
      .finally(() => this.cargando.set(false));
  }

  get magnitudColor(): string {
    const m = this.ultimoSismo()?.magnitud ?? 0;
    if (m < 3.0) return '#22c55e'; // Verde - Nivel 1
    if (m < 4.5) return '#eab308'; // Amarillo - Nivel 2
    if (m < 6.0) return '#f97316'; // Naranja - Nivel 3
    return '#ef4444';             // Rojo - Nivel 4
  }
}
