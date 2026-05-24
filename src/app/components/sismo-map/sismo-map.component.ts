import {
  Component,
  input,
  computed,
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
import { categorizarSismo, type ConsecutivoSismo } from '../../utils/sismo-criterios';

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

  /** Si se debe mostrar la leyenda de criterios */
  showLegend = input<boolean>(true);

  /** Si el mapa debe volar automáticamente al epicentro cuando cargue */
  flyToEpicentro = input<boolean>(false);

  /** Sismo a marcar como epicentro destacado (anillo pulsante + crosshair) */
  epicentro = input<SismoUltimoRespuesta | null>(null);

  /** Estaciones sísmicas a mostrar en el mapa */
  estaciones = input<EstacionRespuesta[]>([]);

  /** Cuando es true y hay exactamente una estación, vuela al mapa a su ubicación */
  flyToEstacion = input<boolean>(false);

  readonly ariaLabel = computed(() => {
    const epicentro  = this.epicentro();
    const sismos     = this.sismos();
    const estaciones = this.estaciones();

    if (epicentro) {
      const ubicacion = epicentro.ubicacion ?? 'Costa Rica';
      return `Mapa sísmico. Epicentro: magnitud ${epicentro.magnitud.toFixed(1)}, ${ubicacion}, profundidad ${epicentro.profundidad} km`;
    }
    if (sismos.length > 0) {
      return `Mapa sísmico con ${sismos.length} evento${sismos.length !== 1 ? 's' : ''}`;
    }
    if (estaciones.length > 0) {
      return `Mapa de red sísmica con ${estaciones.length} estación${estaciones.length !== 1 ? 'es' : ''}`;
    }
    return 'Mapa sísmico sin datos';
  });

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  private epicentroLayer!: L.LayerGroup;
  private estacionesLayer!: L.LayerGroup;
  private isInitialized = false;

  /** Estilos segun criterio oficial del sismo */
  private normalizarUbicacion(u: string | null | undefined): string {
    if (!u) return '';
    let txt = u.trim().replace(/\s*\)\s*$/, '');
    txt = txt.replace(/\brevisada\b/g, 'revisado').replace(/\bRevisada\b/g, 'Revisado');
    return txt.length > 0 ? txt.charAt(0).toUpperCase() + txt.slice(1) : txt;
  }

  private readonly criterioStyles: Record<ConsecutivoSismo, MagnitudStyle> = {
    1: { color: '#22c55e', radius: 6, fillOpacity: 0.7 },
    2: { color: '#eab308', radius: 8, fillOpacity: 0.7 },
    3: { color: '#f97316', radius: 10, fillOpacity: 0.8 },
    4: { color: '#ef4444', radius: 14, fillOpacity: 0.9 }
  };
  private readonly estiloSinCriterio: MagnitudStyle = { color: '#94a3b8', radius: 4, fillOpacity: 0.6 };

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
        if (this.flyToEstacion() && estaciones.length === 1) {
          this.map.flyTo([estaciones[0].coordenadaY, estaciones[0].coordenadaX], 12, { duration: 0.8 });
        }
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
    // Fix para iconos de Leaflet en Angular usando activos locales
    const iconDefault = L.icon({
      iconRetinaUrl: 'leaflet/marker-icon-2x.png',
      iconUrl: 'leaflet/marker-icon.png',
      shadowUrl: 'leaflet/marker-shadow.png',
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

    // Capa base CartoDB Positron — más limpia y con mejor contraste para marcadores
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
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
      const marker = L.circleMarker([sismo.coordenadaY, sismo.coordenadaX], {
        radius: 8,
        fillColor: '#94a3b8',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
        interactive: false
      });

      const fechaFormateada = new Date(sismo.feSismo).toLocaleString('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      marker.bindPopup(`
        <div class="sismo-popup">
          <h3 class="font-bold text-lg">M ${sismo.magnitud.toFixed(1)}</h3>
          <p class="text-sm text-gray-600">${fechaFormateada}</p>
          <p class="mt-1">${this.normalizarUbicacion(sismo.ubicacion)}</p>
          <p class="text-sm">Profundidad: ${sismo.profundidad} km</p>
          ${this.renderDistanciaHipocentral(sismo.distanciaHipocentral)}
          ${this.renderCriterio(sismo.magnitud, sismo.distanciaHipocentral)}
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

  private getStyleForSismo(sismo: Pick<Sismo, 'magnitud' | 'distanciaHipocentral'>): MagnitudStyle {
    const criterio = categorizarSismo(sismo.magnitud, sismo.distanciaHipocentral);
    return criterio ? this.criterioStyles[criterio.consecutivo] : this.estiloSinCriterio;
  }

  private renderDistanciaHipocentral(distancia: number | null | undefined): string {
    return typeof distancia === 'number' && Number.isFinite(distancia)
      ? `<p class="text-sm">Distancia hipocentral: ${distancia.toFixed(2)} km</p>`
      : '';
  }

  private renderCriterio(magnitud: number, distancia: number | null | undefined): string {
    const criterio = categorizarSismo(magnitud, distancia);
    return criterio
      ? `<p class="text-xs text-gray-500 mt-1">Consecutivo ${criterio.consecutivo}</p>`
      : `<p class="text-xs text-gray-500 mt-1">Sin criterio aplicable</p>`;
  }

  private addEpicentroMarker(epicentro: SismoUltimoRespuesta | null): void {
    if (!this.epicentroLayer) return;
    this.epicentroLayer.clearLayers();
    if (!epicentro) return;

    const s = epicentro;
    const color = this.getStyleForSismo(s).color;
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

    const marker = L.marker([s.coordenadaY, s.coordenadaX], {
      icon,
      zIndexOffset: 1000,
      title: `Epicentro — M ${s.magnitud.toFixed(1)} ${this.normalizarUbicacion(s.ubicacion)}`
    });
    marker.bindPopup(`
      <div style="min-width:170px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;
          letter-spacing:.07em;color:#64748b;">Epicentro</p>
        <h3 style="margin:0 0 4px;font-size:17px;font-weight:800;color:${color};">
          M ${s.magnitud.toFixed(1)}
        </h3>
        <p style="margin:0 0 2px;font-size:12px;color:#475569;">${fechaFormateada}</p>
        <p style="margin:0 0 2px;font-size:12px;">${this.normalizarUbicacion(s.ubicacion)}</p>
        <p style="margin:0;font-size:12px;color:#64748b;">Profundidad: ${s.profundidad} km</p>
        ${this.renderDistanciaHipocentral(s.distanciaHipocentral)}
        ${this.renderCriterio(s.magnitud, s.distanciaHipocentral)}
      </div>
    `);
    marker.addTo(this.epicentroLayer);

    if (this.flyToEpicentro()) {
      this.map.flyTo([s.coordenadaY, s.coordenadaX], 9, { duration: 1.2 });
    }
  }

  private addEstaciones(estaciones: EstacionRespuesta[]): void {
    if (!this.estacionesLayer) return;
    this.estacionesLayer.clearLayers();

    estaciones.forEach(e => {
      const icon = L.divIcon({
        className: '',
        html: `<svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,3 22,21 2,21" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
        iconSize: [28, 28],
        iconAnchor: [14, 24],
        tooltipAnchor: [0, -20]
      });
      const marker = L.marker([e.coordenadaY, e.coordenadaX], {
        icon,
        zIndexOffset: 500,
        title: `Estación ${e.codEstacion} — ${e.nomEstacion}`,
        interactive: true,
        keyboard: true
      });
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
      const niveles: readonly ConsecutivoSismo[] = [1, 2, 3, 4];
      const filas = niveles.map((nivel) => {
        const style = this.criterioStyles[nivel];
        const size = style.radius * 2;
        return `
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px 0;">
            <span style="width: ${size}px; height: ${size}px; background: ${style.color}; border-radius: 50%; flex: 0 0 auto;"></span>
            <span style="min-width: 54px; text-align: center;">Nivel ${nivel}</span>
          </div>
        `;
      }).join('');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); text-align: center;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; text-align: center;">Criterios</h4>
          ${filas}
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
