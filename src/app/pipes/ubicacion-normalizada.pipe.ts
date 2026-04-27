import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ubicacionNormalizada',
  standalone: true
})
export class UbicacionNormalizadaPipe implements PipeTransform {
  transform(ubicacion: string | null | undefined): string {
    if (!ubicacion) return '';
    let txt = ubicacion.trim();
    txt = txt.replace(/\s*\)\s*$/, '');
    txt = txt.replace(/\brevisada\b/g, 'revisado');
    txt = txt.replace(/\bRevisada\b/g, 'Revisado');
    if (txt.length > 0) {
      txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    }
    return txt;
  }
}
