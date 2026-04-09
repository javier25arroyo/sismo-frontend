import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { CambiarContrasenaPage } from './pages/cambiar-contrasena/cambiar-contrasena.page';
import { SismosPage } from './pages/sismos/sismos.page';
import { HistorialPage } from './pages/historial/historial.page';
import { EstacionesPage } from './pages/estaciones/estaciones.page';
import { RepositorioPage } from './pages/repositorio/repositorio.page';
import { AboutPage } from './pages/about/about.page';
import { ProfilePage } from './pages/profile/profile.page';
import { MapaPage } from './pages/mapa/mapa.page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomePage },
      { path: 'sismos', component: SismosPage, data: { headerModo: 'tecnica' } },
      { path: 'historial', component: HistorialPage },
      { path: 'estaciones', component: EstacionesPage, data: { headerModo: 'tecnica' } },
      { path: 'repositorio', component: RepositorioPage },
      { path: 'mapa', component: MapaPage },
      { path: 'about', component: AboutPage },
      { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
    ]
  },
  { path: 'acceso', component: LoginPage },
  { path: 'cambiar-contrasena', component: CambiarContrasenaPage, canActivate: [AuthGuard] },
  { path: 'login', redirectTo: 'acceso', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
