import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  CrearUsuarioSolicitud,
  ActualizarUsuarioSolicitud,
  UsuarioRespuesta
} from '../../interfaces/api.interfaces';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './profile.page.html'
})
export class ProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  // ─── Cerrar sesión ────────────────────────────────────────────────────────
  showLogoutDialog = false;

  confirmLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // ─── Agregar usuario ──────────────────────────────────────────────────────
  crearCargando = signal(false);
  crearMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  async onCrearUsuario(ev: Event): Promise<void> {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const d = new FormData(form);

    const solicitud: CrearUsuarioSolicitud = {
      cedula:       String(d.get('cedula') ?? '').trim(),
      nombreCompl:  String(d.get('nombreCompl') ?? '').trim(),
      correoE:      String(d.get('correoE') ?? '').trim(),
      usuarioNombre:String(d.get('usuarioNombre') ?? '').trim(),
      estadoActivo: d.get('estadoActivo') === 'true',
      telOficina:   String(d.get('telOficina') ?? '').trim() || undefined,
      numCelular:   String(d.get('numCelular') ?? '').trim() || undefined,
      password:     String(d.get('password') ?? '').trim() || undefined,
    };

    this.crearCargando.set(true);
    this.crearMensaje.set(null);
    try {
      await this.usuarioService.crearUsuario(solicitud);
      this.crearMensaje.set({ tipo: 'ok', texto: 'Usuario creado correctamente.' });
      form.reset();
    } catch (err) {
      this.crearMensaje.set({ tipo: 'error', texto: (err as Error).message || 'No se pudo crear el usuario.' });
    } finally {
      this.crearCargando.set(false);
    }
  }

  // ─── Actualizar usuario ───────────────────────────────────────────────────
  buscarCedula = signal('');
  usuarioCargado = signal<UsuarioRespuesta | null>(null);
  buscarCargando = signal(false);
  buscarError = signal<string | null>(null);

  actualizarCargando = signal(false);
  actualizarMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  showActualizarDialog = signal(false);

  private pendingActualizarData: ActualizarUsuarioSolicitud | null = null;

  async buscarUsuario(): Promise<void> {
    const cedula = this.buscarCedula().trim();
    if (!cedula) return;

    this.buscarCargando.set(true);
    this.buscarError.set(null);
    this.usuarioCargado.set(null);
    this.actualizarMensaje.set(null);
    try {
      const usuario = await this.usuarioService.getUsuario(cedula);
      this.usuarioCargado.set(usuario);
    } catch (err) {
      this.buscarError.set((err as Error).message || 'No se encontró el usuario.');
    } finally {
      this.buscarCargando.set(false);
    }
  }

  onActualizarSubmit(ev: Event): void {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const d = new FormData(form);

    this.pendingActualizarData = {
      nombreCompl:  String(d.get('nombreCompl') ?? '').trim(),
      correoE:      String(d.get('correoE') ?? '').trim(),
      usuarioNombre:String(d.get('usuarioNombre') ?? '').trim(),
      estadoActivo: d.get('estadoActivo') === 'true',
      telOficina:   String(d.get('telOficina') ?? '').trim() || undefined,
      numCelular:   String(d.get('numCelular') ?? '').trim() || undefined,
      password:     String(d.get('password') ?? '').trim() || undefined,
    };
    this.showActualizarDialog.set(true);
  }

  async confirmActualizar(): Promise<void> {
    this.showActualizarDialog.set(false);
    const cedula = this.usuarioCargado()?.cedula;
    if (!cedula || !this.pendingActualizarData) return;

    this.actualizarCargando.set(true);
    this.actualizarMensaje.set(null);
    try {
      const actualizado = await this.usuarioService.actualizarUsuario(cedula, this.pendingActualizarData);
      this.usuarioCargado.set(actualizado);
      this.actualizarMensaje.set({ tipo: 'ok', texto: 'Usuario actualizado correctamente.' });
    } catch (err) {
      this.actualizarMensaje.set({ tipo: 'error', texto: (err as Error).message || 'No se pudo actualizar el usuario.' });
    } finally {
      this.actualizarCargando.set(false);
      this.pendingActualizarData = null;
    }
  }
}
