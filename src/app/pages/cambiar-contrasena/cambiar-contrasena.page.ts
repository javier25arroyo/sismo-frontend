import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CambiarContrasenaRespuesta, CambiarContrasenaSolicitud } from '../../interfaces/api.interfaces';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const passwordNueva = control.get('passwordNueva')?.value as string | null;
  const confirmarPassword = control.get('confirmarPassword')?.value as string | null;

  if (!passwordNueva || !confirmarPassword) {
    return null;
  }

  return passwordNueva === confirmarPassword ? null : { passwordMismatch: true };
};

@Component({
  standalone: true,
  selector: 'app-cambiar-contrasena',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cambiar-contrasena.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CambiarContrasenaPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = this.formBuilder.nonNullable.group(
    {
      passwordActual: ['', [Validators.required]],
      passwordNueva: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]],
      confirmarPassword: ['', [Validators.required]]
    },
    { validators: [passwordsMatchValidator] }
  );

  readonly sessionActiva = this.auth.isAuthenticated();
  readonly pendingUsername = computed(() => this.auth.pendingUsername());

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { passwordActual, passwordNueva } = this.form.getRawValue();
    const payload: CambiarContrasenaSolicitud = { passwordActual, passwordNueva };

    if (!this.sessionActiva) {
      const nombreUsuario = this.auth.pendingUsername();
      if (!nombreUsuario) {
        this.error.set('No se pudo identificar el usuario. Vuelva a iniciar sesión.');
        return;
      }
      payload.nombreUsuario = nombreUsuario;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    try {
      const respuesta = await this.api.post<CambiarContrasenaRespuesta>(
        '/api/autenticacion/cambiar-contrasena',
        payload
      );

      this.success.set(respuesta.mensaje);
      this.auth.clearPendingUsername();
      this.form.reset({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });

      await this.router.navigate(this.sessionActiva ? ['/estaciones'] : ['/acceso']);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
    } finally {
      this.loading.set(false);
    }
  }
}
