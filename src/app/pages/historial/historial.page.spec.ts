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
});
