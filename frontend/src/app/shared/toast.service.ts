import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * Tiny signal-based notification store.
 *
 * Any component can inject it and call success()/error(). The toast component
 * at the app root renders the list. Signals keep it zoneless-friendly: adding
 * or removing a toast notifies Angular's change detection automatically.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly state = signal<Toast[]>([]);
  readonly toasts = this.state.asReadonly();

  private sequence = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string): void {
    this.show(message, 'success', 4000);
  }

  error(message: string): void {
    this.show(message, 'error', 7000);
  }

  info(message: string): void {
    this.show(message, 'info', 5000);
  }

  show(message: string, kind: ToastKind = 'info', durationInMs = 5000): void {
    const id = ++this.sequence;
    this.state.update((toasts) => [...toasts, { id, kind, message }]);

    // duration 0 means "keep until dismissed", useful in tests.
    if (durationInMs > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), durationInMs),
      );
    }
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.state.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
