import {
  Component,
  input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  PLATFORM_ID,
  effect,
  inject,
  computed,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as Leaflet from 'leaflet';

@Component({
  standalone: true,
  selector: 'app-estacion-mini-map',
  template: `
    <div class="estacion-mini-map-shell relative size-full overflow-hidden rounded-lg" [style.minHeight]="'180px'">
      <div
        #mapEl
        class="absolute inset-0 transition-opacity duration-300 ease-out"
        [class.opacity-0]="mapStatus() !== 'ready'"
        [class.opacity-100]="mapStatus() === 'ready'"
        [class.pointer-events-none]="mapStatus() !== 'ready'"
        aria-hidden="true"
      ></div>

      @if (mapStatus() !== 'ready') {
        <div
          class="estacion-mini-map-fallback absolute inset-0 flex items-center justify-center px-4 py-3 text-center"
          aria-live="polite"
          role="status"
        >
          <span class="max-w-[16rem] text-xs leading-5 text-slate-700">
            {{ mapStatusMessage() }}
          </span>
        </div>
      }
    </div>
  `,
  styleUrls: ['./estacion-mini-map.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstacionMiniMapComponent implements AfterViewInit, OnDestroy {
  lat = input<number>(9.9);
  lng = input<number>(-84.1);
  label = input<string>('');

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLElement>;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly mapStatus = signal<'ssr' | 'loading' | 'ready' | 'error'>(this.isBrowser ? 'loading' : 'ssr');
  readonly mapStatusMessage = computed(() => {
    switch (this.mapStatus()) {
      case 'loading':
        return 'Cargando mapa de estación.';
      case 'error':
        return 'No fue posible cargar el mapa de estación.';
      case 'ssr':
        return 'El mapa interactivo se carga cuando la página termina de hidratarse.';
      default:
        return '';
    }
  });
  private leaflet!: typeof Leaflet;
  private map: Leaflet.Map | null = null;
  private marker: Leaflet.CircleMarker | null = null;
  private isInitialized = false;

  constructor() {
    effect(() => {
      const lat = this.lat();
      const lng = this.lng();
      const label = this.label();

      if (this.isInitialized && this.map && this.marker) {
        this.updatePosition(lat, lng, label);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      this.mapStatus.set('loading');
      this.leaflet = await import('leaflet');
      this.initMap();
      this.isInitialized = true;
      this.mapStatus.set('ready');
    } catch (error) {
      this.map?.remove();
      this.map = null;
      this.marker = null;
      this.isInitialized = false;
      console.error('No fue posible inicializar el mini mapa de estación', error);
      this.mapStatus.set('error');
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    this.marker = null;
    this.isInitialized = false;
  }

  private initMap(): void {
    const L = this.leaflet;
    const lat = this.lat();
    const lng = this.lng();
    const label = this.label();

    this.map = L.map(this.mapEl.nativeElement, {
      center: [lat, lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    this.marker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(this.map);

    if (label) {
      this.marker.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10] });
    }
  }

  private updatePosition(lat: number, lng: number, label: string): void {
    if (!this.map || !this.marker) return;

    const latlng: Leaflet.LatLngExpression = [lat, lng];
    this.map.setView(latlng, 12);
    this.marker.setLatLng(latlng);
    this.marker.unbindTooltip();
    if (label) {
      this.marker.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10] });
    }
  }
}
