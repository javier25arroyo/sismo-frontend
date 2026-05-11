import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  @Component({
    standalone: true,
    imports: [StatusBadgeComponent],
    template: `<app-status-badge [estado]="estado"></app-status-badge>`
  })
  class TestHostComponent {
    estado = '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, StatusBadgeComponent]
    }).compileComponents();
  });

  function render(estado: string): HTMLSpanElement {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.estado = estado;
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('app-status-badge span') as HTMLSpanElement;
  }

  it('applies success styles for NIVEL 1', () => {
    const badge = render('NIVEL 1');

    expect(badge.className).toContain('bg-green-50');
    expect(badge.className).toContain('text-green-700');
    expect(badge.className).toContain('ring-green-200');
    expect(badge.textContent).toContain('NIVEL 1');
    expect(badge.querySelector('span')?.className).toContain('bg-green-500');
  });

  it('normalizes accented online status', () => {
    const badge = render('EN LÍNEA');

    expect(badge.className).toContain('bg-green-50');
    expect(badge.className).toContain('text-green-700');
    expect(badge.className).toContain('ring-green-200');
    expect(badge.querySelector('span')?.className).toContain('bg-green-500');
  });

  it('renders fuera de servicio with the friendly label', () => {
    const badge = render('FUERA_DE_SERVICIO');

    expect(badge.className).toContain('bg-rose-50');
    expect(badge.className).toContain('text-rose-700');
    expect(badge.className).toContain('ring-rose-200');
    expect(badge.textContent).toContain('FUERA DE SERVICIO');
    expect(badge.querySelector('span')?.className).toContain('bg-rose-500');
  });
});
