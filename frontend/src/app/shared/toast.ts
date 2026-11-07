import { Component, inject } from '@angular/core';

import { ToastKind, ToastService } from './toast.service';

/**
 * Renders the notifications held by ToastService.
 * It lives once, at the root of the app shell, and never owns state itself.
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastStack {
  protected readonly toastService = inject(ToastService);

  protected icon(kind: ToastKind): string {
    switch (kind) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      default:
        return 'i';
    }
  }
}
