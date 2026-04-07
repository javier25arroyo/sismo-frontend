import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  GrupoDespliegueRespuesta,
  CrearGrupoDespliegueSolicitud,
  ActualizarGrupoDespliegueSolicitud
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  constructor(private api: ApiService) {}

  /** GET /api/grupos — lista paginada */
  async getGrupos(page = 0, size = 100): Promise<PaginatedResponse<GrupoDespliegueRespuesta>> {
    return this.api.get<PaginatedResponse<GrupoDespliegueRespuesta>>(
      `/api/grupos?page=${page}&size=${size}`
    );
  }

  /** POST /api/admin/grupos */
  async crearGrupo(solicitud: CrearGrupoDespliegueSolicitud): Promise<GrupoDespliegueRespuesta> {
    return this.api.post<GrupoDespliegueRespuesta>('/api/admin/grupos', solicitud);
  }

  /** PUT /api/admin/grupos/{id} */
  async actualizarGrupo(id: number, solicitud: ActualizarGrupoDespliegueSolicitud): Promise<GrupoDespliegueRespuesta> {
    return this.api.put<GrupoDespliegueRespuesta>(`/api/admin/grupos/${id}`, solicitud);
  }

  /** DELETE /api/admin/grupos/{id} */
  async eliminarGrupo(id: number): Promise<void> {
    return this.api.delete<void>(`/api/admin/grupos/${id}`);
  }
}
