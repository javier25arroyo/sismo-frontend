// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// ─── Autenticación ────────────────────────────────────────────────────────────

export interface SolicitudLogin {
  username: string;
  password: string;
}

export interface RespuestaLogin {
  token: string;
  role: string;
  expiresIn: number;
  passwordExpiraDias: number;
  debeCambiarPassword: boolean;
  esPrimerLogin: boolean;
}

export interface CambiarContrasenaSolicitud {
  nombreUsuario?: string;
  passwordActual: string;
  passwordNueva: string;
}

export interface CambiarContrasenaRespuesta {
  exitoso: boolean;
  mensaje: string;
  diasHastaProximaExpiracion: number;
}

// ─── Sismos ───────────────────────────────────────────────────────────────────

/** Respuesta del endpoint GET /api/sismos (lista paginada general) */
export interface SismoRespuesta {
  feSismo: string;
  magnitud: number;
  ubicacion: string;
  coordenadaX: number;
  coordenadaY: number;
  profundidad: number;
  distanciaHipocentral?: number | null;
  distanciaEpicentral?: number | null;
  sentido?: string;
}

/** Respuesta del endpoint GET /api/sismos/ultimo/resumen */
export interface SismoResumenRespuesta {
  codCentroPrd: string;
  nomCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  feDato: string;
  vaAceleracion?: number;
  vaDesplazamiento?: number;
  feSismo: string;
  magnitud: number;
  profundidad: number;
  ubicacion: string;
  coordenadaX: number;
  coordenadaY: number;
  distanciaHipocentral?: number | null;
  distanciaEpicentral?: number | null;
  /** No retornado por el backend; se mantiene por compatibilidad con vistas existentes */
  fuente?: string;
}

/** Respuesta del endpoint GET /api/sismos/ultimo */
export interface SismoUltimoRespuesta {
  feSismo: string;
  magnitud: number;
  ubicacion: string;
  coordenadaX: number;
  coordenadaY: number;
  profundidad: number;
  distanciaHipocentral?: number | null;
  distanciaEpicentral?: number | null;
}

// ─── Centros de producción ────────────────────────────────────────────────────

export interface CentroProduccionRespuesta {
  codCentroPrd: string;
  nomCentroPrd: string;
}

export interface CrearCentroProduccionSolicitud {
  codCentroPrd: string;
  nomCentroPrd: string;
  coordenadaX: number;
  coordenadaY: number;
  grupoDespliegue: number;
}

export interface ActualizarCentroProduccionSolicitud {
  nomCentroPrd: string;
  coordenadaX: number;
  coordenadaY: number;
  grupoDespliegue: number;
}

// ─── Estaciones ───────────────────────────────────────────────────────────────

/** Estado operativo de una estación sísmica */
export type EstadoEstacion = 'ACTIVA' | 'MANTENIMIENTO' | 'FUERA_DE_SERVICIO';

export interface EstacionRespuesta {
  codCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  coordenadaX: number;
  coordenadaY: number;
  estado: EstadoEstacion;
  modInst?: string;
}

export interface CrearEstacionSolicitud {
  codCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  coordenadaX: number;
  coordenadaY: number;
  nuSerie?: string;
  idCanal?: number;
  tipoInstrumento?: string;
  eleEstacion?: number;
  tipoSuelo?: string;
  condiSitio?: string;
  deltaT?: number;
  azimut?: number;
  chn1Long?: string;
  chn2Vert?: string;
  chn3Trans?: string;
  bitWeightCh1?: number;
  bitWeightCh2?: number;
  bitWeightCh3?: number;
  vpuCh1?: number;
  vpuCh2?: number;
  vpuCh3?: number;
  modInst?: string;
  estado?: EstadoEstacion;
}

export interface ActualizarEstacionSolicitud {
  nomEstacion?: string;
  coordenadaX?: number;
  coordenadaY?: number;
  nuSerie?: string;
  idCanal?: number;
  tipoInstrumento?: string;
  eleEstacion?: number;
  tipoSuelo?: string;
  condiSitio?: string;
  deltaT?: number;
  azimut?: number;
  chn1Long?: string;
  chn2Vert?: string;
  chn3Trans?: string;
  bitWeightCh1?: number;
  bitWeightCh2?: number;
  bitWeightCh3?: number;
  vpuCh1?: number;
  vpuCh2?: number;
  vpuCh3?: number;
  modInst?: string;
  estado?: string;
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

export interface ReporteRespuesta {
  fecha: string;
  titulo: string;
  resumen?: string;
  url?: string;
  autor?: string;
}

export interface CrearReporteSolicitud {
  tituloReporte: string;
  resumen?: string;
  url?: string;
  autor: string;
}

// ─── Registros ────────────────────────────────────────────────────────────────

export interface RegistroRespuesta {
  codRegistro: number;
  tituloRegistro: string;
  feRegistro: string;
  nomRegistro: string;
  elevacionEstacion?: number;
  tipoSuelo?: string;
  condSitio?: string;
  azimut?: number;
  deltaT?: number;
  canal1?: number;
  canal2?: number;
  canal3?: number;
  freqMinFilt?: number;
  freqMaxFilt?: number;
  numPuntos?: number;
  distEpicentral?: number;
  distHipocentral?: number;
}

export interface CrearRegistroSolicitud {
  codRegistro: number;
  tituloRegistro: string;
  feRegistro: string;
  nomRegistro: string;
  elevacionEstacion: number;
  tipoSuelo: string;
  condSitio: string;
  azimut: number;
  deltaT: number;
  canal1: number;
  canal2: number;
  canal3: number;
  freqMinFilt: number;
  freqMaxFilt: number;
  numPuntos: number;
  distEpicentral: number;
  distHipocentral: number;
}

export interface ActualizarRegistroSolicitud {
  tituloRegistro: string;
  feRegistro: string;
  nomRegistro: string;
  elevacionEstacion: number;
  tipoSuelo: string;
  condSitio: string;
  azimut: number;
  deltaT: number;
  canal1: number;
  canal2: number;
  canal3: number;
  freqMinFilt: number;
  freqMaxFilt: number;
  numPuntos: number;
  distEpicentral: number;
  distHipocentral: number;
}

// ─── Acelerogramas ────────────────────────────────────────────────────────────

export interface AcelerogramaRespuesta {
  feTerremoto: string;
  coEstacion: string;
  canal: string;
  sitio: string;
  instrumento: string;
  timeSeg: number;
  aceleracion: number;
}

export interface ResumenAcelerogramaEstacionRespuesta {
  coEstacion: string;
  sitio: string;
  instrumento: string;
  canal: string;
  aceleracionMaxima: number;
  aceleracionPromedio: number;
  totalRegistros: number;
}

// ─── Alarmas ─────────────────────────────────────────────────────────────────

export interface AlarmaPorEstacionRespuesta {
  codCentroPrd: string;
  codEstacion: string;
  codParametro: number;
  codUmbral: string;
  limiteInferior: number;
}

export interface CrearAlarmaPorEstacionSolicitud {
  codCentroPrd: string;
  codEstacion: string;
  codParametro: number;
  codUmbral: string;
  limiteInferior: number | null;
}

export interface ActualizarAlarmaPorEstacionSolicitud {
  limiteInferior: number;
}

// ─── Criterios ────────────────────────────────────────────────────────────────

export interface CriterioRespuesta {
  numRegla: number;
  magnitudMin?: number;
  distanciaHipocenMax?: number;
}

export interface CrearCriterioSolicitud {
  numRegla: number;
  magnitudMin?: number;
  distanciaHipocenMax?: number;
}

export interface ActualizarCriterioSolicitud {
  magnitudMin?: number;
  distanciaHipocenMax?: number;
}

// ─── Umbrales ─────────────────────────────────────────────────────────────────

export interface UmbralRespuesta {
  codParametro: number;
  codUmbral: string;
  limiteInferior: number;
  mensaje?: string;
  color?: string;
}

export interface CrearUmbralSolicitud {
  codParametro: number;
  codUmbral: string;
  limiteInferior: number;
  mensaje?: string;
  color?: string;
}

export interface ActualizarUmbralSolicitud {
  limiteInferior: number;
  mensaje?: string;
  color?: string;
}

export interface CalculoUmbralEstacionRespuesta {
  codCentroPrd: string;
  codEstacion: string;
  codParametro: number;
  codUmbral: string;
  limiteGlobal: number;
  limiteInferiorCalculado: number;
  factorSuelo: number;
  factorSitio: number;
  factorCalibracion: number;
  factorTotal: number;
  limiteSinPiso: number;
  limiteMinimo: number;
  pisoMinimoAplicado: boolean;
}

// ─── Grupos de despliegue ─────────────────────────────────────────────────────

export interface GrupoDespliegueRespuesta {
  idRegion: number;
  nombreRegion: string;
}

export interface CrearGrupoDespliegueSolicitud {
  idRegion: number;
  nombreRegion: string;
}

export interface ActualizarGrupoDespliegueSolicitud {
  nombreRegion: string;
}

// ─── Parámetros de intensidad ─────────────────────────────────────────────────

export interface ParametroIntensidadRespuesta {
  codParametro: number;
  nomParametro: string;
  unidadMedida: string;
  simboloUnidad: string;
}

export interface CrearParametroIntensidadSolicitud {
  codParametro: number;
  nomParametro: string;
  unidadMedida: string;
  simboloUnidad: string;
}

export interface ActualizarParametroIntensidadSolicitud {
  nomParametro?: string;
  unidadMedida?: string;
  simboloUnidad?: string;
}

// ─── Resumen histórico ────────────────────────────────────────────────────────

export interface ResumenHistoricoRespuesta {
  codCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  xEstacion: number;
  yEstacion: number;
  feSismo: string;
  xSismo: number;
  ySismo: number;
  vaAceleracion?: number;
  magnitud: number;
  profundidad: number;
  distanciaHipocentral?: number;
  vaDesplazamiento?: number;
  feDato: string;
}

// ─── Vista Terremoto ──────────────────────────────────────────────────────────

export interface VistaTerremotoRespuesta {
  feTerremoto: string;
  coEstacion: string;
  canal: string;
  sitio: string;
  instrumento: string;
  pga: number;
}

// ─── Valores alerta estación ──────────────────────────────────────────────────

export interface ValorAlertaEstacionRespuesta {
  codCentroPrd: string;
  codEstacion: string;
  codParametro: number;
  nivel0?: number;
  nivel1?: number;
  nivel2?: number;
  nivel3?: number;
}

// ─── Generación de reportes ───────────────────────────────────────────────────

export interface GeneracionReporteRespuesta {
  id: string;
  feSismo: string;
  magnitud: number;
  estado: string;
  mensajeEstado?: string;
  mensajeError?: string;
  fechaCreacion: string;
  fechaInicio?: string;
  fechaFin?: string;
  tiempoTranscurridoSegundos?: number;
  finalizado: boolean;
}

// ─── Importación histórica ────────────────────────────────────────────────────

export interface ImportarHistoricoRssRespuesta {
  paginasProcesadas: number;
  eventosNuevos: number;
  eventosOmitidos: number;
}

export interface ImportarHistoricoRssSolicitud {
  startDesde?: number;
  startHasta?: number;
  delaySegundos?: number;
}

// ─── Usuarios (Admin) ─────────────────────────────────────────────────────────

export interface UsuarioRespuesta {
  cedula: string;
  nombreCompl: string;
  correoE: string;
  telOficina?: string;
  numCelular?: string;
  estadoActivo: boolean;
  usuarioNombre: string;
  ultimoAcceso?: string;
}

export interface CrearUsuarioSolicitud {
  cedula: string;
  nombreCompl: string;
  correoE: string;
  telOficina?: string;
  numCelular?: string;
  estadoActivo: boolean;
  usuarioNombre: string;
  password?: string;
}

export interface ActualizarUsuarioSolicitud {
  nombreCompl: string;
  correoE: string;
  telOficina?: string;
  numCelular?: string;
  estadoActivo: boolean;
  usuarioNombre: string;
  password?: string;
}

export interface RestablecerContrasenaRespuesta {
  cedula: string;
  nombreUsuario: string;
  passwordTemporal: string;
  mensaje: string;
}

// ─── Filtros comunes ──────────────────────────────────────────────────────────

export interface FiltroSismos {
  codCentroPrd?: string;
  codEstacion?: string;
  desde?: string;
  hasta?: string;
  magnitudMin?: number;
  magnitudMax?: number;
  sentido?: string;
  page?: number;
  size?: number;
}

export interface FiltroReportes {
  titulo?: string;
  autor?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}

export interface FiltroUsuarios {
  cedula?: string;
  estadoActivo?: boolean;
  page?: number;
  size?: number;
}

export interface FiltroAlarmas {
  codCentroPrd?: string;
  codEstacion?: string;
  page?: number;
  size?: number;
}

export interface FiltroAcelerogramas {
  feTerremoto?: string;
  coEstacion?: string;
  page?: number;
  size?: number;
}

export interface FiltroResumenHistorico {
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}

export interface FiltroRegistros {
  titulo?: string;
  page?: number;
  size?: number;
}

export interface FiltroAlertas {
  codCentroPrd?: string;
  codEstacion?: string;
  page?: number;
  size?: number;
}

export interface FiltroTerremotos {
  feTerremoto?: string;
  coEstacion?: string;
  page?: number;
  size?: number;
}

// ─── Historial Sismos (Acelerógrafos) ────────────────────────────────────────

export interface HistorialSismoRespuesta {
  codCentroPrd: string;
  nomCentroPrd: string;
  codEstacion: string;
  nomEstacion: string;
  xEstacion: number;
  yEstacion: number;
  feDato: string;
  feSismo: string;
  vaAceleracion: number | null;
  vaDesplazamiento: number | null;
  magnitud: number;
  profundidad: number;
  coordenadaX: number;
  coordenadaY: number;
  distanciaHipocentral: number | null;
  distanciaEpicentral: number | null;
  ubicacion: string;
}

// ─── Historial RSN ────────────────────────────────────────────────────────────

export interface HistorialRsnRespuesta {
  feSismo: string;
  coordenadaY: number;
  coordenadaX: number;
  profundidad: number;
  magnitud: number;
  distanciaHipocentral: number | null;
  distanciaEpicentral: number | null;
  tipoSismo: string | null;
  ubicacion: string;
  nombre: string;
  coordenadaYPlanta: number;
  coordenadaXPlanta: number;
  rango: number;
}
