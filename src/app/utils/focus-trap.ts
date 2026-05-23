const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    el => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null
  );
}

export class FocusTrap {
  private container: HTMLElement | null = null;
  private returnTo: HTMLElement | null = null;
  private readonly handler = (e: KeyboardEvent) => this.onKeydown(e);

  activate(container: HTMLElement, firstFocus?: HTMLElement, returnTo?: HTMLElement): void {
    this.returnTo = returnTo ?? (document.activeElement as HTMLElement);
    this.container = container;
    document.addEventListener('keydown', this.handler);
    const target = firstFocus ?? getFocusableElements(container)[0];
    target?.focus();
  }

  deactivate(): void {
    document.removeEventListener('keydown', this.handler);
    this.container = null;
    this.returnTo?.focus();
    this.returnTo = null;
  }

  private onKeydown(e: KeyboardEvent): void {
    if (!this.container) return;
    if (e.key === 'Tab') {
      const focusable = getFocusableElements(this.container);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }
}
