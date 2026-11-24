import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/user.model';

export interface ParsedHttpError {
  status: number;
  message: string;
  code?: string;
  reason?: string;
  whatsappUrl?: string;
}

export function parseHttpError(err: unknown, fallbackMessage: string): ParsedHttpError {
  if (err instanceof HttpErrorResponse) {
    const body = (err.error ?? {}) as ApiErrorBody;
    return {
      status: err.status,
      message: body.message || body.reason || fallbackMessage,
      code: body.code,
      reason: body.reason,
      whatsappUrl: body.whatsappUrl
    };
  }
  return {
    status: 0,
    message: fallbackMessage
  };
}
