import { TASK_STATUS } from "../../../shared/constants/taskStatus.js";
import { decodeImage } from "../pipeline/decodeImage.js";
import { applyAdjustments } from "../pipeline/applyAdjustments.js";
import { exportImage } from "../pipeline/exportImage.js";
import inferenceEngine from "../model/inferenceEngine.js";

const cancelledTasks = new Set();

function post(type, payload) {
  self.postMessage({ type, payload });
}

function update(taskId, status, progress, extra = {}) {
  post("task-update", {
    taskId,
    status,
    progress,
    ...extra,
  });
}

function isCancelled(taskId) {
  return cancelledTasks.has(taskId);
}

async function processTask(taskId, file) {
  const startedAt = performance.now();
  let decoded = null;

  try {
    update(taskId, TASK_STATUS.DECODING, 5);

    decoded = await decodeImage(file);
    if (isCancelled(taskId)) throw new Error("TASK_CANCELLED");

    update(taskId, TASK_STATUS.PREPROCESSING, 20, {
      previewBlob: decoded.previewBlob,
    });

    await inferenceEngine.load();
    if (isCancelled(taskId)) throw new Error("TASK_CANCELLED");

    update(taskId, TASK_STATUS.INFERENCING, 35);

    const coefficients = await inferenceEngine.predict(decoded.bitmap);
    if (isCancelled(taskId)) throw new Error("TASK_CANCELLED");

    update(taskId, TASK_STATUS.APPLYING, 55, { coefficients });

    const resultCanvas = await applyAdjustments(
      decoded.bitmap,
      coefficients,
      (ratio) => {
        const progress = 55 + Math.round(ratio * 30);
        update(taskId, TASK_STATUS.APPLYING, progress, { coefficients });
      },
      () => isCancelled(taskId)
    );

    if (isCancelled(taskId)) throw new Error("TASK_CANCELLED");

    update(taskId, TASK_STATUS.ENCODING, 90, { coefficients });

    const exported = await exportImage(resultCanvas, file);
    if (isCancelled(taskId)) throw new Error("TASK_CANCELLED");

    const durationMs = Math.round(performance.now() - startedAt);

    post("task-complete", {
      taskId,
      status: TASK_STATUS.DONE,
      progress: 100,
      blob: exported.blob,
      fileName: exported.fileName,
      mimeType: exported.mimeType,
      coefficients,
      metrics: {
        width: decoded.width,
        height: decoded.height,
        durationMs,
      },
    });
  } catch (error) {
    if (error.message === "TASK_CANCELLED") {
      post("task-cancelled", {
        taskId,
        status: TASK_STATUS.CANCELLED,
        progress: 0,
      });
    } else {
      post("task-error", {
        taskId,
        status: TASK_STATUS.ERROR,
        progress: 0,
        error: `${error?.message || "Unknown worker error"}\n${error?.stack || ""}`,
      });
    }
  } finally {
    cancelledTasks.delete(taskId);
    decoded?.bitmap?.close?.();
  }
}

self.onmessage = (event) => {
  const { type, payload } = event.data ?? {};

  if (type === "submit-task") {
    processTask(payload.taskId, payload.file);
  }

  if (type === "cancel-task") {
    cancelledTasks.add(payload.taskId);
  }
};