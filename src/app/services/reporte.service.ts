import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  ReporteRespuesta,
  FiltroReportes,
  GeneracionReporteRespuesta
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private api: ApiService) {}

  /** GET /api/reportes — lista paginada con filtros */
  async getReportes(filtros: FiltroReportes = {}): Promise<PaginatedResponse<ReporteRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.titulo) params.set('titulo', filtros.titulo);
    if (filtros.autor)  params.set('autor', filtros.autor);
    if (filtros.desde)  params.set('desde', filtros.desde);
    if (filtros.hasta)  params.set('hasta', filtros.hasta);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<ReporteRespuesta>>(
      `/api/reportes${query ? '?' + query : ''}`
    );
  }

  /** GET /api/reportes/{feReporte}/descargar - URL de descarga directa */
  getDescargarUrl(feReporte: string): string {
    return this.api.getDownloadUrl(`/api/reportes/${encodeURIComponent(feReporte)}/descargar`);
  }

  /** GET /api/reportes/{feReporte}/descargar - descarga autenticada */
  async descargarReporte(feReporte: string): Promise<{ blob: Blob; headers: Headers }> {
    return this.api.getBlob(`/api/reportes/${encodeURIComponent(feReporte)}/descargar`);
  }

  /**
   * POST /api/admin/reportes — crear reporte (multipart).
   * El body debe ser un FormData con el archivo y opcionalmente
   * los metadatos serializados como JSON en el part "metadata".
   */
  async crearReporte(formData: FormData): Promise<ReporteRespuesta> {
    return this.api.postFormData<ReporteRespuesta>('/api/admin/reportes', formData);
  }

  /** DELETE /api/admin/reportes/{feReporte} */
  async eliminarReporte(feReporte: string): Promise<void> {
    return this.api.delete<void>(`/api/admin/reportes/${encodeURIComponent(feReporte)}`);
  }

  // ─── Generación de reportes ───────────────────────────────────────────────

  /** POST /api/admin/reportes/generacion — solicitar generación automática */
  async solicitarGeneracion(feSismo: string, magnitud: number): Promise<GeneracionReporteRespuesta> {
    return this.api.post<GeneracionReporteRespuesta>(
      '/api/admin/reportes/generacion',
      { feSismo, magnitud }
    );
  }

  /** GET /api/admin/reportes/generacion/{id} — consultar estado */
  async consultarEstadoGeneracion(id: string): Promise<GeneracionReporteRespuesta> {
    return this.api.get<GeneracionReporteRespuesta>(
      `/api/admin/reportes/generacion/${encodeURIComponent(id)}`
    );
  }

  /** GET /api/admin/reportes/generacion/mis-generaciones */
  async getMisGeneraciones(): Promise<GeneracionReporteRespuesta[]> {
    return this.api.get<GeneracionReporteRespuesta[]>(
      '/api/admin/reportes/generacion/mis-generaciones'
    );
  }

  /** DELETE /api/admin/reportes/generacion/{id} — cancelar */
  async cancelarGeneracion(id: string): Promise<void> {
    return this.api.delete<void>(`/api/admin/reportes/generacion/${encodeURIComponent(id)}`);
  }

  /**
   * GET /api/reportes/consolidado/csv — CSV server-side de sismos por rango de fechas.
   * Ambas fechas deben ser ISO-8601 LocalDateTime (ej. "2024-01-01T00:00:00").
   */
  async descargarConsolidadoCsv(desde: string, hasta: string): Promise<{ blob: Blob; filename: string }> {
    const params = new URLSearchParams({ desde, hasta });
    const { blob, headers } = await this.api.getBlob(`/api/reportes/consolidado/csv?${params}`);
    const disp = headers.get('Content-Disposition') ?? '';
    const match = disp.match(/filename[^;=\n]*=(?:(\\?["'])(.*?)\1|([^;\n]*))/i);
    return { blob, filename: match?.[2] ?? match?.[3] ?? `sismos_${desde.slice(0, 10)}_${hasta.slice(0, 10)}.csv` };
  }

  /**
   * GET /api/reportes/consolidado — PDF consolidado de todos los sismos en un rango.
   * Ambas fechas deben ser ISO-8601 LocalDateTime (ej. "2024-01-01T00:00:00").
   */
  async descargarConsolidadoPdf(desde: string, hasta: string): Promise<{ blob: Blob; filename: string }> {
    const params = new URLSearchParams({ desde, hasta });
    const { blob, headers } = await this.api.getBlob(`/api/reportes/consolidado?${params}`);
    const disp = headers.get('Content-Disposition') ?? '';
    const match = disp.match(/filename[^;=\n]*=(?:(\\?["'])(.*?)\1|([^;\n]*))/i);
    return { blob, filename: match?.[2] ?? match?.[3] ?? `consolidado_${desde.slice(0, 10)}_${hasta.slice(0, 10)}.pdf` };
  }
}
