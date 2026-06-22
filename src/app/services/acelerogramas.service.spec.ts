import { describe, expect, it, vi } from 'vitest';
import { AcelerogramasService } from './acelerogramas.service';
import { ApiService } from './api.service';

describe('AcelerogramasService', () => {
  it('devuelve la lista plana del resumen por estacion', async () => {
    const resumen = [
      {
        nombre: 'Base Arenal',
        codigoEstacion: 'BA',
        aceleracionCmSs: 2.7,
        desplazamientoCm: 0.36,
        distanciaHipocentralKm: 43.18,
        alertaSismica: 'NIVEL 2'
      }
    ];
    const api = {
      get: vi.fn().mockResolvedValue(resumen)
    } as unknown as ApiService;
    const service = new AcelerogramasService(api);

    const resultado = await service.obtenerResumenPorEstacion('2024-03-18T12:00:00');

    expect(resultado).toEqual(resumen);
    expect(api.get).toHaveBeenCalledWith(
      '/api/acelerogramas/resumen-por-estacion?feTerremoto=2024-03-18T12%3A00%3A00'
    );
  });

  it('normaliza la distancia hipocentral cuando la API la devuelve sin sufijo Km', async () => {
    const api = {
      get: vi.fn().mockResolvedValue([
        {
          nombre: 'Base Arenal',
          codigoEstacion: 'BA',
          aceleracionCmSs: 2.7,
          desplazamientoCm: 0.36,
          distanciaHipocentral: 43.18,
          alertaSismica: 'NIVEL 2'
        }
      ])
    } as unknown as ApiService;
    const service = new AcelerogramasService(api);

    const resultado = await service.obtenerResumenPorEstacion('2024-03-18T12:00:00');

    expect(resultado[0]?.distanciaHipocentralKm).toBe(43.18);
  });
});
