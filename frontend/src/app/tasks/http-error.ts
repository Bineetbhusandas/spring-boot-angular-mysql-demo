import { HttpErrorResponse } from '@angular/common/http';

/**
 * Shape of the RFC 9457 "Problem Details" body returned by the backend's
 * GlobalExceptionHandler. Every field is optional because a proxy or a
 * non-Spring error page might send something else entirely.
 */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string>;
}

/**
 * Turns any thrown value into a sentence that is safe to show to a user.
 * This is the single place where HTTP errors become UI text.
 */
export function toUserMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  // status 0 means the request never reached an HTTP server at all.
  if (error.status === 0) {
    return 'Cannot reach the API. Check that the backend is running and try again.';
  }

  const problem = error.error as ProblemDetails | null;
  if (problem && typeof problem === 'object') {
    // Validation errors arrive as { field: "message" }; show the first one.
    const fieldMessage = problem.errors ? Object.values(problem.errors)[0] : undefined;
    if (fieldMessage) {
      return fieldMessage;
    }
    if (problem.detail) {
      return problem.detail;
    }
  }

  if (error.status === 404) {
    return 'The requested task was not found.';
  }

  return error.statusText || fallback;
}
