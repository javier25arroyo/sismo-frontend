export type { PaginatedResponse } from './api.interfaces';

export interface Sismo {
  feSismo: string;
  magnitud: number;
  ubicacion: string;
  coordenadaX: number;
  coordenadaY: number;
  profundidad: number;
  sentido?: string;
  fuente?: string;
  codCentroPrd?: string;
  nomCentroPrd?: string;
  codEstacion?: string;
  nomEstacion?: string;
  feDato?: string;
  vaAceleracion?: number;
  vaDesplazamiento?: number;
}

export interface MagnitudStyle {
  color: string;
  radius: number;
  fillOpacity: number;
}
