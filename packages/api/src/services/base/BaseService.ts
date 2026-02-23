import type { HttpDestination } from '@sap-cloud-sdk/connectivity';
import { getSapDestination } from '../../config/destination.js';
import { parseSapError } from '../../utils/error-parser.js';
import type { ServiceResult, SapBusinessError } from './types.js';
import { ok, fail } from './types.js';

export abstract class BaseService {
  protected readonly destination: HttpDestination;

  constructor(destination?: HttpDestination) {
    this.destination = destination ?? getSapDestination();
  }

  protected async execute<T>(fn: () => Promise<T>): Promise<ServiceResult<T>> {
    try {
      const data = await fn();
      return ok(data);
    } catch (error: unknown) {
      const sapError = this.parseSapError(error);
      return fail(sapError);
    }
  }

  protected parseSapError(error: unknown): SapBusinessError {
    return parseSapError(error);
  }
}
