import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  CentroProduccionRespuesta,
  CrearCentroProduccionSolicitud,
  ActualizarCentroProduccionSolicitud,
  EstacionRespuesta,
  CrearEstacionSolicitud,
  ActualizarEstacionSolicitud,
  PaginatedResponse
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class CentroService {
  constructor(private api: ApiService) {}

  // ─── Centros de producción ────────────────────────────────────────────────

  /** GET /api/centros */
  async getCentros(codigo?: string, nombre?: string, page = 0, size = 100): Promise<PaginatedResponse<CentroProduccionRespuesta>> {
    const params = new URLSearchParams();
    if (codigo) params.set('codigo', codigo);
    if (nombre) params.set('nombre', nombre);
    params.set('page', String(page));
    params.set('size', String(size));
    return this.api.get<PaginatedResponse<CentroProduccionRespuesta>>(
      `/api/centros?${params.toString()}`
    );
  }

  /** POST /api/admin/centros */
  async crearCentro(solicitud: CrearCentroProduccionSolicitud): Promise<CentroProduccionRespuesta> {
    return this.api.post<CentroProduccionRespuesta>('/api/admin/centros', solicitud);
  }

  /** PUT /api/admin/centros/{codigo} */
  async actualizarCentro(codigo: string, solicitud: ActualizarCentroProduccionSolicitud): Promise<CentroProduccionRespuesta> {
    return this.api.put<CentroProduccionRespuesta>(
      `/api/admin/centros/${encodeURIComponent(codigo)}`,
      solicitud
    );
  }

  /** DELETE /api/admin/centros/{codigo} */
  async eliminarCentro(codigo: string): Promise<void> {
    return this.api.delete<void>(`/api/admin/centros/${encodeURIComponent(codigo)}`);
  }

  // ─── Estaciones ───────────────────────────────────────────────────────────

  /** GET /api/centros/{codigoCentro}/estaciones */
  async getEstaciones(
    codigoCentro: string,
    filtros: { codigoEstacion?: string; nombre?: string; minX?: number; maxX?: number; minY?: number; maxY?: number; page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<EstacionRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.codigoEstacion) params.set('codigoEstacion', filtros.codigoEstacion);
    if (filtros.nombre)         params.set('nombre', filtros.nombre);
    if (filtros.minX !== undefined) params.set('minX', String(filtros.minX));
    if (filtros.maxX !== undefined) params.set('maxX', String(filtros.maxX));
    if (filtros.minY !== undefined) params.set('minY', String(filtros.minY));
    if (filtros.maxY !== undefined) params.set('maxY', String(filtros.maxY));
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<EstacionRespuesta>>(
      `/api/centros/${encodeURIComponent(codigoCentro)}/estaciones${query ? '?' + query : ''}`
    );
  }

  /** POST /api/admin/estaciones */
  async crearEstacion(solicitud: CrearEstacionSolicitud): Promise<EstacionRespuesta> {
    return this.api.post<EstacionRespuesta>('/api/admin/estaciones', solicitud);
  }

  /** PUT /api/admin/estaciones/{codCentro}/{codEstacion} */
  async actualizarEstacion(
    codCentro: string,
    codEstacion: string,
    solicitud: ActualizarEstacionSolicitud
  ): Promise<EstacionRespuesta> {
    return this.api.put<EstacionRespuesta>(
      `/api/admin/estaciones/${encodeURIComponent(codCentro)}/${encodeURIComponent(codEstacion)}`,
      solicitud
    );
  }

  /** DELETE /api/admin/estaciones/{codCentro}/{codEstacion} */
  async eliminarEstacion(codCentro: string, codEstacion: string): Promise<void> {
    return this.api.delete<void>(
      `/api/admin/estaciones/${encodeURIComponent(codCentro)}/${encodeURIComponent(codEstacion)}`
    );
  }
}
