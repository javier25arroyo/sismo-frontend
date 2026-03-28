import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SismoMapComponent } from '../../components/sismo-map/sismo-map.component';
import { SismoService } from '../../services/sismo.service';
import { Sismo } from '../../interfaces/sismo.interface';

@Component({
  standalone: true,
  selector: 'app-mapa-page',
  imports: [CommonModule, FormsModule, SismoMapComponent],
  templateUrl: './mapa.page.html'
})
export class MapaPage implements OnInit {
  sismos: Sismo[] = [];
  loading = true;
  error = '';

  // Filtros
  magnitudMin = 0;
  cantidadSismos = 50;

  constructor(private sismoService: SismoService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarSismos();
  }

  async cargarSismos(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      if (this.magnitudMin > 0) {
        this.sismos = await this.sismoService.getSismosPorMagnitud(this.magnitudMin);
      } else {
        this.sismos = await this.sismoService.getUltimosSismos(this.cantidadSismos);
      }
    } catch (e) {
      this.error = 'Error al cargar los sismos. Verifique la conexión con el servidor.';
      console.error('Error cargando sismos:', e);
    } finally {
      this.loading = false;
    }
  }

  async aplicarFiltros(): Promise<void> {
    await this.cargarSismos();
  }

  get sismoMasReciente(): Sismo | null {
    return this.sismos.length > 0 ? this.sismos[0] : null;
  }

  get sismoMayorMagnitud(): Sismo | null {
    if (this.sismos.length === 0) return null;
    return this.sismos.reduce((max, s) => s.magnitud > max.magnitud ? s : max, this.sismos[0]);
  }
}
