import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HistorialRsnRespuesta } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class HistorialRsnService {
  constructor(private api: ApiService) {}

  async getHistorialRsn(nombrePlanta?: string, anio?: number): Promise<HistorialRsnRespuesta[]> {
    const params = new URLSearchParams();
    if (nombrePlanta) params.set('nombrePlanta', nombrePlanta);
    if (anio !== undefined && anio !== null) params.set('anio', String(anio));
    const query = params.toString();
    return this.api.get<HistorialRsnRespuesta[]>(`/api/historial-rsn${query ? '?' + query : ''}`);
  }
}
