import { AuthService } from './auth.service';
import { RespuestaLogin } from '../interfaces/api.interfaces';

describe('AuthService', () => {
  const respuestaLogin: RespuestaLogin = {
    token: 'token-prueba',
    role: 'ADMIN',
    expiresIn: 3600,
    passwordExpiraDias: 30,
    debeCambiarPassword: false,
    esPrimerLogin: false
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('limpia el usuario pendiente al iniciar sesión', () => {
    const service = new AuthService();

    service.setPendingUsername('usuario-pendiente');
    service.login(respuestaLogin);

    expect(service.pendingUsername()).toBeNull();
  });

  it('limpia el usuario pendiente al cerrar sesión', () => {
    const service = new AuthService();

    service.setPendingUsername('usuario-pendiente');
    service.logout();

    expect(service.pendingUsername()).toBeNull();
  });
});
