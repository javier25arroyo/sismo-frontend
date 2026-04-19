import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-recuperar-acceso',
  imports: [RouterLink],
  templateUrl: './recuperar-acceso.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecuperarAccesoPage {}
