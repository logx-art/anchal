import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Every API route returns one of these two shapes. Keeping this consistent
// means the frontend never has to guess where the error message lives.

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
};

export function apiSuccess<T>(data: T, init?: number) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status: init ?? 200 });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string>
) {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message, fieldErrors } },
    { status }
  );
}

// Converts a Zod validation failure into the fieldErrors shape above, so
// forms can highlight the exact field that failed without string-parsing
// an error message.
export function apiErrorFromZod(err: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return apiError("VALIDATION_ERROR", "Please check the highlighted fields.", 422, fieldErrors);
}

// Common, named error shortcuts used across route handlers.
export const apiErrors = {
  unauthorized: () => apiError("UNAUTHORIZED", "Please sign in to continue.", 401),
  forbidden: () => apiError("FORBIDDEN", "You don't have access to this resource.", 403),
  notFound: (what = "Resource") => apiError("NOT_FOUND", `${what} was not found.`, 404),
  conflict: (message: string) => apiError("CONFLICT", message, 409),
  server: (message = "Something went wrong. Please try again.") =>
    apiError("SERVER_ERROR", message, 500),
};
