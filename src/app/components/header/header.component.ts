import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mobileOpen = signal(false);

  readonly navLinks = [
    { path: '/sismos',     label: 'Sismos' },
    { path: '/historial',  label: 'Historial' },
    { path: '/estaciones', label: 'Estaciones' },
    { path: '/umbrales-estaciones', label: 'Umbrales', adminOnly: true },
    { path: '/consultas',  label: 'Consultas' },
    { path: '/repositorio', label: 'Reportes' },
  ];

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => this.mobileOpen.set(false));
  }

  toggleMenu(): void {
    this.mobileOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/acceso']);
  }
}
