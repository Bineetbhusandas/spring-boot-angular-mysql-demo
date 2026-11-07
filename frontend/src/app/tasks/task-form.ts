import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ToastService } from '../shared/toast.service';
import { toUserMessage } from './http-error';
import { TASK_STATUSES, TASK_STATUS_LABELS, TaskPayload, TaskStatus } from './task.model';
import { TaskService } from './task.service';

type TextControl = 'title' | 'description';

/**
 * One component serves both "create" and "edit".
 *
 * The presence of an `:id` route parameter decides the mode. Reactive forms
 * are used because they keep validation and the submit payload explicit and
 * are easy to unit test.
 */
@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly statuses = TASK_STATUSES;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadFailed = signal(false);

  protected readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(200),
    ]),
    description: this.formBuilder.control('', [Validators.maxLength(1000)]),
    status: this.formBuilder.control<TaskStatus>('TODO'),
  });

  private taskId: number | null = null;

  get isEdit(): boolean {
    return this.taskId !== null;
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (!rawId) {
      return;
    }

    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('That task id is not valid.');
      this.loadFailed.set(true);
      return;
    }

    this.taskId = id;
    this.loadTask(id);
  }

  protected statusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  protected showError(controlName: TextControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }

    this.submitted.set(true);
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: TaskPayload = { ...raw, title: raw.title.trim() };
    this.saving.set(true);

    const request$ = this.isEdit
      ? this.taskService.update(this.taskId as number, payload)
      : this.taskService.create(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Task updated.' : 'Task created.');
        void this.router.navigate(['/tasks']);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(toUserMessage(error));
        this.toast.error('Could not save the task.');
      },
    });
  }

  private loadTask(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.get(id).subscribe({
      next: (task) => {
        this.form.setValue({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
        });
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toUserMessage(error, 'That task could not be loaded.'));
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }
}
