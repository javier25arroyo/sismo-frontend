import { Injectable, signal, computed } from '@angular/core';
import { RespuestaLogin } from '../interfaces/api.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';
  private readonly roleKey = 'jwt_role';
  private readonly diasExpKey = 'jwt_password_expira_dias';
  private token: string | null = null;
  private role: string | null = null;

  private readonly passwordExpiraDiasSig = signal<number | null>(this.leerDiasStorage());
  private readonly pendingUsernameSig = signal<string | null>(null);

  readonly passwordExpiraDias = computed(() => this.passwordExpiraDiasSig());
  readonly pendingUsername = computed(() => this.pendingUsernameSig());

  setPendingUsername(username: string): void {
    this.pendingUsernameSig.set(username);
  }

  clearPendingUsername(): void {
    this.pendingUsernameSig.set(null);
  }

  login(respuesta: RespuestaLogin): void {
    this.token = respuesta.token;
    this.role = respuesta.role;
    this.passwordExpiraDiasSig.set(respuesta.passwordExpiraDias ?? null);
    try {
      localStorage.setItem(this.tokenKey, respuesta.token);
      localStorage.setItem(this.roleKey, respuesta.role);
      if (respuesta.passwordExpiraDias !== undefined && respuesta.passwordExpiraDias !== null) {
        localStorage.setItem(this.diasExpKey, String(respuesta.passwordExpiraDias));
      } else {
        localStorage.removeItem(this.diasExpKey);
      }
    } catch { /* ignore */ }
  }

  logout(): void {
    this.token = null;
    this.role = null;
    this.passwordExpiraDiasSig.set(null);
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.diasExpKey);
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

  private leerDiasStorage(): number | null {
    try {
      const raw = localStorage.getItem(this.diasExpKey);
      if (raw === null || raw === '') return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
}
