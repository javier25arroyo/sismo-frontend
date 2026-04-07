import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Sismo, PaginatedResponse } from '../interfaces/sismo.interface';
import {
  SismoRespuesta,
  SismoUltimoRespuesta,
  FiltroSismos
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class SismoService {
  constructor(private api: ApiService) {}

  /** GET /api/sismos/ultimo/resumen — resumen paginado del último sismo por estación */
  async getUltimosSismos(limit = 50): Promise<Sismo[]> {
    const res = await this.api.get<PaginatedResponse<Sismo>>(
      `/api/sismos/ultimo/resumen?size=${limit}&sort=feSismo,desc`
    );
    return res.content;
  }

  /** GET /api/sismos/ultimo/resumen — con filtros y paginación */
  async getSismosPaginado(filtros: FiltroSismos = {}): Promise<PaginatedResponse<Sismo>> {
    const params = new URLSearchParams();
    if (filtros.codCentroPrd) params.set('codCentroPrd', filtros.codCentroPrd);
    if (filtros.codEstacion)  params.set('codEstacion', filtros.codEstacion);
    if (filtros.desde)        params.set('desde', filtros.desde);
    if (filtros.hasta)        params.set('hasta', filtros.hasta);
    if (filtros.magnitudMin !== undefined) params.set('magnitudMin', String(filtros.magnitudMin));
    if (filtros.magnitudMax !== undefined) params.set('magnitudMax', String(filtros.magnitudMax));
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<Sismo>>(
      `/api/sismos/ultimo/resumen${query ? '?' + query : ''}`
    );
  }

  /** Compatibilidad con vistas que filtran por magnitud mínima */
  async getSismosPorMagnitud(magnitudMin: number, limit = 50): Promise<Sismo[]> {
    const res = await this.getSismosPaginado({ magnitudMin, size: limit, page: 0 });
    return res.content;
  }

  /** GET /api/sismos — lista completa paginada de todos los sismos */
  async listarSismos(filtros: FiltroSismos = {}): Promise<PaginatedResponse<SismoRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<SismoRespuesta>>(
      `/api/sismos${query ? '?' + query : ''}`
    );
  }

  /** GET /api/sismos/ultimo — último sismo sentido */
  async getUltimoSismo(): Promise<SismoUltimoRespuesta> {
    return this.api.get<SismoUltimoRespuesta>('/api/sismos/ultimo');
  }
}
