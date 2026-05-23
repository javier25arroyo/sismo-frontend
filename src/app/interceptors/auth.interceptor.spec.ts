import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  function interceptWithToken(token: string | null): HttpRequest<unknown> | null {
    let captured: HttpRequest<unknown> | null = null;
    const next: HttpHandlerFn = request => {
      captured = request;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { getToken: () => token }
        }
      ]
    });

    const request = new HttpRequest('GET', '/api/sismos');
    TestBed.runInInjectionContext(() => authInterceptor(request, next));

    return captured;
  }

  it('agrega Authorization Bearer cuando existe token', () => {
    const request = interceptWithToken('token-prueba');

    expect(request?.headers.get('Authorization')).toBe('Bearer token-prueba');
  });

  it('deja la petición sin Authorization cuando no existe token', () => {
    const request = interceptWithToken(null);

    expect(request?.headers.has('Authorization')).toBe(false);
  });
});