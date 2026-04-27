import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const UMBRAL_DIAS = 10;

@Component({
  standalone: true,
  selector: 'app-password-expiration-warning',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './password-expiration-warning.component.html'
})
export class PasswordExpirationWarningComponent {
  private readonly auth = inject(AuthService);
  private readonly cerrado = signal(false);

  readonly visible = computed(() => {
    if (this.cerrado()) return false;
    if (!this.auth.isAuthenticated()) return false;
    const dias = this.auth.passwordExpiraDias();
    return dias !== null && dias <= UMBRAL_DIAS;
  });

  readonly diasRestantes = computed(() => this.auth.passwordExpiraDias() ?? 0);

  readonly expirada = computed(() => this.diasRestantes() <= 0);

  readonly mensaje = computed(() => {
    const dias = this.diasRestantes();
    if (dias <= 0) {
      return 'Su contraseña ha expirado. Debe cambiarla para continuar.';
    }
    if (dias === 1) {
      return 'Su contraseña expira mañana. Cámbiela para evitar interrupciones.';
    }
    return `Su contraseña expira en ${dias} días. Cámbiela pronto para evitar interrupciones.`;
  });

  readonly claseContenedor = computed(() =>
    this.expirada()
      ? 'bg-rose-50 border-rose-300 text-rose-800'
      : 'bg-amber-50 border-amber-300 text-amber-800'
  );

  readonly claseBoton = computed(() =>
    this.expirada()
      ? 'bg-rose-600 hover:bg-rose-700'
      : 'bg-amber-600 hover:bg-amber-700'
  );

  cerrar(): void {
    this.cerrado.set(true);
  }
}
