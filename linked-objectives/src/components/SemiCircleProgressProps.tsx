type SemiCircleProgressProps = {
  progress: number; // 0 - 100
};

export default function SemiCircleProgress({ progress }: SemiCircleProgressProps) {
  const width = 150;
  const radius = width / 2;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference * (progress / 100); // Reversed calculation

  return (
    <div className="relative w-[150px] h-[90px] mx-auto">
      <svg
        width={width}
        height={radius + stroke / 2}
        viewBox={`0 0 ${width} ${radius + stroke / 2}`}
      >
        {/* Background semicircle */}
        <path
          d={`M ${stroke}, ${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${width - stroke}, ${radius}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* Progress semicircle */}
        <path
          d={`M ${stroke}, ${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${width - stroke}, ${radius}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Centered Percentage */}
      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-blue-600 font-semibold">
        {progress}%
      </div>

      {/* 0% and 100% Labels */}
      <div className="absolute left-0 bottom-0 text-xs text-gray-500">0%</div>
      <div className="absolute right-0 bottom-0 text-xs text-gray-500">100%</div>
    </div>
  );
}