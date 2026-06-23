import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EstacionMiniMapComponent } from './estacion-mini-map.component';

describe('EstacionMiniMapComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstacionMiniMapComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    }).compileComponents();
  });

  it('renderiza fallback compacto mientras no hay mapa interactivo', () => {
    const fixture = TestBed.createComponent(EstacionMiniMapComponent);
    fixture.detectChanges();

    const shell = fixture.nativeElement.querySelector('.estacion-mini-map-shell') as HTMLElement;
    const fallback = fixture.nativeElement.querySelector('.estacion-mini-map-fallback') as HTMLDivElement;

    expect(shell.style.minHeight).toBe('180px');
    expect(fallback.textContent).toContain('El mapa interactivo se carga');
  });

  it('muestra el error compacto si la carga no se completa', () => {
    const fixture = TestBed.createComponent(EstacionMiniMapComponent);
    fixture.componentInstance.mapStatus.set('error');
    fixture.detectChanges();

    const fallback = fixture.nativeElement.querySelector('.estacion-mini-map-fallback') as HTMLDivElement;

    expect(fallback.textContent).toContain('No fue posible cargar el mapa de estación.');
  });
});
