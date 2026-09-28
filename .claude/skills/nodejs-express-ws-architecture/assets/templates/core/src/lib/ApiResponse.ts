export class ApiResponse<T = any> {
  statuscode: number;
  data: T;
  message: string;

  constructor(statuscode: number, data: T, message: string) {
    this.statuscode = statuscode;
    this.data = data;
    this.message = message;
  }
}
