import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Sismologia ICE | Monitoreo Sismico Nacional',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        title: 'Sismologia ICE | Monitoreo Sismico Nacional',
        data: {
          description: 'Monitoreo acelerografico y movimiento sismico fuerte del Instituto Costarricense de Electricidad.'
        },
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'sismos',
        title: 'Analisis de Sismos | Sismologia ICE',
        data: {
          description: 'Consulta el analisis de eventos sismicos recientes, parametros de movimiento fuerte y datos acelerograficos.'
        },
        loadComponent: () => import('./pages/sismos/sismos.page').then(m => m.SismosPage)
      },
      {
        path: 'historial',
        title: 'Catalogo Historico | Sismologia ICE',
        data: {
          description: 'Explora el catalogo historico de sismos con filtros por fecha, magnitud, ubicacion y profundidad.',
          preload: true
        },
        loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
      },
      {
        path: 'estaciones',
        title: 'Red de Estaciones | Sismologia ICE',
        data: {
          description: 'Revisa el estado operativo de la red de estaciones acelerograficas del ICE.',
          preload: true
        },
        loadComponent: () => import('./pages/estaciones/estaciones.page').then(m => m.EstacionesPage)
      },
      {
        path: 'umbrales-estaciones',
        title: 'Umbrales de Estaciones | Sismologia ICE',
        data: {
          description: 'Administracion tecnica de umbrales por estacion acelerografica.',
          robots: 'noindex,nofollow'
        },
        loadComponent: () => import('./pages/umbrales-estaciones/umbrales-estaciones.page').then(m => m.UmbralesEstacionesPage),
        canActivate: [AdminGuard]
      },
      {
        path: 'repositorio',
        title: 'Repositorio de Reportes | Sismologia ICE',
        data: {
          description: 'Repositorio tecnico de reportes, archivos CSV y documentos generados por el sistema.',
          robots: 'noindex,nofollow'
        },
        loadComponent: () => import('./pages/repositorio/repositorio.page').then(m => m.RepositorioPage),
        canActivate: [AdminGuard]
      },
      {
        path: 'consultas',
        title: 'Consultas Sismicas | Sismologia ICE',
        data: {
          description: 'Consulta datos sismicos institucionales y exporta resultados filtrados para analisis tecnico.'
        },
        loadComponent: () => import('./pages/consultas/consultas.page').then(m => m.ConsultasPage)
      },
      {
        path: 'profile',
        title: 'Perfil Tecnico | Sismologia ICE',
        data: {
          description: 'Gestion del perfil tecnico y usuarios autorizados del sistema.',
          robots: 'noindex,nofollow'
        },
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
        canActivate: [AdminGuard]
      },
    ]
  },
  {
    path: 'acceso',
    title: 'Acceso Tecnico | Sismologia ICE',
    data: {
      description: 'Ingreso seguro para personal tecnico autorizado de la plataforma de monitoreo sismico ICE.',
      robots: 'noindex,nofollow'
    },
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'recuperar-acceso',
    title: 'Recuperar Acceso | Sismologia ICE',
    data: {
      description: 'Guia institucional para recuperar el acceso tecnico a la plataforma Sismologia ICE.',
      robots: 'noindex,nofollow'
    },
    loadComponent: () => import('./pages/recuperar-acceso/recuperar-acceso.page').then(m => m.RecuperarAccesoPage)
  },
  {
    path: 'cambiar-contrasena',
    title: 'Cambiar Contrasena | Sismologia ICE',
    data: {
      description: 'Actualizacion segura de contrasena para usuarios autorizados del sistema.',
      robots: 'noindex,nofollow'
    },
    loadComponent: () => import('./pages/cambiar-contrasena/cambiar-contrasena.page').then(m => m.CambiarContrasenaPage),
    canActivate: [AdminGuard]
  },
  { path: 'login', redirectTo: 'acceso', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
