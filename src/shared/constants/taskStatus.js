export const TASK_STATUS = {
  QUEUED: "queued",
  DECODING: "decoding",
  PREPROCESSING: "preprocessing",
  INFERENCING: "inferencing",
  APPLYING: "applying",
  ENCODING: "encoding",
  DONE: "done",
  ERROR: "error",
  CANCELLED: "cancelled",
};

export const FINAL_TASK_STATUSES = new Set([
  TASK_STATUS.DONE,
  TASK_STATUS.ERROR,
  TASK_STATUS.CANCELLED,
]);