import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Task } from './task.model';
import { TaskService } from './task.service';

const sampleTask: Task = {
  id: 7,
  title: 'Write tests',
  description: 'Cover the HTTP gateway',
  status: 'TODO',
  createdAt: '2026-11-07T10:00:00',
  updatedAt: '2026-11-07T10:00:00',
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads all tasks with GET /api/tasks', () => {
    let result: Task[] | undefined;
    service.list().subscribe((tasks) => (result = tasks));

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('GET');
    request.flush([sampleTask]);

    expect(result).toEqual([sampleTask]);
  });

  it('loads one task with GET /api/tasks/:id', () => {
    let result: Task | undefined;
    service.get(7).subscribe((task) => (result = task));

    const request = httpMock.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('GET');
    request.flush(sampleTask);

    expect(result?.title).toBe('Write tests');
  });

  it('creates a task with POST /api/tasks', () => {
    const payload = { title: 'New task', description: '', status: 'TODO' as const };
    service.create(payload).subscribe();

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...sampleTask, ...payload });

    expect(request.request.body.title).toBe('New task');
  });

  it('updates a task with PUT /api/tasks/:id', () => {
    const payload = {
      title: 'Updated',
      description: 'New description',
      status: 'DONE' as const,
    };
    service.update(7, payload).subscribe();

    const request = httpMock.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...sampleTask, ...payload });
  });

  it('deletes a task with DELETE /api/tasks/:id', () => {
    service.delete(7).subscribe();

    const request = httpMock.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
