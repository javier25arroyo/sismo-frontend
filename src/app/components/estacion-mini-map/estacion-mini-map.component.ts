import {
  Component,
  input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  effect
} from '@angular/core';
import * as L from 'leaflet';

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

  private map!: L.Map;
  private marker!: L.CircleMarker;
  private isInitialized = false;

  constructor() {
    effect(() => {
      const lat = this.lat();
      const lng = this.lng();
      const label = this.label();

      if (this.isInitialized && this.map) {
        this.updatePosition(lat, lng, label);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
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
    const latlng: L.LatLngExpression = [lat, lng];
    this.map.setView(latlng, 12);
    this.marker.setLatLng(latlng);
    this.marker.unbindTooltip();
    if (label) {
      this.marker.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10] });
    }
  }
}
