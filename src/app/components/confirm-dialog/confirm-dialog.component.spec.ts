import 'vitest-axe/extend-expect';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'vitest-axe';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [visible]="visible"
      title="Eliminar reporte"
      message="Esta acción no se puede deshacer."
      (confirm)="confirmed = true"
      (cancelado)="cancelled = true"
    />
  `
})
class ConfirmDialogHostComponent {
  visible = true;
  confirmed = false;
  cancelled = false;
}

describe('ConfirmDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogHostComponent]
    }).compileComponents();
  });

  it('no tiene violaciones básicas de accesibilidad', async () => {
    const fixture = TestBed.createComponent(ConfirmDialogHostComponent);
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement);

    expect(results.violations).toEqual([]);
  });

  it('emite cancelado desde el botón de fondo accesible', () => {
    const fixture = TestBed.createComponent(ConfirmDialogHostComponent);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('button[aria-label="Cerrar confirmación"]') as HTMLButtonElement;
    backdrop.click();

    expect(fixture.componentInstance.cancelled).toBe(true);
  });
});