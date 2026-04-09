import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() modo: 'publica' | 'tecnica' = 'publica';

  constructor(readonly auth: AuthService) {}
}
