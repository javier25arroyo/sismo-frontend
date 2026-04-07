import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  ParametroIntensidadRespuesta,
  CrearParametroIntensidadSolicitud,
  ActualizarParametroIntensidadSolicitud
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ParametroIntensidadService {
  constructor(private api: ApiService) {}

  /** GET /api/admin/parametros-intensidad — lista paginada */
  async getParametros(page = 0, size = 100): Promise<PaginatedResponse<ParametroIntensidadRespuesta>> {
    return this.api.get<PaginatedResponse<ParametroIntensidadRespuesta>>(
      `/api/admin/parametros-intensidad?page=${page}&size=${size}`
    );
  }

  /** GET /api/admin/parametros-intensidad/{codParametro} */
  async getParametro(codParametro: number): Promise<ParametroIntensidadRespuesta> {
    return this.api.get<ParametroIntensidadRespuesta>(
      `/api/admin/parametros-intensidad/${codParametro}`
    );
  }

  /** POST /api/admin/parametros-intensidad */
  async crearParametro(solicitud: CrearParametroIntensidadSolicitud): Promise<ParametroIntensidadRespuesta> {
    return this.api.post<ParametroIntensidadRespuesta>('/api/admin/parametros-intensidad', solicitud);
  }

  /** PUT /api/admin/parametros-intensidad/{codParametro} */
  async actualizarParametro(
    codParametro: number,
    solicitud: ActualizarParametroIntensidadSolicitud
  ): Promise<ParametroIntensidadRespuesta> {
    return this.api.put<ParametroIntensidadRespuesta>(
      `/api/admin/parametros-intensidad/${codParametro}`,
      solicitud
    );
  }

  /** DELETE /api/admin/parametros-intensidad/{codParametro} */
  async eliminarParametro(codParametro: number): Promise<void> {
    return this.api.delete<void>(`/api/admin/parametros-intensidad/${codParametro}`);
  }
}
