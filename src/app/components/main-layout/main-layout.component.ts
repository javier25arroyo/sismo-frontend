import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PasswordExpirationWarningComponent } from '../password-expiration-warning/password-expiration-warning.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, PasswordExpirationWarningComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class MainLayoutComponent {}
