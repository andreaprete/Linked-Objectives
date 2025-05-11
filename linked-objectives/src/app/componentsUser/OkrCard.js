export default function OkrCard({ title, description, progress }) {
    return (
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="w-24 h-24 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">Category: category</span>
          <span className="text-xs text-gray-400">Status: status</span>
          <div className="relative mt-2">
            <svg viewBox="0 0 36 36" className="w-12 h-12">
              <path
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  