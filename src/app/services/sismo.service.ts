import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Sismo, PaginatedResponse } from '../interfaces/sismo.interface';

@Injectable({ providedIn: 'root' })
export class SismoService {
  constructor(private api: ApiService) {}

  /**
   * Obtiene los sismos más recientes.
   * @param limit Cantidad máxima de sismos a obtener (default: 50)
   */
  async getUltimosSismos(limit = 50): Promise<Sismo[]> {
    const response = await this.api.get<PaginatedResponse<Sismo>>(
      `/api/sismos/resumen?size=${limit}&sort=feSismo,desc`
    );
    return response.content;
  }

  /**
   * Obtiene sismos filtrados por rango de fechas.
   */
  async getSismosPorFecha(desde: string, hasta: string): Promise<Sismo[]> {
    const response = await this.api.get<PaginatedResponse<Sismo>>(
      `/api/sismos/resumen?desde=${desde}&hasta=${hasta}&size=100`
    );
    return response.content;
  }

  /**
   * Obtiene sismos filtrados por magnitud mínima.
   */
  async getSismosPorMagnitud(magnitudMin: number): Promise<Sismo[]> {
    const response = await this.api.get<PaginatedResponse<Sismo>>(
      `/api/sismos/resumen?magnitudMin=${magnitudMin}&size=100`
    );
    return response.content;
  }
}
