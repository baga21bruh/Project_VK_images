import ProgressBar from "./ProgressBar.jsx";
import { formatBytes } from "../../../shared/utils/file.js";
import { FINAL_TASK_STATUSES } from "../../../shared/constants/taskStatus.js";

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onCancelTask,
}) {
  if (!tasks.length) {
    return (
      <section className="panel">
        <h2>История</h2>
        <p className="hint">Пусто</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>История</h2>

      <div className="task-list">
        {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId;
          const canCancel = !FINAL_TASK_STATUSES.has(task.status);

          return (
            <div
              key={task.id}
              className={`task-card ${isSelected ? "task-card--selected" : ""}`}
              onClick={() => onSelectTask(task.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectTask(task.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="task-card__header">
                <strong>{task.fileName}</strong>
                <span>{formatBytes(task.fileSize)}</span>
              </div>

              <div className="task-card__meta">
                <span>Статус: {task.status}</span>
              </div>

              <ProgressBar value={task.progress} />

              {task.error ? (
                <div className="task-card__error">{task.error}</div>
              ) : null}

              <div className="task-card__actions">
                <span className="task-card__id">{task.id.slice(0, 8)}</span>

                {canCancel ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCancelTask(task.id);
                    }}
                  >
                    Отменить
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}