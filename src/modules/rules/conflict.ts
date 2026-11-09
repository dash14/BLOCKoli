// Another page changed what this page was saving
export class SaveConflictError extends Error {
  constructor() {
    super("Changed on another page");
    this.name = "SaveConflictError";
  }
}
