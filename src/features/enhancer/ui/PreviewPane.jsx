function formatCoefficients(coefficients) {
  if (!coefficients) return null;

  return {
    brightness: coefficients.brightness?.toFixed(2),
    contrast: coefficients.contrast?.toFixed(2),
    saturation: coefficients.saturation?.toFixed(2),
  };
}

export default function PreviewPane({ task }) {
  if (!task) {
    return (
      <section className="panel">
        <h2>Предпросмотр</h2>
        <p className="hint">Выбери задачу слева.</p>
      </section>
    );
  }

  const coeffs = formatCoefficients(task.coefficients);

  return (
    <section className="panel">
      <h2>Предпросмотр</h2>

      <div className="preview-grid">
        <div className="preview-card">
          <h3>Исходное</h3>
          {task.originalUrl || task.previewUrl ? (
              <img src={task.previewUrl || task.originalUrl} alt="Original" />
          ) : null}
        </div>

        <div className="preview-card">
          <h3>Результат</h3>
          {task.resultUrl ? (
            <>
              <img src={task.resultUrl} alt="Processed" />
              <a
                className="primary-btn"
                href={task.resultUrl}
                download={task.resultFileName || "enhanced.jpg"}
              >
                Скачать результат
              </a>
            </>
          ) : (
            <p className="hint">Результат пока не готов.</p>
          )}
        </div>
      </div>

      <div className="info-grid">
        <div>
          <strong>Статус:</strong> {task.status}
        </div>
        <div>
          <strong>Прогресс:</strong> {task.progress}%
        </div>

        {coeffs ? (
          <>
            <div>
              <strong>Brightness:</strong> {coeffs.brightness}
            </div>
            <div>
              <strong>Contrast:</strong> {coeffs.contrast}
            </div>
            <div>
              <strong>Saturation:</strong> {coeffs.saturation}
            </div>
          </>
        ) : null}

        {task.metrics ? (
          <>
            <div>
              <strong>Размер:</strong> {task.metrics.width} × {task.metrics.height}
            </div>
            <div>
              <strong>Время:</strong> {task.metrics.durationMs} ms
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}