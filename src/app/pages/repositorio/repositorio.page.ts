import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, BarChart3, ClipboardList, FileDown, FileText, LucideAngularModule, RadioTower, Wrench, type LucideIconData } from 'lucide-angular';
import { ReporteService } from '../../services/reporte.service';
import { ReporteRespuesta } from '../../interfaces/api.interfaces';

type TabActivo = 'ML' | 'MAESTRO';

@Component({
  standalone: true,
  selector: 'app-repositorio',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './repositorio.page.html'
})
export class RepositorioPage implements OnInit {
  informes = signal<ReporteRespuesta[]>([]);
  cargando = signal(true);
  busqueda = signal('');
  tabActivo = signal<TabActivo>('ML');
  readonly arrowRightIcon = ArrowRight;
  readonly documentIcon = FileText;
  readonly downloadIcon = FileDown;

  readonly manuales: Array<{
    icono: LucideIconData;
    titulo: string;
    descripcion: string;
    etiqueta: string;
  }> = [
    { icono: Wrench, titulo: 'Guía de Instalación: Acelerógrafos Serie 2', descripcion: 'Procedimientos esenciales para la instalación y calibración de instrumentos.', etiqueta: 'PDF · 24 págs.' },
    { icono: RadioTower, titulo: 'Protocolos de Comunicación RT-Systems', descripcion: 'Especificaciones de protocolos para el sistema de datos en tiempo real.', etiqueta: 'PDF · 45 págs.' },
    { icono: BarChart3, titulo: 'Manual de Usuario: Portal de Visualización', descripcion: 'Guía interactiva para la exploración de la plataforma de datos sísmicos.', etiqueta: 'PDF · 33 págs.' },
    { icono: ClipboardList, titulo: 'Catálogo de Sensores Estructurales', descripcion: 'Inventario técnico de sensores de respuesta activa y pasiva disponibles.', etiqueta: 'PDF · 18 págs.' },
  ];

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    try {
      const res = await this.reporteService.getReportes({ size: 12, page: 0 });
      this.informes.set(res.content);
    } catch { this.informes.set([]); }
    finally { this.cargando.set(false); }
  }

  get informesFiltrados(): ReporteRespuesta[] {
    const q = this.busqueda().toLowerCase();
    if (!q) return this.informes();
    return this.informes().filter(r =>
      r.titulo.toLowerCase().includes(q) ||
      (r.resumen ?? '').toLowerCase().includes(q)
    );
  }

  setBusqueda(ev: Event): void {
    this.busqueda.set((ev.target as HTMLInputElement).value);
  }

  setTab(t: TabActivo): void { this.tabActivo.set(t); }
}
