import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  ValorAlertaEstacionRespuesta,
  FiltroAlertas
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ValorAlertaService {
  constructor(private api: ApiService) {}

  /** GET /api/alertas — valores de alerta paginados con filtros */
  async getAlertas(filtros: FiltroAlertas = {}): Promise<PaginatedResponse<ValorAlertaEstacionRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.codCentroPrd) params.set('codCentroPrd', filtros.codCentroPrd);
    if (filtros.codEstacion)  params.set('codEstacion', filtros.codEstacion);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<ValorAlertaEstacionRespuesta>>(
      `/api/alertas${query ? '?' + query : ''}`
    );
  }
}
