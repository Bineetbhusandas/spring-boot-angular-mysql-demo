import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Task, TaskPayload } from './task.model';

/**
 * Thin HTTP gateway for the Spring Boot task API.
 *
 * It returns Observables and holds no component state: the list and form
 * components decide how loading, errors and optimistic updates are handled.
 * The URL is relative on purpose, so the same build works behind the Angular
 * dev-server proxy and behind nginx in Docker (no CORS, no environment URLs).
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(payload: TaskPayload): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, payload);
  }

  update(id: number, payload: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
