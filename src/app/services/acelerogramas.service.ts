import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ResumenAcelerogramaEstacionRespuesta } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AcelerogramasService {
  constructor(private api: ApiService) {}

  /**
   * GET /api/acelerogramas/resumen-por-estacion
   * Obtiene resumen de acelerogramas agrupados por estación para una fecha de terremoto.
   * @param feTerremoto Fecha y hora del terremoto en formato ISO-8601 (ej: 2024-03-18T12:00:00)
   * @returns Mapa con código de estación como clave y resumen como valor
   */
  async obtenerResumenPorEstacion(feTerremoto: string): Promise<Map<string, ResumenAcelerogramaEstacionRespuesta>> {
    const response = await this.api.get<Record<string, ResumenAcelerogramaEstacionRespuesta>>(
      `/api/acelerogramas/resumen-por-estacion?feTerremoto=${encodeURIComponent(feTerremoto)}`
    );
    return new Map(Object.entries(response));
  }

  /**
   * GET /api/acelerogramas
   * Lista acelerogramas con filtros opcionales.
   * @param feTerremoto Fecha del terremoto (opcional)
   * @param coEstacion Código de la estación (opcional)
   * @param page Página (0-indexed)
   * @param size Tamaño de página
   * @returns Respuesta paginada de acelerogramas
   */
  async listarAcelerogramas(
    feTerremoto?: string,
    coEstacion?: string,
    page?: number,
    size?: number
  ): Promise<any> {
    const params = new URLSearchParams();
    if (feTerremoto) params.set('feTerremoto', feTerremoto);
    if (coEstacion) params.set('coEstacion', coEstacion);
    if (page !== undefined) params.set('page', String(page));
    if (size !== undefined) params.set('size', String(size));
    const query = params.toString();
    return this.api.get<any>(`/api/acelerogramas${query ? '?' + query : ''}`);
  }
}
