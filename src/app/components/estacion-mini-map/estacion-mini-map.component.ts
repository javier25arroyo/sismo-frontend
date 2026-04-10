import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  standalone: true,
  selector: 'app-estacion-mini-map',
  template: `<div #mapEl class="w-full h-full"></div>`
})
export class EstacionMiniMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() lat = 9.9;
  @Input() lng = -84.1;
  @Input() label = '';

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef;

  private map!: L.Map;
  private marker!: L.CircleMarker;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['lat'] || changes['lng'] || changes['label']) && this.map) {
      this.updatePosition();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [this.lat, this.lng],
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

    this.marker = L.circleMarker([this.lat, this.lng], {
      radius: 9,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(this.map);

    if (this.label) {
      this.marker.bindTooltip(this.label, { permanent: true, direction: 'top', offset: [0, -10] });
    }
  }

  private updatePosition(): void {
    const latlng: L.LatLngExpression = [this.lat, this.lng];
    this.map.setView(latlng, 12);
    this.marker.setLatLng(latlng);
    if (this.label) {
      this.marker.unbindTooltip();
      this.marker.bindTooltip(this.label, { permanent: true, direction: 'top', offset: [0, -10] });
    }
  }
}
