import { Routes } from '@angular/router';

/**
 * Every feature screen is lazy-loaded, so the initial bundle only contains the
 * shell. A route `title` also updates the browser tab for free.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks/new',
    title: 'New task · Taskboard',
    loadComponent: () => import('./tasks/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'tasks/:id/edit',
    title: 'Edit task · Taskboard',
    loadComponent: () => import('./tasks/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'tasks',
    title: 'Tasks · Taskboard',
    loadComponent: () => import('./tasks/task-list').then((m) => m.TaskList),
  },
  { path: '**', redirectTo: 'tasks' },
];
