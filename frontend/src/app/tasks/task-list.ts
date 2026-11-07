import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmDialog } from '../shared/confirm-dialog';
import { ToastService } from '../shared/toast.service';
import { toUserMessage } from './http-error';
import { TASK_STATUS_BADGE_CLASSES, TASK_STATUS_LABELS, Task, TaskStatus } from './task.model';
import { TaskService } from './task.service';

type FilterValue = 'ALL' | TaskStatus;

const FILTER_OPTIONS: ReadonlyArray<{ value: FilterValue; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

/**
 * Task list screen.
 *
 * All view state is held in signals, so the template updates without Zone.js.
 * The HTTP service is stateless; this component decides what "loading" and
 * "empty" mean, which keeps the service reusable from any other screen.
 */
@Component({
  selector: 'app-task-list',
  imports: [RouterLink, DatePipe, ConfirmDialog],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly toast = inject(ToastService);

  protected readonly filterOptions = FILTER_OPTIONS;

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filter = signal<FilterValue>('ALL');
  protected readonly pendingDelete = signal<Task | null>(null);
  protected readonly deleting = signal(false);

  protected readonly filteredTasks = computed(() => {
    const activeFilter = this.filter();
    return activeFilter === 'ALL'
      ? this.tasks()
      : this.tasks().filter((task) => task.status === activeFilter);
  });

  protected readonly counts = computed<Record<FilterValue, number>>(() => {
    const tasks = this.tasks();
    return {
      ALL: tasks.length,
      TODO: tasks.filter((task) => task.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
      DONE: tasks.filter((task) => task.status === 'DONE').length,
    };
  });

  protected readonly deleteMessage = computed(() => {
    const task = this.pendingDelete();
    return task ? `“${task.title}” will be permanently removed. This cannot be undone.` : '';
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toUserMessage(error, 'Tasks could not be loaded.'));
        this.loading.set(false);
      },
    });
  }

  protected setFilter(value: FilterValue): void {
    this.filter.set(value);
  }

  protected askDelete(task: Task): void {
    this.pendingDelete.set(task);
  }

  protected cancelDelete(): void {
    if (!this.deleting()) {
      this.pendingDelete.set(null);
    }
  }

  protected confirmDelete(): void {
    const task = this.pendingDelete();
    if (!task || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.taskService.delete(task.id).subscribe({
      next: () => {
        // No refetch needed: the API confirmed the delete, so remove it locally.
        this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.success(`Deleted “${task.title}”.`);
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.toast.error(toUserMessage(error, 'The task could not be deleted.'));
      },
    });
  }

  protected statusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  protected badgeClass(status: TaskStatus): string {
    return TASK_STATUS_BADGE_CLASSES[status];
  }

  protected labelFor(value: FilterValue): string {
    return this.filterOptions.find((option) => option.value === value)?.label ?? 'All';
  }
}
