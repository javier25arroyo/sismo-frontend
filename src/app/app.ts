import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [MainLayoutComponent],
  template: '<app-main-layout></app-main-layout>'
})
export class App {
  protected readonly title = signal('sismo-frontend');
}
