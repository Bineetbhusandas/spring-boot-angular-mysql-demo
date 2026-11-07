import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adds toasts with a kind and message', () => {
    service.show('Saved', 'success', 0);
    service.show('Failed', 'error', 0);

    const toasts = service.toasts();
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toMatchObject({ kind: 'success', message: 'Saved' });
    expect(toasts[1]).toMatchObject({ kind: 'error', message: 'Failed' });
  });

  it('dismisses a toast by id', () => {
    service.show('First', 'info', 0);
    service.show('Second', 'info', 0);

    const [first] = service.toasts();
    service.dismiss(first.id);

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('auto-dismisses after the requested duration', () => {
    vi.useFakeTimers();
    try {
      service.show('Temporary', 'info', 1000);
      expect(service.toasts()).toHaveLength(1);

      vi.advanceTimersByTime(1000);
      expect(service.toasts()).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
