import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  visible = input<boolean>(false);
  title = input<string>('Confirmar acción');
  message = input<string>('¿Estás seguro?');
  action = input<'eliminar' | 'actualizar' | 'modificar'>('eliminar');
  confirmText = input<string | undefined>(undefined);
  cancelText = input<string>('Cancelar');
  
  confirm = output<void>();
  cancelado = output<void>();

  confirmButtonText = computed(() => {
    if (this.confirmText()) return this.confirmText()!;
    switch (this.action()) {
      case 'eliminar': return 'Eliminar';
      case 'actualizar': return 'Actualizar';
      case 'modificar': return 'Modificar';
      default: return 'Confirmar';
    }
  });

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancelado.emit();
  }

}
