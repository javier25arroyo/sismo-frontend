import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component';
import { ButtonComponent } from '../components/button.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ConfirmDialogComponent, ButtonComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePage {
  confirmVisible = false;
  pendingAction: 'delete' | 'update' | 'modify' = 'delete';
  lastResult = '';

  openConfirm(action: 'delete' | 'update' | 'modify') {
    this.pendingAction = action;
    this.confirmVisible = true;
  }

  async onConfirm() {
    // Aquí iría la lógica real de eliminación/actualización/modificación
    this.lastResult = `${this.pendingAction} confirmado`;
    this.confirmVisible = false;
  }

  onCancel() {
    this.lastResult = `${this.pendingAction} cancelado`;
    this.confirmVisible = false;
  }
}
