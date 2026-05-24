import { Injectable, signal } from '@angular/core';
import { CentroService } from './centro.service';
import { EstacionRespuesta } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class EstacionesCacheService {
  private readonly _estaciones = signal<EstacionRespuesta[]>([]);
  private _cargado = false;
  private _promesaCarga: Promise<EstacionRespuesta[]> | null = null;

  constructor(private centroService: CentroService) {}

  async getEstaciones(): Promise<EstacionRespuesta[]> {
    if (this._cargado) return this._estaciones();
    if (this._promesaCarga) return this._promesaCarga;

    this._promesaCarga = this.centroService
      .getTodasEstaciones({ size: 500 })
      .then(page => {
        this._estaciones.set(page.content);
        this._cargado = true;
        return page.content;
      })
      .catch(() => {
        this._estaciones.set([]);
        this._cargado = true;
        return [] as EstacionRespuesta[];
      })
      .finally(() => {
        this._promesaCarga = null;
      });

    return this._promesaCarga;
  }

  /** Señal reactiva para usar en templates con OnPush */
  readonly estaciones = this._estaciones.asReadonly();
}
