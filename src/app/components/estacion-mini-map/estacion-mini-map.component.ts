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
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as Leaflet from 'leaflet';

@Component({
  standalone: true,
  selector: 'app-estacion-mini-map',
  template: `<div #mapEl class="w-full h-full"></div>`,
  styleUrls: ['./estacion-mini-map.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstacionMiniMapComponent implements AfterViewInit, OnDestroy {
  lat = input<number>(9.9);
  lng = input<number>(-84.1);
  label = input<string>('');

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
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

    this.leaflet = await import('leaflet');
    this.initMap();
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
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
