// A rejection the page shows in its own language: the code names the text and params fill it in
export class ServiceError extends Error {
  readonly code: string;
  readonly params: Record<string, number>;

  constructor(message: string, code: string, params: Record<string, number> = {}) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.params = params;
  }
}
