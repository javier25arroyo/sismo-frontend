import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro?';
  @Input() action: 'delete' | 'update' | 'modify' = 'delete';
  @Input() confirmText?: string;
  @Input() cancelText = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get confirmButtonText(): string {
    if (this.confirmText) return this.confirmText;
    switch (this.action) {
      case 'delete': return 'Eliminar';
      case 'update': return 'Actualizar';
      case 'modify': return 'Modificar';
      default: return 'Confirmar';
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  stopPropagation(ev: Event) {
    ev.stopPropagation();
  }
}
