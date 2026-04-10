import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SolicitudLogin, RespuestaLogin } from '../../interfaces/api.interfaces';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  error = '';
  loading = false;
  showPassword = false;
  readonly arrowRightIcon = ArrowRight;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  async onSubmit(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const data = new FormData(form);
    const username = String(data.get('username') || '');
    const password = String(data.get('password') || '');

    this.loading = true;
    this.error = '';
    try {
      const solicitud: SolicitudLogin = { username, password };
      const res = await this.api.post<RespuestaLogin>(
        '/api/autenticacion/iniciar-sesion',
        solicitud
      );
      this.auth.login(res);
      if (res.debeCambiarPassword || res.esPrimerLogin) {
        await this.router.navigate(['/cambiar-contrasena']);
      } else {
        await this.router.navigate(['/estaciones']);
      }
    } catch (err) {
      this.error = (err as Error).message || 'Credenciales incorrectas. Intente de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
