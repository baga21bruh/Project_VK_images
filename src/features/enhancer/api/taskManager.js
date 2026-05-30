import { TASK_EVENTS } from "./taskEvents.js";
import {
  FINAL_TASK_STATUSES,
  TASK_STATUS,
} from "../../../shared/constants/taskStatus.js";
import { generateTaskId } from "../../../shared/utils/id.js";

class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.eventTarget = new EventTarget();

    this.worker = new Worker(
      new URL("../worker/enhance.worker.js", import.meta.url),
      { type: "module" }
    );

    this.worker.addEventListener("message", this.handleWorkerMessage);
  }

  handleWorkerMessage = (event) => {
    const { type, payload } = event.data ?? {};
    const task = this.tasks.get(payload?.taskId);

    if (!task) return;

    if (type === "task-update") {
      let previewUrl = task.previewUrl;

      if (payload.previewBlob) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrl = URL.createObjectURL(payload.previewBlob);
      }

      this.updateTask(task.id, {
        status: payload.status,
        progress: payload.progress,
        coefficients: payload.coefficients ?? task.coefficients,
        previewUrl,
      });
      return;
    }

    if (type === "task-complete") {
      if (task.resultUrl) {
        URL.revokeObjectURL(task.resultUrl);
      }

      const resultUrl = URL.createObjectURL(payload.blob);

      this.updateTask(task.id, {
        status: TASK_STATUS.DONE,
        progress: 100,
        resultBlob: payload.blob,
        resultUrl,
        resultFileName: payload.fileName,
        coefficients: payload.coefficients,
        metrics: payload.metrics,
        finishedAt: Date.now(),
      });
      return;
    }

    if (type === "task-error") {
      this.updateTask(task.id, {
        status: TASK_STATUS.ERROR,
        error: payload.error || "Ошибка обработки",
        finishedAt: Date.now(),
      });
      return;
    }

    if (type === "task-cancelled") {
      this.updateTask(task.id, {
        status: TASK_STATUS.CANCELLED,
        progress: 0,
        finishedAt: Date.now(),
      });
    }
  };

  createTask(file) {
    const taskId = generateTaskId();
    const originalUrl = URL.createObjectURL(file);

    const task = {
      id: taskId,
      file,
      fileName: file.name,
      fileSize: file.size,
      status: TASK_STATUS.QUEUED,
      progress: 0,
      error: null,
      originalUrl,
      resultUrl: null,
      resultBlob: null,
      resultFileName: null,
      coefficients: null,
      metrics: null,
      createdAt: Date.now(),
      finishedAt: null,
      previewUrl: null,
    };

    this.tasks.set(taskId, task);
    this.emit(task);

    return task;
  }

  updateTask(taskId, patch) {
    const current = this.tasks.get(taskId);
    if (!current) return;

    const updated = {
      ...current,
      ...patch,
    };

    this.tasks.set(taskId, updated);
    this.emit(updated);
  }

  emit(task) {
    this.eventTarget.dispatchEvent(
      new CustomEvent(TASK_EVENTS.CHANGED, {
        detail: this.toPublicTask(task),
      })
    );
  }

  toPublicTask(task) {
    return {
      id: task.id,
      fileName: task.fileName,
      fileSize: task.fileSize,
      status: task.status,
      progress: task.progress,
      error: task.error,
      originalUrl: task.originalUrl,
      resultUrl: task.resultUrl,
      resultFileName: task.resultFileName,
      coefficients: task.coefficients,
      metrics: task.metrics,
      createdAt: task.createdAt,
      finishedAt: task.finishedAt,
      previewUrl: task.previewUrl,
    };
  }

  listTasks() {
    return Array.from(this.tasks.values())
      .map((task) => this.toPublicTask(task))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  submitTask(file) {
    const task = this.createTask(file);

    this.worker.postMessage({
      type: "submit-task",
      payload: {
        taskId: task.id,
        file,
      },
    });

    return task.id;
  }

  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    return task ? this.toPublicTask(task) : null;
  }

  getTaskResult(taskId) {
    const task = this.tasks.get(taskId);
    return task?.resultUrl ?? null;
  }

  cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return { success: false };

    if (FINAL_TASK_STATUSES.has(task.status)) {
      return { success: false };
    }

    this.worker.postMessage({
      type: "cancel-task",
      payload: { taskId },
    });

    return { success: true };
  }

  subscribe(listener) {
    const handler = (event) => listener(event.detail);
    this.eventTarget.addEventListener(TASK_EVENTS.CHANGED, handler);

    return () => {
      this.eventTarget.removeEventListener(TASK_EVENTS.CHANGED, handler);
    };
  }
}

const taskManager = new TaskManager();
export default taskManager;