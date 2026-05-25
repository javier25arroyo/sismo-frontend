import { TestBed } from '@angular/core/testing';
import { ApiError, ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('ApiService', () => {
  const auth = {
    getToken: () => null
  } as AuthService;

  it('maneja respuestas JSON nulas sin romper la extracción del error', async () => {
    const service = TestBed.runInInjectionContext(() => new ApiService(auth));
    const response = new Response('null', {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'Content-Type': 'application/json' }
    });

    try {
      await service['handleResponse'](response);
      throw new Error('Se esperaba un ApiError');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('400 Bad Request');
      expect((error as ApiError).codigo).toBeUndefined();
      expect((error as ApiError).data).toBeUndefined();
    }
  });
});
