// Error types for the application

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any;
  statusCode?: number;
}

export interface NetworkError {
  message: string;
  code?: string;
  isNetworkError: true;
}

export type AppError = ApiErrorResponse | NetworkError | Error;

// Type guard to check if error is an API error response
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as ApiErrorResponse).success === false &&
    'message' in error
  );
}

// Type guard to check if error is a network error
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isNetworkError' in error &&
    (error as NetworkError).isNetworkError === true
  );
}

// Extract error message from various error types
export function getErrorMessage(error: unknown): string {
  if (isApiErrorResponse(error)) {
    return error.message || 'An error occurred';
  }
  if (isNetworkError(error)) {
    return error.message || 'Network error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

