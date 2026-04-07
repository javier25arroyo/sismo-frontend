import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  AcelerogramaRespuesta,
  FiltroAcelerogramas
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AcelerogramaService {
  constructor(private api: ApiService) {}

  /** GET /api/acelerogramas — lista paginada con filtros */
  async getAcelerogramas(filtros: FiltroAcelerogramas = {}): Promise<PaginatedResponse<AcelerogramaRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.feTerremoto) params.set('feTerremoto', filtros.feTerremoto);
    if (filtros.coEstacion)  params.set('coEstacion', filtros.coEstacion);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<AcelerogramaRespuesta>>(
      `/api/acelerogramas${query ? '?' + query : ''}`
    );
  }
}
