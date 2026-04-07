import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  VistaTerremotoRespuesta,
  FiltroTerremotos
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class VistaTerremotoService {
  constructor(private api: ApiService) {}

  /** GET /api/terremoto — acelerogramas agrupados por terremoto con PGA */
  async getTerremotos(filtros: FiltroTerremotos = {}): Promise<PaginatedResponse<VistaTerremotoRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.feTerremoto) params.set('feTerremoto', filtros.feTerremoto);
    if (filtros.coEstacion)  params.set('coEstacion', filtros.coEstacion);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<VistaTerremotoRespuesta>>(
      `/api/terremoto${query ? '?' + query : ''}`
    );
  }
}
