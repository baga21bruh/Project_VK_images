export default function ProgressBar({ value = 0 }) {
  return (
    <div className="progress">
      <div className="progress__fill" style={{ width: `${value}%` }} />
      <span className="progress__label">{value}%</span>
    </div>
  );
}