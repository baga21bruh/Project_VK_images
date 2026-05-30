export function generateTaskId() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}