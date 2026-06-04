import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PasswordExpirationWarningComponent } from '../password-expiration-warning/password-expiration-warning.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, PasswordExpirationWarningComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}
