import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'jwt_token';
  private token: string | null = null;

  login(token: string) {
    this.token = token;
    try { localStorage.setItem(this.storageKey, token); } catch { /* ignore */ }
  }

  logout() {
    this.token = null;
    try { localStorage.removeItem(this.storageKey); } catch { /* ignore */ }
  }

  getToken(): string | null {
    if (!this.token) {
      try { this.token = localStorage.getItem(this.storageKey); } catch { this.token = null; }
    }
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
