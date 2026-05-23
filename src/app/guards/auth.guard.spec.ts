import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  function setup(isAuthenticated: boolean) {
    const auth = {
      isAuthenticated: vi.fn(() => isAuthenticated)
    } as unknown as AuthService;
    const router = {
      navigate: vi.fn()
    } as unknown as Router;

    return { guard: new AuthGuard(auth, router), router };
  }

  it('permite activar la ruta si el usuario está autenticado', () => {
    const { guard, router } = setup(true);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige a login si el usuario no está autenticado', () => {
    const { guard, router } = setup(false);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});