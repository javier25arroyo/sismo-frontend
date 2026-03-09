import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './login.page.html'
})
export class LoginPage {
  error = '';
  loading = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  async onSubmit(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const data = new FormData(form);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');

    this.loading = true;
    this.error = '';
    try {
      const res: any = await this.api.post('/auth/login', { email, password });
      if (res && res.token) {
        this.auth.login(res.token);
        await this.router.navigate(['/']);
      } else {
        this.error = 'Credenciales inválidas';
      }
    } catch (err) {
      this.error = (err as Error).message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
