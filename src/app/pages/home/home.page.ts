import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ConfirmDialogComponent, ButtonComponent],
  templateUrl: './home.page.html'
})
export class HomePage {
  confirmVisible = false;
  pendingAction: 'eliminar' | 'actualizar' | 'modificar' = 'eliminar';
  lastResult = '';

  private actionLabel: Record<'eliminar' | 'actualizar' | 'modificar', string> = {
    eliminar: 'Eliminación',
    actualizar: 'Actualización',
    modificar: 'Modificación'
  };

  openConfirm(action: 'eliminar' | 'actualizar' | 'modificar') {
    this.pendingAction = action;
    this.confirmVisible = true;
  }

  async onConfirm() {
    // Aquí iría la lógica real de eliminación/actualización/modificación
    this.lastResult = `${this.actionLabel[this.pendingAction]} confirmada`;
    this.confirmVisible = false;
  }

  onCancel() {
    this.lastResult = `${this.actionLabel[this.pendingAction]} cancelada`;
    this.confirmVisible = false;
  }
}
