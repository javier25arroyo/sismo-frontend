import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  AcelerogramaRespuesta,
  PaginatedResponse,
  ResumenAlertaSismicaRespuesta
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AcelerogramasService {
  constructor(private api: ApiService) {}

  /**
   * GET /api/acelerogramas/resumen-por-estacion
   * Obtiene resumen de acelerogramas por estación para una fecha de terremoto.
   * @param feTerremoto Fecha y hora del terremoto en formato ISO-8601 (ej: 2024-03-18T12:00:00)
   * @returns Lista de estaciones con aceleración, desplazamiento, distancia y alerta calculada.
   */
  async obtenerResumenPorEstacion(feTerremoto: string): Promise<ResumenAlertaSismicaRespuesta[]> {
    return this.api.get<ResumenAlertaSismicaRespuesta[]>(
      `/api/acelerogramas/resumen-por-estacion?feTerremoto=${encodeURIComponent(feTerremoto)}`
    );
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
  ): Promise<PaginatedResponse<AcelerogramaRespuesta>> {
    const params = new URLSearchParams();
    if (feTerremoto) params.set('feTerremoto', feTerremoto);
    if (coEstacion) params.set('coEstacion', coEstacion);
    if (page !== undefined) params.set('page', String(page));
    if (size !== undefined) params.set('size', String(size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<AcelerogramaRespuesta>>(
      `/api/acelerogramas${query ? '?' + query : ''}`
    );
  }
}
