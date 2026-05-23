import { Component, ElementRef, HostListener, ViewChild, computed, effect, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusTrap } from '../../utils/focus-trap';

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

  @ViewChild('dialogEl') dialogEl?: ElementRef<HTMLElement>;

  private readonly trap = new FocusTrap();

  constructor() {
    effect(() => {
      if (this.visible()) {
        setTimeout(() => {
          const container = this.dialogEl?.nativeElement;
          if (!container) return;
          const buttons = container.querySelectorAll<HTMLElement>('button');
          const confirmBtn = buttons[buttons.length - 1] as HTMLElement | undefined;
          this.trap.activate(container, confirmBtn);
        });
      } else {
        this.trap.deactivate();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) this.onCancel();
  }

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
