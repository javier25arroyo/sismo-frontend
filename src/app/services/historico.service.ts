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

  /** GET /api/resumen/historico/csv — descarga CSV generado en el servidor */
  async descargarCsv(desde?: string, hasta?: string): Promise<{ blob: Blob; filename: string }> {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const query = params.toString();
    const { blob, headers } = await this.api.getBlob(
      `/api/resumen/historico/csv${query ? '?' + query : ''}`
    );
    const disp = headers.get('Content-Disposition') ?? '';
    const match = disp.match(/filename[^;=\n]*=(?:(\\?["'])(.*?)\1|([^;\n]*))/i);
    return { blob, filename: match?.[2] ?? match?.[3] ?? 'historico_sismico.csv' };
  }
}
