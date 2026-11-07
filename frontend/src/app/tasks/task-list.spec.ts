import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TaskList } from './task-list';
import { Task } from './task.model';

const TASKS: Task[] = [
  {
    id: 1,
    title: 'Write documentation',
    description: 'Explain the proxy setup',
    status: 'TODO',
    createdAt: '2026-11-07T10:00:00',
    updatedAt: '2026-11-07T10:00:00',
  },
  {
    id: 2,
    title: 'Ship the release',
    description: null,
    status: 'DONE',
    createdAt: '2026-11-06T09:00:00',
    updatedAt: '2026-11-07T09:30:00',
  },
];

describe('TaskList', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createLoadedList(): HTMLElement {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('GET');
    request.flush(TASKS);

    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the tasks returned by the API', () => {
    const element = createLoadedList();

    expect(element.textContent).toContain('Write documentation');
    expect(element.textContent).toContain('Ship the release');
    expect(element.textContent).toContain('Showing 2 of 2 tasks');
  });

  it('shows a specific empty state when a filter matches nothing', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();

    httpMock.expectOne('/api/tasks').flush(TASKS);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const inProgressChip = Array.from(element.querySelectorAll<HTMLButtonElement>('.chip')).find(
      (chip) => chip.textContent?.includes('In progress'),
    );

    inProgressChip?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.textContent).toContain('Nothing in this view');
    expect(element.textContent).toContain('No tasks match the “In progress” filter.');
  });

  it('shows the error state when the API fails', () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();

    httpMock
      .expectOne('/api/tasks')
      .flush({ detail: 'Database is down' }, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Could not load tasks');
    expect(element.textContent).toContain('Database is down');
  });
});
