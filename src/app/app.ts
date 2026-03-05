import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from './components/main-layout.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [MainLayoutComponent],
  template: '<app-main-layout></app-main-layout>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sismo-frontend');
}
