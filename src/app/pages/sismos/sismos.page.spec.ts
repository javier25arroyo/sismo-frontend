import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SismosPage } from './sismos.page';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AcelerogramasService } from '../../services/acelerogramas.service';
import { EstacionesCacheService } from '../../services/estaciones-cache.service';
import { ReporteService } from '../../services/reporte.service';
import { SismoService } from '../../services/sismo.service';

registerLocaleData(localeEs, 'es');

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
    expect(template).toContain('resumenAcelerogramasArray()');
    expect(template).toContain('registro.nombre');
    expect(template).toContain('registro.codigoEstacion');
    expect(template).toContain('registro.aceleracionCmSs');
    expect(template).toContain('registro.desplazamientoCm');
    expect(template).toContain('registro.distanciaHipocentralKm');
    expect(template).toContain('alertaSismicaLabel(registro.alertaSismica)');
    expect(template).not.toContain('registro.coEstacion');
    expect(template).not.toContain('registro.aceleracionMaxima');
  });
});

describe('SismosPage resumen acelerográfico por estación', () => {
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
          provide: AcelerogramasService,
          useValue: {
            obtenerResumenPorEstacion: vi.fn(),
            listarAcelerogramas: vi.fn()
          }
        },
        {
          provide: EstacionesCacheService,
          useValue: {
            getEstaciones: vi.fn()
          }
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

  it('expone la lista del endpoint para la tabla de resumen acelerográfico', () => {
    const fixture = TestBed.createComponent(SismosPage);
    const component = fixture.componentInstance;
    const resumen = [
      {
        nombre: 'Arenal',
        codigoEstacion: 'A1',
        aceleracionCmSs: 18,
        desplazamientoCm: 2.5,
        distanciaHipocentralKm: 44,
        alertaSismica: 'NIVEL 2'
      }
    ];

    component.resumenAcelerogramas.set(resumen);

    expect(component.resumenAcelerogramasArray()).toEqual(resumen);
  });

  it('muestra Sin definir cuando la alerta sísmica viene vacía', () => {
    const fixture = TestBed.createComponent(SismosPage);
    const component = fixture.componentInstance;

    expect(component.alertaSismicaLabel('')).toBe('Sin definir');
    expect(component.alertaSismicaLabel('   ')).toBe('Sin definir');
    expect(component.alertaSismicaLabel(null)).toBe('Sin definir');
    expect(component.alertaSismicaLabel('NIVEL 2')).toBe('NIVEL 2');
  });

  it('usa una fecha de acelerogramas disponible cuando el ultimo sismo no tiene resumen', async () => {
    const sismoService = TestBed.inject(SismoService);
    const acelerogramasService = TestBed.inject(AcelerogramasService);
    const estacionesCache = TestBed.inject(EstacionesCacheService);
    const resumen = [
      {
        nombre: 'Caseta presa, MD',
        codigoEstacion: 'CA',
        aceleracionCmSs: 0.010106,
        desplazamientoCm: null,
        distanciaHipocentralKm: null,
        alertaSismica: 'Sin definir'
      }
    ];

    vi.mocked(estacionesCache.getEstaciones).mockResolvedValue([]);
    vi.mocked(sismoService.listarSismos).mockResolvedValue({
      content: [{
        feSismo: '2026-06-10T13:19:48',
        magnitud: 5.2,
        ubicacion: 'Evento reciente',
        coordenadaX: -85.875,
        coordenadaY: 10.455,
        profundidad: 40,
        sentido: 'SENTIDO'
      }],
      page: 0,
      size: 1,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false
    });
    vi.mocked(acelerogramasService.obtenerResumenPorEstacion)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(resumen);
    vi.mocked(acelerogramasService.listarAcelerogramas).mockResolvedValue({
      content: [{
        feTerremoto: '2026-04-30T05:03:12',
        coEstacion: 'CA',
        canal: 'ACC',
        sitio: 'SIM',
        instrumento: 'INS1',
        timeSeg: 0,
        aceleracion: 0.010106
      }],
      page: 0,
      size: 1,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false
    });

    const fixture = TestBed.createComponent(SismosPage);
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(fixture.componentInstance.resumenAcelerogramasArray()).toEqual(resumen);
    });

    expect(acelerogramasService.obtenerResumenPorEstacion).toHaveBeenNthCalledWith(1, '2026-06-10T13:19:48');
    expect(acelerogramasService.listarAcelerogramas).toHaveBeenCalledWith(undefined, undefined, 0, 1);
    expect(acelerogramasService.obtenerResumenPorEstacion).toHaveBeenNthCalledWith(2, '2026-04-30T05:03:12');
  });
});
