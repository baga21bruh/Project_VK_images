import { SUPPORTED_INPUT_ACCEPT } from "../../../shared/utils/file.js";

export default function UploadPanel({ onFilesSelected }) {
  const handleChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    onFilesSelected(files);
    event.target.value = "";
  };

  return (
    <section className="panel">
      <h2>Загрузка изображения</h2>
      <label className="upload-box">
        <input
          className="upload-box__input"
          type="file"
          accept={SUPPORTED_INPUT_ACCEPT}
          multiple
          onChange={handleChange}
        />
        <span>Выбрать изображения</span>
      </label>
      <p className="hint">
        Выберите изображение, которое хотите улучшить.
      </p>
    </section>
  );
}