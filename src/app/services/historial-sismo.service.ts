import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HistorialSismoRespuesta } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class HistorialSismoService {
  constructor(private api: ApiService) {}

  async getHistorial(planta?: string, anio?: number): Promise<HistorialSismoRespuesta[]> {
    const params = new URLSearchParams();
    if (planta) params.set('planta', planta);
    if (anio !== undefined && anio !== null) params.set('anio', String(anio));
    const query = params.toString();
    return this.api.get<HistorialSismoRespuesta[]>(`/api/historial-sismos${query ? '?' + query : ''}`);
  }

  async descargarCsv(planta?: string, anio?: number): Promise<{ blob: Blob; filename: string }> {
    const params = new URLSearchParams();
    if (planta) params.set('planta', planta);
    if (anio !== undefined && anio !== null) params.set('anio', String(anio));
    const query = params.toString();
    const { blob, headers } = await this.api.getBlob(`/api/historial-sismos/csv${query ? '?' + query : ''}`);
    const disp = headers.get('Content-Disposition') ?? '';
    const match = disp.match(/filename[^;=\n]*=(?:(\\?["'])(.*?)\1|([^;\n]*))/i);
    return { blob, filename: match?.[2] ?? match?.[3] ?? 'historial_sismos.csv' };
  }
}
