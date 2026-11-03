import { useEffect, useState } from "react";

export const EDITING_LOCK_NAME = "options-editing";

// Pages save the whole list of rule sets, so two pages editing at once would
// undo each other's changes. Only the page holding this lock edits: a page
// takes it when opened, and the others wait for it to be closed.
export function useEditingTab() {
  const [editing, setEditing] = useState(true);
  const [lock] = useState(() => new EditingLock(setEditing));

  useEffect(() => {
    lock.open();
    return () => lock.close();
  }, [lock]);

  return { editing, editHere: () => lock.take() };
}

class EditingLock {
  private closed = false;
  private waiting: AbortController | null = null;
  private release = () => {};

  constructor(private readonly setEditing: (editing: boolean) => void) {}

  open() {
    this.closed = false;
    this.take();
  }

  close() {
    this.closed = true;
    this.waiting?.abort();
    this.release();
  }

  take() {
    this.waiting?.abort();
    this.hold({ steal: true });
  }

  private wait() {
    this.waiting = new AbortController();
    this.hold({ signal: this.waiting.signal });
  }

  private hold(options: LockOptions) {
    navigator.locks
      .request(EDITING_LOCK_NAME, options, () => {
        // Granted after this page closed, so give it up at once
        if (this.closed) return;
        this.setEditing(true);
        return new Promise<void>((resolve) => (this.release = resolve));
      })
      .catch(() => {
        // Taken by another page, or this page's wait was given up
        if (this.closed || options.signal?.aborted) return;
        this.setEditing(false);
        this.wait();
      });
  }
}
