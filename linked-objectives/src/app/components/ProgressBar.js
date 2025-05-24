import '@/app/styles/ProgressBar.css';

export default function ProgressBar({ progress, state }) {
  return (
    <div className="progress-bar-container">
      {/* Display the actual state */}
      <p className="progress-bar-label">State: {state}</p>
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
        <span className="progress-bar-percentage">{progress}%</span>
      </div>
    </div>
  );
}