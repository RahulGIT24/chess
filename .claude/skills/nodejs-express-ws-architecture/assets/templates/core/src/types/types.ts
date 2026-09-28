// Shared interfaces/DTOs used across controllers, domain modules, and lib.
// Start empty except for what the first resource actually needs — don't pre-declare types
// for features that don't exist yet.

export interface IApiResponse<T> {
  statuscode: number;
  data: T;
  message: string;
}
