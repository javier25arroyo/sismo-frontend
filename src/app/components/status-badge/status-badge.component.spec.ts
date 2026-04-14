import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();
  });

  function render(estado: string): HTMLSpanElement {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.estado = estado;
    fixture.detectChanges();
    return fixture.nativeElement.firstElementChild as HTMLSpanElement;
  }

  it('applies success styles for NIVEL 1', () => {
    const badge = render('NIVEL 1');

    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
    expect(badge.textContent).toContain('NIVEL 1');
    expect(badge.querySelector('span')?.className).toContain('bg-green-500');
  });

  it('normalizes accented online status', () => {
    const badge = render('EN LÍNEA');

    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
    expect(badge.querySelector('span')?.className).toContain('bg-green-500');
  });

  it('renders fuera de servicio with the friendly label', () => {
    const badge = render('FUERA_DE_SERVICIO');

    expect(badge.className).toContain('bg-rose-100');
    expect(badge.className).toContain('text-rose-700');
    expect(badge.textContent).toContain('FUERA DE SERVICIO');
    expect(badge.querySelector('span')?.className).toContain('bg-rose-500');
  });
});
