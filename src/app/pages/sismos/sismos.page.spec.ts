import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SismosPage } from './sismos.page';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EstacionesCacheService } from '../../services/estaciones-cache.service';
import { HistoricoService } from '../../services/historico.service';
import { ReporteService } from '../../services/reporte.service';
import { SismoService } from '../../services/sismo.service';
import { ValorAlertaService } from '../../services/valor-alerta.service';

describe('SismosPage template', () => {
  const template = readFileSync(
    join(process.cwd(), 'src/app/pages/sismos/sismos.page.html'),
    'utf8'
  );

  it('muestra el banner de magnitud como panel lateral responsive y elimina las tarjetas anteriores', () => {
    expect(template).toContain(
      "[ngClass]=\"ultimoSismo() ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1'\""
    );
    expect(template).toContain('MAGNITUD MOMENTÁNEA + DATOS — panel lateral');
    expect(template).not.toContain('SIDEBAR — Estado de ubicación');
    expect(template).not.toContain('Quick info strip');
    expect(template).not.toContain('MAGNITUD MOMENTÁNEA + DATOS (full-width, bottom)');
  });

  it('muestra la tabla de resumen acelerográfico con columnas de alerta sísmica', () => {
    expect(template).toContain('table-estaciones-alerta-title');
    expect(template).toContain('Resumen acelerográfico por estación');
    expect(template).toContain('<caption class="sr-only">Resumen acelerográfico por estación del último sismo</caption>');
    expect(template).toContain('Aceleración (cm/ss)');
    expect(template).toContain('Alerta Sísmica');
    expect(template).toContain('registrosEstacionesTabla()');
  });
});

describe('SismosPage alertas por estación', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SismosPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        },
        {
          provide: SismoService,
          useValue: {
            listarSismos: vi.fn(),
            getUltimosSismos: vi.fn()
          }
        },
        {
          provide: ValorAlertaService,
          useValue: {
            getAlertas: vi.fn()
          }
        },
        {
          provide: EstacionesCacheService,
          useValue: {
            getEstaciones: vi.fn()
          }
        },
        {
          provide: HistoricoService,
          useValue: {}
        },
        {
          provide: ReporteService,
          useValue: {}
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin: vi.fn(() => true)
          }
        }
      ]
    }).compileComponents();
  });

  it('calcula el nivel más alto de alerta sísmica alcanzado por aceleración', () => {
    const fixture = TestBed.createComponent(SismosPage);
    const component = fixture.componentInstance;

    component.registrosEstaciones.set([
      {
        feSismo: '2026-06-02T00:00:00',
        magnitud: 4.1,
        ubicacion: 'Evento de prueba',
        coordenadaX: -84.1,
        coordenadaY: 9.9,
        profundidad: 12,
        codCentroPrd: 'ICE',
        codEstacion: 'A1',
        nomEstacion: 'Arenal',
        feDato: '2026-06-02T00:00:10',
        vaAceleracion: 18,
        vaDesplazamiento: 2.5,
        distanciaHipocentral: 44
      }
    ]);
    component.valoresAlerta.set([
      {
        codCentroPrd: 'ICE',
        codEstacion: 'A1',
        codParametro: 1,
        nivel0: 1,
        nivel1: 5,
        nivel2: 15,
        nivel3: 25
      }
    ]);

    expect(component.registrosEstacionesTabla()).toEqual([
      expect.objectContaining({
        nomEstacion: 'Arenal',
        codEstacion: 'A1',
        vaAceleracion: 18,
        vaDesplazamiento: 2.5,
        distanciaHipocentral: 44,
        alertaSismica: 'Nivel 2'
      })
    ]);
  });

  it('muestra sin alerta cuando faltan umbrales o aceleración', () => {
    const fixture = TestBed.createComponent(SismosPage);
    const component = fixture.componentInstance;

    component.valoresAlerta.set([
      {
        codCentroPrd: 'ICE',
        codEstacion: 'B2',
        codParametro: 1,
        nivel0: 1,
        nivel1: 5
      }
    ]);

    expect(component.obtenerAlertaSismica({
      codCentroPrd: 'ICE',
      codEstacion: 'A1',
      vaAceleracion: 18
    })).toBe('Sin alerta');
    expect(component.obtenerAlertaSismica({
      codCentroPrd: 'ICE',
      codEstacion: 'B2',
      vaAceleracion: undefined
    })).toBe('Sin alerta');
  });
});
