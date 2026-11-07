/**
 * Client-side mirror of the backend contract.
 *
 * The Java enum `TaskStatus` is serialised as one of these three strings, and
 * `TaskResponse` supplies `id`, `title`, `description`, `status`, `createdAt`
 * and `updatedAt`. Keeping the model in one file makes the contract explicit
 * and gives the compiler something to check every template against.
 */

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  /** The backend allows an empty description, so this can be null. */
  description: string | null;
  status: TaskStatus;
  /** ISO-8601 local date-time, e.g. "2026-11-07T10:15:30.123". */
  createdAt: string;
  updatedAt: string;
}

/** Body sent to POST /api/tasks and PUT /api/tasks/{id}. */
export interface TaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

/** Full CSS class list for a status badge (global styles live in styles.css). */
export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  TODO: 'badge badge-todo',
  IN_PROGRESS: 'badge badge-progress',
  DONE: 'badge badge-done',
};
