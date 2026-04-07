import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private auth: AuthService) {}

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...(extra || {}) };
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private buildFormHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let mensaje = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.mensaje) mensaje = body.mensaje;
        else if (body?.message) mensaje = body.message;
      } catch { /* ignore */ }
      throw new Error(mensaje);
    }
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      headers: this.buildHeaders()
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'DELETE',
      headers: this.buildHeaders()
    });
    return this.handleResponse<T>(res);
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.buildFormHeaders(),
      body: formData
    });
    return this.handleResponse<T>(res);
  }

  getDownloadUrl(path: string): string {
    return this.baseUrl + path;
  }
}
