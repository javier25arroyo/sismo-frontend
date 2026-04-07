import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  AlarmaPorEstacionRespuesta,
  CrearAlarmaPorEstacionSolicitud,
  ActualizarAlarmaPorEstacionSolicitud,
  FiltroAlarmas
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AlarmaService {
  constructor(private api: ApiService) {}

  /** GET /api/alarmas — lista paginada con filtros */
  async getAlarmas(filtros: FiltroAlarmas = {}): Promise<PaginatedResponse<AlarmaPorEstacionRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.codCentroPrd) params.set('codCentroPrd', filtros.codCentroPrd);
    if (filtros.codEstacion)  params.set('codEstacion', filtros.codEstacion);
    if (filtros.page !== undefined) params.set('page', String(filtros.page));
    if (filtros.size !== undefined) params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<AlarmaPorEstacionRespuesta>>(
      `/api/alarmas${query ? '?' + query : ''}`
    );
  }

  /** POST /api/admin/alarmas */
  async crearAlarma(solicitud: CrearAlarmaPorEstacionSolicitud): Promise<AlarmaPorEstacionRespuesta> {
    return this.api.post<AlarmaPorEstacionRespuesta>('/api/admin/alarmas', solicitud);
  }

  /** PUT /api/admin/alarmas/{codCentroPrd}/{codEstacion}/{codParametro}/{codUmbral} */
  async actualizarAlarma(
    codCentroPrd: string,
    codEstacion: string,
    codParametro: number,
    codUmbral: string,
    solicitud: ActualizarAlarmaPorEstacionSolicitud
  ): Promise<AlarmaPorEstacionRespuesta> {
    const path = [codCentroPrd, codEstacion, String(codParametro), codUmbral]
      .map(encodeURIComponent)
      .join('/');
    return this.api.put<AlarmaPorEstacionRespuesta>(`/api/admin/alarmas/${path}`, solicitud);
  }

  /** DELETE /api/admin/alarmas/{codCentroPrd}/{codEstacion}/{codParametro}/{codUmbral} */
  async eliminarAlarma(
    codCentroPrd: string,
    codEstacion: string,
    codParametro: number,
    codUmbral: string
  ): Promise<void> {
    const path = [codCentroPrd, codEstacion, String(codParametro), codUmbral]
      .map(encodeURIComponent)
      .join('/');
    return this.api.delete<void>(`/api/admin/alarmas/${path}`);
  }
}
