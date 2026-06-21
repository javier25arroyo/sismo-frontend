import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SismoMapComponent } from './sismo-map.component';

describe('SismoMapComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SismoMapComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    }).compileComponents();
  });

  it('renderiza fallback SSR estable con altura reservada', () => {
    const fixture = TestBed.createComponent(SismoMapComponent);
    fixture.detectChanges();

    const shell = fixture.nativeElement.querySelector('.sismo-map-container') as HTMLElement;
    const fallback = fixture.nativeElement.querySelector('.sismo-map-fallback') as HTMLDivElement;

    expect(shell.style.minHeight).toBe('500px');
    expect(fallback.textContent).toContain('El mapa interactivo se carga');
  });

  it('muestra el mensaje de error cuando la inicializacion falla', () => {
    const fixture = TestBed.createComponent(SismoMapComponent);
    fixture.componentInstance.mapStatus.set('error');
    fixture.detectChanges();

    const fallback = fixture.nativeElement.querySelector('.sismo-map-fallback') as HTMLDivElement;

    expect(fallback.textContent).toContain('No fue posible cargar el mapa interactivo.');
  });
});
