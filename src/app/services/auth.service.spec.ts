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

  it('persiste token, rol y expiración de contraseña al iniciar sesión', () => {
    const service = new AuthService();

    service.login(respuestaLogin);

    expect(service.getToken()).toBe('token-prueba');
    expect(service.getRole()).toBe('ADMIN');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.passwordExpiraDias()).toBe(30);
    expect(localStorage.getItem('jwt_token')).toBe('token-prueba');
    expect(localStorage.getItem('jwt_role')).toBe('ADMIN');
    expect(localStorage.getItem('jwt_password_expira_dias')).toBe('30');
  });

  it('lee token, rol y días de expiración existentes en storage', () => {
    localStorage.setItem('jwt_token', 'token-guardado');
    localStorage.setItem('jwt_role', 'LECTOR');
    localStorage.setItem('jwt_password_expira_dias', '7');

    const service = new AuthService();

    expect(service.getToken()).toBe('token-guardado');
    expect(service.getRole()).toBe('LECTOR');
    expect(service.passwordExpiraDias()).toBe(7);
    expect(service.isAdmin()).toBe(false);
  });

  it('limpia credenciales y expiración al cerrar sesión', () => {
    const service = new AuthService();
    service.login(respuestaLogin);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.passwordExpiraDias()).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('jwt_role')).toBeNull();
    expect(localStorage.getItem('jwt_password_expira_dias')).toBeNull();
  });
});