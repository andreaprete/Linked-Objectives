import SemiCircleProgress from './SemiCircleProgressProps'; // adjust path as needed


type LinkedOkrCardProps = {
  progress: number;
};

export default function LinkedOkrCard({ progress }: LinkedOkrCardProps) {
  return (
    <div className="border p-4 rounded-md bg-gray-50 flex justify-between items-center">
      <div className="max-w-[70%]">
        <p className="font-semibold mb-1">Linked to OKR:</p>
        <p className="text-lg font-medium">OKR title title title title</p>
        <p className="text-sm text-gray-700">
          OKR description description description description description...
        </p>
      </div>

      <div className="flex-shrink-0">
        <SemiCircleProgress progress={progress} />
      </div>
    </div>
  );
}