import { RenderMode, type ServerRoute } from '@angular/ssr';

export const MAP_ROUTE_PATHS = ['sismos', 'historial', 'estaciones', 'consultas'] as const;
export const AUTH_ROUTE_PATHS = ['acceso', 'recuperar-acceso', 'cambiar-contrasena'] as const;
export const ADMIN_ROUTE_PATHS = ['repositorio', 'profile', 'umbrales-estaciones'] as const;

const clientOnlyRoutes = new Set<string>([...AUTH_ROUTE_PATHS, ...ADMIN_ROUTE_PATHS]);

export function renderModeForRoute(path: string): RenderMode {
  return clientOnlyRoutes.has(path) ? RenderMode.Client : RenderMode.Server;
}

export function serverRoute(path: string): ServerRoute {
  if (clientOnlyRoutes.has(path)) {
    return {
      path,
      renderMode: RenderMode.Client
    };
  }

  return {
    path,
    renderMode: RenderMode.Server
  };
}
