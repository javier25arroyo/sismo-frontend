import {
  Component,
  input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Sismo, MagnitudStyle } from '../../interfaces/sismo.interface';
import { EstacionRespuesta, SismoUltimoRespuesta } from '../../interfaces/api.interfaces';

@Component({
  standalone: true,
  selector: 'app-sismo-map',
  imports: [CommonModule],
  templateUrl: './sismo-map.component.html',
  styleUrls: ['./sismo-map.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SismoMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  /** Lista de sismos a mostrar en el mapa */
  sismos = input<Sismo[]>([]);

  /** Centro inicial del mapa [lat, lng] - Default: Costa Rica */
  center = input<[number, number]>([9.9, -84.1]);

  /** Zoom inicial del mapa */
  zoom = input<number>(8);

  /** Altura del contenedor del mapa */
  height = input<string>('500px');

  /** Si se debe mostrar la leyenda de magnitudes */
  showLegend = input<boolean>(true);

  /** Sismo a marcar como epicentro destacado (anillo pulsante + crosshair) */
  epicentro = input<SismoUltimoRespuesta | null>(null);

  /** Estaciones sísmicas a mostrar en el mapa */
  estaciones = input<EstacionRespuesta[]>([]);

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  private epicentroLayer!: L.LayerGroup;
  private estacionesLayer!: L.LayerGroup;
  private isInitialized = false;

  /** Estilos según magnitud del sismo */
  private readonly magnitudStyles: Record<string, MagnitudStyle> = {
    nivel1: { color: '#22c55e', radius: 6, fillOpacity: 0.7 },      // 3.5-4.0 Mw (Nivel 1)
    nivel2: { color: '#eab308', radius: 8, fillOpacity: 0.7 },      // 4.0-5.0 Mw (Nivel 2)
    nivel3: { color: '#f97316', radius: 10, fillOpacity: 0.8 },     // 5.0-6.0 Mw (Nivel 3)
    nivel4: { color: '#ef4444', radius: 14, fillOpacity: 0.9 }      // >= 6.0 Mw (Nivel 4)
  };

  constructor() {
    effect(() => {
      const sismos = this.sismos();
      if (this.isInitialized && this.markersLayer) {
        this.addSismos(sismos);
      }
    });

    effect(() => {
      const epicentro = this.epicentro();
      if (this.isInitialized && this.epicentroLayer) {
        this.addEpicentroMarker(epicentro);
      }
    });

    effect(() => {
      const estaciones = this.estaciones();
      if (this.isInitialized && this.estacionesLayer) {
        this.addEstaciones(estaciones);
      }
    });
  }

  ngOnInit(): void {
    this.fixLeafletIcons();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addSismos(this.sismos());
    this.addEpicentroMarker(this.epicentro());
    this.addEstaciones(this.estaciones());
    this.isInitialized = true;
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
      center: this.center(),
      zoom: this.zoom(),
      zoomControl: true
    });

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(this.map);

    // Capa para los marcadores de sismos
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Capa para el marcador del epicentro (encima de los demás)
    this.epicentroLayer = L.layerGroup().addTo(this.map);

    // Capa para las estaciones sísmicas
    this.estacionesLayer = L.layerGroup().addTo(this.map);

    // Agregar leyenda si está habilitada
    if (this.showLegend()) {
      this.addLegend();
    }
  }

  private addSismos(sismos: Sismo[]): void {
    if (!this.markersLayer) return;

    // Limpiar marcadores existentes
    this.markersLayer.clearLayers();

    sismos.forEach(sismo => {
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
    if (sismos.length > 0) {
      const bounds = L.latLngBounds(
        sismos.map(s => [s.coordenadaY, s.coordenadaX] as [number, number])
      );
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }

  private getStyleForMagnitud(magnitud: number): MagnitudStyle {
    if (magnitud >= 6.0) return this.magnitudStyles['nivel4'];
    if (magnitud >= 5.0) return this.magnitudStyles['nivel3'];
    if (magnitud >= 4.0) return this.magnitudStyles['nivel2'];
    if (magnitud >= 3.5) return this.magnitudStyles['nivel1'];
    return { color: '#94a3b8', radius: 4, fillOpacity: 0.6 }; // Sismos menores (<3.5) en gris
  }

  private addEpicentroMarker(epicentro: SismoUltimoRespuesta | null): void {
    if (!this.epicentroLayer) return;
    this.epicentroLayer.clearLayers();
    if (!epicentro) return;

    const s = epicentro;
    const color = this.getStyleForMagnitud(s.magnitud).color;
    const fechaFormateada = new Date(s.feSismo).toLocaleString('es-CR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const icon = L.divIcon({
      className: '',
      html: `
        <style>
          @keyframes epicentro-ring {
            0%   { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(3.2); opacity: 0; }
          }
        </style>
        <div style="position:relative;width:48px;height:48px;transform:translate(-50%,-50%);">
          <div style="position:absolute;inset:0;border-radius:50%;border:3px solid ${color};
            animation:epicentro-ring 2s ease-out infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;border:3px solid ${color};
            animation:epicentro-ring 2s ease-out infinite 0.7s;"></div>
          <div style="position:absolute;inset:15px;border-radius:50%;background:${color};box-shadow:0 0 0 2px #fff;"></div>
          <div style="position:absolute;top:0;bottom:0;left:calc(50% - 1px);width:2px;background:${color};opacity:0.6;"></div>
          <div style="position:absolute;left:0;right:0;top:calc(50% - 1px);height:2px;background:${color};opacity:0.6;"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -28]
    });

    const marker = L.marker([s.coordenadaY, s.coordenadaX], { icon, zIndexOffset: 1000 });
    marker.bindPopup(`
      <div style="min-width:170px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;
          letter-spacing:.07em;color:#64748b;">Epicentro</p>
        <h3 style="margin:0 0 4px;font-size:17px;font-weight:800;color:${color};">
          M ${s.magnitud.toFixed(1)}
        </h3>
        <p style="margin:0 0 2px;font-size:12px;color:#475569;">${fechaFormateada}</p>
        <p style="margin:0 0 2px;font-size:12px;">${s.ubicacion}</p>
        <p style="margin:0;font-size:12px;color:#64748b;">Profundidad: ${s.profundidad} km</p>
      </div>
    `);
    marker.addTo(this.epicentroLayer);
  }

  private addEstaciones(estaciones: EstacionRespuesta[]): void {
    if (!this.estacionesLayer) return;
    this.estacionesLayer.clearLayers();

    estaciones.forEach(e => {
      const icon = L.divIcon({
        className: '',
        html: `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><polygon points="7,1 13,13 1,13" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
        iconSize: [14, 14],
        iconAnchor: [7, 13],
        tooltipAnchor: [0, -14]
      });
      const marker = L.marker([e.coordenadaY, e.coordenadaX], { icon, zIndexOffset: 500 });
      marker.bindTooltip(`<strong>${e.codEstacion}</strong><br>${e.nomEstacion}`, {
        direction: 'top',
        offset: [0, -8]
      });
      marker.addTo(this.estacionesLayer);
    });
  }

  private addLegend(): void {
    const legend = new L.Control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">Criterios</h4>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></span>
            <span>Nivel 1</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 14px; height: 14px; background: #eab308; border-radius: 50%; margin-right: 8px;"></span>
            <span>Nivel 2</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 16px; height: 16px; background: #f97316; border-radius: 50%; margin-right: 8px;"></span>
            <span>Nivel 3</span>
          </div>
          <div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="width: 18px; height: 18px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
            <span>Nivel 4</span>
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
