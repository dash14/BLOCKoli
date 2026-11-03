import { useEffect, useRef, useState } from "react";

const CHANNEL_NAME = "options-editing-tab";

// Pages save the whole list of rule sets, so two pages editing at once would
// undo each other's changes. Only the page opened last edits.
export function useEditingTab() {
  const [editing, setEditing] = useState(true);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const opened = new BroadcastChannel(CHANNEL_NAME);
    // A page never receives its own messages, so any message is another page
    opened.onmessage = () => setEditing(false);
    opened.postMessage("editing");
    channel.current = opened;
    return () => {
      opened.close();
      channel.current = null;
    };
  }, []);

  const editHere = () => {
    channel.current?.postMessage("editing");
    setEditing(true);
  };

  return { editing, editHere };
}
