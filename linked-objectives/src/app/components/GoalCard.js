export function GoalCard({ goal }) {
    return (
      <div className="border rounded p-3 flex items-center justify-between">
        <div>{goal.title}</div>
        <div className="text-green-600">● {goal.status}</div>
        <div className="w-1/4 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
        </div>
        <div className="w-10 text-right">{goal.progress}%</div>
      </div>
    );
  }