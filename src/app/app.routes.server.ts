import { type ServerRoute } from '@angular/ssr';
import { serverRoute } from './routing/server-render-policy';

export const serverRoutes: ServerRoute[] = [
  serverRoute(''),
  serverRoute('historial'),
  serverRoute('sismos'),
  serverRoute('estaciones'),
  serverRoute('consultas'),
  serverRoute('acceso'),
  serverRoute('recuperar-acceso'),
  serverRoute('cambiar-contrasena'),
  serverRoute('repositorio'),
  serverRoute('profile'),
  serverRoute('umbrales-estaciones'),
  serverRoute('**')
];
