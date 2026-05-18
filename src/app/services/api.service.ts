import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly codigo?: string,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private auth: AuthService) {}

  private extractErrorMessage(body: unknown, fallback: string): string {
    if (!body || typeof body !== 'object') {
      return fallback;
    }

    const payload = body as Record<string, unknown>;
    const candidates = [payload['mensaje'], payload['detail'], payload['message'], payload['title']];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }

    return fallback;
  }

  private shouldAttachAuth(path: string): boolean {
    return !path.startsWith('/api/autenticacion/iniciar-sesion');
  }

  private buildHeaders(path: string, extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...(extra || {}) };
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const token = this.auth.getToken();
    if (token && this.shouldAttachAuth(path)) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private buildFormHeaders(path: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = this.auth.getToken();
    if (token && this.shouldAttachAuth(path)) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let mensaje = `${res.status} ${res.statusText}`;
      let codigo: string | undefined;
      let data: Record<string, unknown> | undefined;
      try {
        const body = await res.json();
        mensaje = this.extractErrorMessage(body, mensaje);
        const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : undefined;
        data = payload;
        codigo = typeof payload?.['codigo'] === 'string' ? payload['codigo'] : undefined;
      } catch {
        // ignore JSON parsing errors and keep the HTTP status text
      }
      throw new ApiError(mensaje, codigo, data);
    }
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      headers: this.buildHeaders(path)
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.buildHeaders(path),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'PUT',
      headers: this.buildHeaders(path),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'DELETE',
      headers: this.buildHeaders(path)
    });
    return this.handleResponse<T>(res);
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.buildFormHeaders(path),
      body: formData
    });
    return this.handleResponse<T>(res);
  }

  getDownloadUrl(path: string): string {
    return this.baseUrl + path;
  }

  async getBlob(path: string): Promise<{ blob: Blob; headers: Headers }> {
    const res = await fetch(this.baseUrl + path, { headers: this.buildHeaders(path) });
    if (!res.ok) {
      let mensaje = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        mensaje = this.extractErrorMessage(body, mensaje);
      } catch { /* ignore */ }
      throw new ApiError(mensaje);
    }
    return { blob: await res.blob(), headers: res.headers };
  }
}
