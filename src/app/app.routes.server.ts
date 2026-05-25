import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '',                    renderMode: RenderMode.Server },
  { path: 'historial',           renderMode: RenderMode.Server },
  { path: 'sismos',              renderMode: RenderMode.Server },
  { path: 'estaciones',          renderMode: RenderMode.Server },
  { path: 'consultas',           renderMode: RenderMode.Server },
  { path: 'acceso',              renderMode: RenderMode.Client },
  { path: 'recuperar-acceso',    renderMode: RenderMode.Client },
  { path: 'cambiar-contrasena',  renderMode: RenderMode.Client },
  { path: 'repositorio',         renderMode: RenderMode.Client },
  { path: 'profile',             renderMode: RenderMode.Client },
  { path: 'umbrales-estaciones', renderMode: RenderMode.Client },
  { path: '**',                  renderMode: RenderMode.Server },
];
