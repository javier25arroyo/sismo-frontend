import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Activity, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() modo: 'publica' | 'tecnica' = 'publica';
  readonly brandIcon = Activity;

  constructor(readonly auth: AuthService) {}
}
