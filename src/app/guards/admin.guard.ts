import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated() && this.auth.isAdmin()) {
      return true;
    }
    // Si no es admin, redirigir al login (o a una página de acceso denegado si existiera)
    this.router.navigate(['/acceso']);
    return false;
  }
}
