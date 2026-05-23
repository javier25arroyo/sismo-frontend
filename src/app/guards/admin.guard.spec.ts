import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  function setup(isAuthenticated: boolean, isAdmin: boolean) {
    const auth = {
      isAuthenticated: vi.fn(() => isAuthenticated),
      isAdmin: vi.fn(() => isAdmin)
    } as unknown as AuthService;
    const router = {
      navigate: vi.fn()
    } as unknown as Router;

    return { guard: new AdminGuard(auth, router), router };
  }

  it('permite activar la ruta cuando el usuario está autenticado y es admin', () => {
    const { guard, router } = setup(true, true);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige a acceso cuando falta autenticación', () => {
    const { guard, router } = setup(false, true);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/acceso']);
  });

  it('redirige a acceso cuando el usuario no es admin', () => {
    const { guard, router } = setup(true, false);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/acceso']);
  });
});