import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  CalculoUmbralEstacionRespuesta,
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

  /** GET /api/admin/calcular-umbrales — previsualiza el límite calculado por estación */
  async calcularUmbralEstacion(
    codCentroPrd: string,
    codEstacion: string,
    codParametro: number,
    codUmbral: string
  ): Promise<CalculoUmbralEstacionRespuesta> {
    const params = new URLSearchParams({
      codCentroPrd,
      codEstacion,
      codParametro: String(codParametro),
      codUmbral
    });
    return this.api.get<CalculoUmbralEstacionRespuesta>(
      `/api/admin/calcular-umbrales?${params.toString()}`
    );
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
