type ProgressBarProps = {
    progress: number;
  };
  
  export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
      <div>
        <p className="text-blue-600 font-semibold uppercase text-sm">In Progress</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right font-semibold text-blue-600 mt-1">{progress}%</p>
      </div>
    );
  }
  