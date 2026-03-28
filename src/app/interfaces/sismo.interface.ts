/**
 * Representa un sismo con su información básica para visualización en mapa.
 */
export interface Sismo {
  feSismo: string;
  magnitud: number;
  profundidad: number;
  coordenadaX: number; // Longitud
  coordenadaY: number; // Latitud
  ubicacion: string;
  fuente?: string;
}

/**
 * Respuesta paginada del backend.
 */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Configuración para el estilo de marcadores según magnitud.
 */
export interface MagnitudStyle {
  color: string;
  radius: number;
  fillOpacity: number;
}
