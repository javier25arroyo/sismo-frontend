import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  ImportarHistoricoRssRespuesta,
  ImportarHistoricoRssSolicitud
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ImportarHistoricoService {
  constructor(private api: ApiService) {}

  /**
   * POST /api/admin/sismos/importar-historico
   * Importa eventos sísmicos históricos desde el RSS de la RSN.
   */
  async importarHistorico(solicitud: ImportarHistoricoRssSolicitud = {}): Promise<ImportarHistoricoRssRespuesta> {
    return this.api.post<ImportarHistoricoRssRespuesta>(
      '/api/admin/sismos/importar-historico',
      solicitud
    );
  }
}
