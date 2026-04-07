import { Injectable } from '@angular/core';
import { RespuestaLogin } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';
  private readonly roleKey = 'jwt_role';
  private token: string | null = null;
  private role: string | null = null;

  login(respuesta: RespuestaLogin): void {
    this.token = respuesta.token;
    this.role = respuesta.role;
    try {
      localStorage.setItem(this.tokenKey, respuesta.token);
      localStorage.setItem(this.roleKey, respuesta.role);
    } catch { /* ignore */ }
  }

  logout(): void {
    this.token = null;
    this.role = null;
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
    } catch { /* ignore */ }
  }

  getToken(): string | null {
    if (!this.token) {
      try { this.token = localStorage.getItem(this.tokenKey); } catch { this.token = null; }
    }
    return this.token;
  }

  getRole(): string | null {
    if (!this.role) {
      try { this.role = localStorage.getItem(this.roleKey); } catch { this.role = null; }
    }
    return this.role;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
