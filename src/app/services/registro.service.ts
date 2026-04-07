import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  RegistroRespuesta,
  CrearRegistroSolicitud,
  ActualizarRegistroSolicitud,
  FiltroRegistros
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  constructor(private api: ApiService) {}

  /** GET /api/registros — lista paginada */
  async getRegistros(filtros: FiltroRegistros = {}): Promise<PaginatedResponse<RegistroRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.titulo) params.set('titulo', filtros.titulo);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<RegistroRespuesta>>(
      `/api/registros${query ? '?' + query : ''}`
    );
  }

  /** POST /api/admin/registros */
  async crearRegistro(solicitud: CrearRegistroSolicitud): Promise<RegistroRespuesta> {
    return this.api.post<RegistroRespuesta>('/api/admin/registros', solicitud);
  }

  /** PUT /api/admin/registros/{cod} */
  async actualizarRegistro(cod: number, solicitud: ActualizarRegistroSolicitud): Promise<RegistroRespuesta> {
    return this.api.put<RegistroRespuesta>(`/api/admin/registros/${cod}`, solicitud);
  }

  /** DELETE /api/admin/registros/{cod} */
  async eliminarRegistro(cod: number): Promise<void> {
    return this.api.delete<void>(`/api/admin/registros/${cod}`);
  }
}
