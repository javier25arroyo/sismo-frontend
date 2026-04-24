import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'sismos', loadComponent: () => import('./pages/sismos/sismos.page').then(m => m.SismosPage) },
      { path: 'historial', loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage) },
      { path: 'estaciones', loadComponent: () => import('./pages/estaciones/estaciones.page').then(m => m.EstacionesPage) },
      { path: 'repositorio', loadComponent: () => import('./pages/repositorio/repositorio.page').then(m => m.RepositorioPage), canActivate: [AdminGuard] },
      { path: 'consultas', loadComponent: () => import('./pages/consultas/consultas.page').then(m => m.ConsultasPage) },
      { path: 'mapa', loadComponent: () => import('./pages/mapa/mapa.page').then(m => m.MapaPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage), canActivate: [AdminGuard] },
    ]
  },
  { path: 'acceso', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'cambiar-contrasena', loadComponent: () => import('./pages/cambiar-contrasena/cambiar-contrasena.page').then(m => m.CambiarContrasenaPage), canActivate: [AdminGuard] },
  { path: 'login', redirectTo: 'acceso', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
