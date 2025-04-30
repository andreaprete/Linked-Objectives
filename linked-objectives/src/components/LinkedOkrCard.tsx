import SemiCircleProgress from './SemiCircleProgressProps';

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
        <SemiCircleProgress
          strokeWidth={10}
          percentage={progress}
          size={{ width: 200, height: 100 }}
          strokeColor="#2563eb"
          bgStrokeColor="#e5e7eb"
          hasBackground={true}
          percentageSeperator="%"
          fontStyle={{
            fontSize: "16px",
            fontWeight: "bold",
            fill: "#2563eb",
          }}
        />
      </div>
    </div>
  );
}
