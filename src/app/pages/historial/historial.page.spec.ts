import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HistorialPage } from './historial.page';
import { SismoService } from '../../services/sismo.service';
import { SismoRespuesta } from '../../interfaces/api.interfaces';
import { vi } from 'vitest';

describe('HistorialPage', () => {
  const baseEvento: SismoRespuesta = {
    feSismo: '2026-04-13T00:00:00',
    magnitud: 3,
    ubicacion: 'Evento de prueba',
    coordenadaX: -84.1,
    coordenadaY: 9.9,
    profundidad: 10
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPage, RouterTestingModule],
      providers: [
        {
          provide: SismoService,
          useValue: {
            listarSismos: vi.fn()
          }
        }
      ]
    }).compileComponents();
  });

  it('trata "SENTIDO" como evento sentido', () => {
    const fixture = TestBed.createComponent(HistorialPage);
    const component = fixture.componentInstance;

    expect(component.esEventoSentido({ ...baseEvento, sentido: 'SENTIDO' })).toBe(true);
    expect(component.esEventoSentido({ ...baseEvento, sentido: 'Si' })).toBe(true);
    expect(component.esEventoSentido(baseEvento)).toBe(false);
  });

  it('muestra las regiones oficiales de Costa Rica en el filtro de zona', () => {
    const fixture = TestBed.createComponent(HistorialPage);
    const component = fixture.componentInstance;

    expect(component.zonasFiltro.map(zona => zona.label)).toEqual([
      'Todo el territorio',
      'Central',
      'Chorotega',
      'Pacífico Central',
      'Brunca',
      'Huetar Caribe',
      'Huetar Norte'
    ]);
  });

  it('filtra eventos por la region real seleccionada', () => {
    const fixture = TestBed.createComponent(HistorialPage);
    const component = fixture.componentInstance;
    const evento = (ubicacion: string): SismoRespuesta => ({ ...baseEvento, ubicacion });

    component.eventos.set([
      evento('Cerca de Ciudad Quesada, San Carlos'),
      evento('Al oeste de Quepos'),
      evento('Al sur de Golfito'),
      evento('Cerca de Liberia'),
      evento('Cerca de Limón')
    ]);

    component.localizacion.set('huetar_norte');
    expect(component.eventosFiltrados().map(sismo => sismo.ubicacion)).toEqual([
      'Cerca de Ciudad Quesada, San Carlos'
    ]);

    component.localizacion.set('pacifico_central');
    expect(component.eventosFiltrados().map(sismo => sismo.ubicacion)).toEqual([
      'Al oeste de Quepos'
    ]);

    component.localizacion.set('brunca');
    expect(component.eventosFiltrados().map(sismo => sismo.ubicacion)).toEqual([
      'Al sur de Golfito'
    ]);
  });
});
