import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('SismosPage template', () => {
  const template = readFileSync(
    join(process.cwd(), 'src/app/pages/sismos/sismos.page.html'),
    'utf8'
  );

  it('muestra el banner de magnitud como panel lateral responsive y elimina las tarjetas anteriores', () => {
    expect(template).toContain(
      "[ngClass]=\"ultimoSismo() ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1'\""
    );
    expect(template).toContain('MAGNITUD MOMENTÁNEA + DATOS — panel lateral');
    expect(template).not.toContain('SIDEBAR — Estado de ubicación');
    expect(template).not.toContain('Quick info strip');
    expect(template).not.toContain('MAGNITUD MOMENTÁNEA + DATOS (full-width, bottom)');
  });
});
