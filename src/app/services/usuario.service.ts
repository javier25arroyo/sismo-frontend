import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  UsuarioRespuesta,
  CrearUsuarioSolicitud,
  ActualizarUsuarioSolicitud,
  RestablecerContrasenaRespuesta,
  FiltroUsuarios
} from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private api: ApiService) {}

  /** GET /api/admin/usuarios — lista paginada con filtros */
  async getUsuarios(filtros: FiltroUsuarios = {}): Promise<PaginatedResponse<UsuarioRespuesta>> {
    const params = new URLSearchParams();
    if (filtros.cedula)              params.set('cedula', filtros.cedula);
    if (filtros.estadoActivo !== undefined) params.set('estadoActivo', String(filtros.estadoActivo));
    if (filtros.page !== undefined)  params.set('page', String(filtros.page));
    if (filtros.size !== undefined)  params.set('size', String(filtros.size));
    const query = params.toString();
    return this.api.get<PaginatedResponse<UsuarioRespuesta>>(
      `/api/admin/usuarios${query ? '?' + query : ''}`
    );
  }

  /** GET /api/admin/usuarios/{cedula} */
  async getUsuario(cedula: string): Promise<UsuarioRespuesta> {
    return this.api.get<UsuarioRespuesta>(`/api/admin/usuarios/${encodeURIComponent(cedula)}`);
  }

  /** POST /api/admin/usuarios */
  async crearUsuario(solicitud: CrearUsuarioSolicitud): Promise<UsuarioRespuesta> {
    return this.api.post<UsuarioRespuesta>('/api/admin/usuarios', solicitud);
  }

  /** PUT /api/admin/usuarios/{cedula} */
  async actualizarUsuario(cedula: string, solicitud: ActualizarUsuarioSolicitud): Promise<UsuarioRespuesta> {
    return this.api.put<UsuarioRespuesta>(
      `/api/admin/usuarios/${encodeURIComponent(cedula)}`,
      solicitud
    );
  }

  /** DELETE /api/admin/usuarios/{cedula} */
  async eliminarUsuario(cedula: string): Promise<void> {
    return this.api.delete<void>(`/api/admin/usuarios/${encodeURIComponent(cedula)}`);
  }

  /** POST /api/admin/usuarios/{cedula}/restablecer-contrasena */
  async restablecerContrasena(cedula: string): Promise<RestablecerContrasenaRespuesta> {
    return this.api.post<RestablecerContrasenaRespuesta>(
      `/api/admin/usuarios/${encodeURIComponent(cedula)}/restablecer-contrasena`,
      {}
    );
  }
}
