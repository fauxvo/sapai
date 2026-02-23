export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: SapBusinessError };

export interface SapBusinessError {
  httpStatus: number;
  code: string;
  message: string;
  details: SapErrorDetail[];
}

export interface SapErrorDetail {
  code: string;
  message: string;
  severity: string;
}

export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

export function fail<T>(error: SapBusinessError): ServiceResult<T> {
  return { success: false, error };
}
