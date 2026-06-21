import { RenderMode } from '@angular/ssr';
import { describe, expect, it } from 'vitest';
import {
  ADMIN_ROUTE_PATHS,
  AUTH_ROUTE_PATHS,
  MAP_ROUTE_PATHS,
  renderModeForRoute,
  serverRoute
} from './server-render-policy';

describe('server-render-policy', () => {
  it('mantiene las rutas publicas con mapas renderizadas en el servidor', () => {
    for (const path of MAP_ROUTE_PATHS) {
      expect(renderModeForRoute(path)).toBe(RenderMode.Server);
    }
  });

  it('mantiene las rutas de acceso y administracion solo en cliente', () => {
    for (const path of [...AUTH_ROUTE_PATHS, ...ADMIN_ROUTE_PATHS]) {
      expect(renderModeForRoute(path)).toBe(RenderMode.Client);
    }
  });

  it('construye ServerRoute con el modo calculado', () => {
    expect(serverRoute('sismos')).toEqual({
      path: 'sismos',
      renderMode: RenderMode.Server
    });
  });
});
