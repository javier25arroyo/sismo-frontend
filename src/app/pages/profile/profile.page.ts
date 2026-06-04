import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  templateUrl: './profile.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {
  private usuarioService = inject(UsuarioService);

  // ─── Agregar usuario ──────────────────────────────────────────────────────
  crearCargando = signal(false);
  crearMensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  passwordCrear = signal('');
  passwordCrearVisible = signal(false);

  generarPasswordCrear(): void {
    this.passwordCrear.set(this.generarPasswordSegura());
    this.passwordCrearVisible.set(true);
  }

  private generarPasswordSegura(): string {
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const digits  = '0123456789';
    const special = '!@#$%&*';
    const all     = upper + lower + digits + special;

    const rand = (charset: string) => {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return charset[buf[0] % charset.length];
    };

    const chars: string[] = [
      rand(upper),
      rand(lower),
      rand(digits),
      rand(special),
    ];
    for (let i = chars.length; i < 12; i++) chars.push(rand(all));

    for (let i = chars.length - 1; i > 0; i--) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      const j = buf[0] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  }

  async onCrearUsuario(ev: Event): Promise<void> {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const d = new FormData(form);

    const rawPassword = this.passwordCrear().trim();
    const password = rawPassword || this.generarPasswordSegura();

    const solicitud: CrearUsuarioSolicitud = {
      cedula:       String(d.get('cedula') ?? '').trim(),
      nombreCompl:  String(d.get('nombreCompl') ?? '').trim(),
      correoE:      String(d.get('correoE') ?? '').trim(),
      usuarioNombre:String(d.get('usuarioNombre') ?? '').trim(),
      estadoActivo: d.get('estadoActivo') === 'true',
      telOficina:   String(d.get('telOficina') ?? '').trim() || undefined,
      numCelular:   String(d.get('numCelular') ?? '').trim() || undefined,
      password,
    };

    this.crearCargando.set(true);
    this.crearMensaje.set(null);
    try {
      await this.usuarioService.crearUsuario(solicitud);
      this.crearMensaje.set({
        tipo: 'ok',
        texto: `Usuario creado. Contraseña temporal: ${password}`,
      });
      form.reset();
      this.passwordCrear.set('');
      this.passwordCrearVisible.set(false);
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
