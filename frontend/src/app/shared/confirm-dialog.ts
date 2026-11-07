import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Accessible confirmation modal built on the native <dialog> element.
 *
 * The parent owns the `open` flag and listens to `confirmed` / `cancelled`.
 * showModal() gives us focus trapping, Escape handling and a real backdrop
 * without pulling in a UI library.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Are you sure?');
  readonly message = input('');
  readonly confirmLabel = input('Confirm');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Sync the signal input to the imperative <dialog> API.
    effect(() => {
      const element = this.dialog()?.nativeElement;
      if (!element) {
        return;
      }

      if (this.open() && !element.open) {
        element.showModal();
      } else if (!this.open() && element.open) {
        element.close();
      }
    });
  }

  protected cancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  /** Keep Escape under the parent's control so the busy state can block it. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.cancel();
    }
  }
}
