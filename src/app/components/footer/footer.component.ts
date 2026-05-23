import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {}
