import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  CriterioRespuesta,
  CrearCriterioSolicitud,
  ActualizarCriterioSolicitud
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class CriterioService {
  constructor(private api: ApiService) {}

  /** GET /api/admin/criterios — todos los criterios */
  async getCriterios(): Promise<CriterioRespuesta[]> {
    return this.api.get<CriterioRespuesta[]>('/api/admin/criterios');
  }

  /** GET /api/admin/criterios/{numRegla} */
  async getCriterio(numRegla: number): Promise<CriterioRespuesta> {
    return this.api.get<CriterioRespuesta>(`/api/admin/criterios/${numRegla}`);
  }

  /** POST /api/admin/criterios */
  async crearCriterio(solicitud: CrearCriterioSolicitud): Promise<CriterioRespuesta> {
    return this.api.post<CriterioRespuesta>('/api/admin/criterios', solicitud);
  }

  /** PUT /api/admin/criterios/{numRegla} */
  async actualizarCriterio(numRegla: number, solicitud: ActualizarCriterioSolicitud): Promise<CriterioRespuesta> {
    return this.api.put<CriterioRespuesta>(`/api/admin/criterios/${numRegla}`, solicitud);
  }

  /** DELETE /api/admin/criterios/{numRegla} */
  async eliminarCriterio(numRegla: number): Promise<void> {
    return this.api.delete<void>(`/api/admin/criterios/${numRegla}`);
  }
}
