export default function ProgressBar({ progress }) {
  return (
    <div className="w-full max-w-lg">
      <p className="text-blue-600 font-semibold uppercase text-sm">In Progress</p>
      <div className="relative w-full bg-gray-200 rounded-full h-6 mt-2">
        <div
          className="bg-blue-600 h-6 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
        <span className="absolute right-2 -top-6 text-sm font-semibold text-blue-600">
          {progress}%
        </span>
      </div>
    </div>
  );
}
