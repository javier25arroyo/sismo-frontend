import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Sismo, MagnitudStyle } from '../../interfaces/sismo.interface';

@Component({
  standalone: true,
  selector: 'app-sismo-map',
  imports: [CommonModule],
  templateUrl: './sismo-map.component.html'
})
export class SismoMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  /** Lista de sismos a mostrar en el mapa */
  @Input() sismos: Sismo[] = [];

  /** Centro inicial del mapa [lat, lng] - Default: Costa Rica */
  @Input() center: [number, number] = [9.9, -84.1];

  /** Zoom inicial del mapa */
  @Input() zoom = 8;

  /** Altura del contenedor del mapa */
  @Input() height = '500px';

  /** Si se debe mostrar la leyenda de magnitudes */
  @Input() showLegend = true;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  /** Estilos según magnitud del sismo */
  private readonly magnitudStyles: Record<string, MagnitudStyle> = {
    menor: { color: '#22c55e', radius: 6, fillOpacity: 0.7 },      // < 3.0 verde
    leve: { color: '#eab308', radius: 8, fillOpacity: 0.7 },       // 3.0-4.0 amarillo
    moderado: { color: '#f97316', radius: 10, fillOpacity: 0.8 },  // 4.0-5.0 naranja
    fuerte: { color: '#ef4444', radius: 12, fillOpacity: 0.8 },    // 5.0-6.0 rojo
    mayor: { color: '#7c2d12', radius: 16, fillOpacity: 0.9 }      // > 6.0 rojo oscuro
  };

  ngOnInit(): void {
    this.fixLeafletIcons();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addSismos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sismos'] && !changes['sismos'].firstChange) {
      this.addSismos();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private fixLeafletIcons(): void {
    // Fix para iconos de Leaflet en Angular
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: true
    });

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(this.map);

    // Capa para los marcadores de sismos
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Agregar leyenda si está habilitada
    if (this.showLegend) {
      this.addLegend();
    }
  }

  private addSismos(): void {
    if (!this.markersLayer) return;

    // Limpiar marcadores existentes
    this.markersLayer.clearLayers();

    this.sismos.forEach(sismo => {
      const style = this.getStyleForMagnitud(sismo.magnitud);
      
      const marker = L.circleMarker([sismo.coordenadaY, sismo.coordenadaX], {
        radius: style.radius,
        fillColor: style.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: style.fillOpacity
      });

      const fechaFormateada = new Date(sismo.feSismo).toLocaleString('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      marker.bindPopup(`
        <div class="sismo-popup">
          <h3 class="font-bold text-lg">M ${sismo.magnitud.toFixed(1)}</h3>
          <p class="text-sm text-gray-600">${fechaFormateada}</p>
          <p class="mt-1">${sismo.ubicacion}</p>
          <p class="text-sm">Profundidad: ${sismo.profundidad} km</p>
          ${sismo.fuente ? `<p class="text-xs text-gray-500 mt-1">Fuente: ${sismo.fuente}</p>` : ''}
        </div>
      `);

      marker.addTo(this.markersLayer);
    });

    // Ajustar vista si hay sismos
    if (this.sismos.length > 0) {
      const bounds = L.latLngBounds(
        this.sismos.map(s => [s.coordenadaY, s.coordenadaX] as [number, number])
      );
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }

  private getStyleForMagnitud(magnitud: number): MagnitudStyle {
    if (magnitud < 3.0) return this.magnitudStyles['menor'];
    if (magnitud < 4.0) return this.magnitudStyles['leve'];
    if (magnitud < 5.0) return this.magnitudStyles['moderado'];
    if (magnitud < 6.0) return this.magnitudStyles['fuerte'];
    return this.magnitudStyles['mayor'];
  }

  private addLegend(): void {
    const legend = new L.Control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">Magnitud</h4>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></span>
            <span>&lt; 3.0</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 14px; height: 14px; background: #eab308; border-radius: 50%; margin-right: 8px;"></span>
            <span>3.0 - 4.0</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 16px; height: 16px; background: #f97316; border-radius: 50%; margin-right: 8px;"></span>
            <span>4.0 - 5.0</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 18px; height: 18px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
            <span>5.0 - 6.0</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 22px; height: 22px; background: #7c2d12; border-radius: 50%; margin-right: 8px;"></span>
            <span>&gt; 6.0</span>
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(this.map);
  }

  /** Método público para centrar el mapa en un sismo específico */
  centerOnSismo(sismo: Sismo): void {
    this.map.setView([sismo.coordenadaY, sismo.coordenadaX], 12);
  }

  /** Método público para refrescar el mapa */
  refresh(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
