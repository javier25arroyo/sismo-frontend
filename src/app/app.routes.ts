import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { AboutPage } from './pages/about/about.page';
import { LoginPage } from './pages/login/login.page';
import { ProfilePage } from './pages/profile/profile.page';
import { MapaPage } from './pages/mapa/mapa.page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'mapa', component: MapaPage },
  { path: 'about', component: AboutPage },
  { path: 'login', component: LoginPage },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
