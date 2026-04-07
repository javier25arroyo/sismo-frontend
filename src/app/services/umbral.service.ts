import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  UmbralRespuesta,
  CrearUmbralSolicitud,
  ActualizarUmbralSolicitud
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class UmbralService {
  constructor(private api: ApiService) {}

  /** GET /api/umbrales/{codParametro} — umbrales para un parámetro */
  async getUmbralesPorParametro(codParametro: number): Promise<UmbralRespuesta[]> {
    return this.api.get<UmbralRespuesta[]>(`/api/umbrales/${codParametro}`);
  }

  /** POST /api/admin/umbrales */
  async crearUmbral(solicitud: CrearUmbralSolicitud): Promise<UmbralRespuesta> {
    return this.api.post<UmbralRespuesta>('/api/admin/umbrales', solicitud);
  }

  /** PUT /api/admin/umbrales/{codParametro}/{codUmbral} */
  async actualizarUmbral(
    codParametro: number,
    codUmbral: string,
    solicitud: ActualizarUmbralSolicitud
  ): Promise<UmbralRespuesta> {
    return this.api.put<UmbralRespuesta>(
      `/api/admin/umbrales/${codParametro}/${encodeURIComponent(codUmbral)}`,
      solicitud
    );
  }

  /** DELETE /api/admin/umbrales/{codParametro}/{codUmbral} */
  async eliminarUmbral(codParametro: number, codUmbral: string): Promise<void> {
    return this.api.delete<void>(
      `/api/admin/umbrales/${codParametro}/${encodeURIComponent(codUmbral)}`
    );
  }
}
