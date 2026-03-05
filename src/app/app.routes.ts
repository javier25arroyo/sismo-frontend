import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { AboutPage } from './pages/about.page';
import { LoginPage } from './pages/login.page';
import { ProfilePage } from './pages/profile.page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'about', component: AboutPage },
  { path: 'login', component: LoginPage },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
