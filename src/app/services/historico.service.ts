import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PaginatedResponse, ResumenHistoricoRespuesta, FiltroResumenHistorico } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  constructor(private api: ApiService) {}

  /** GET /api/resumen/historico — resumen histórico paginado */
  async getHistorico(filtros: FiltroResumenHistorico = {}): Promise<PaginatedResponse<ResumenHistoricoRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<ResumenHistoricoRespuesta>>(
      `/api/resumen/historico${query ? '?' + query : ''}`
    );
  }
}
