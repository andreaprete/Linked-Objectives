import '@/app/styles/SemiCircleProgress.css';

const SemiCircleProgress = ({
  strokeWidth,
  averageProgress, 
  strokeColor,
  size,
  strokeLinecap = "round",
  percentageSeperator = "%",
  fontStyle,
  hasBackground = false,
  bgStrokeColor = "#d3d3d3",
}) => {

  if (averageProgress < 0 || averageProgress > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  const radius = 50 - strokeWidth / 2;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - averageProgress / 100);

  const pathD = `M ${strokeWidth / 2},50 A ${radius},${radius} 0 0 1 ${100 - strokeWidth / 2},50`;

  return (
    <svg
      className="semi-circle-svg"
      width={size.width}
      height={size.height}
      viewBox="0 0 100 65"
      xmlns="http://www.w3.org/2000/svg"
    >
      {hasBackground && (
        <path
          d={pathD}
          stroke={bgStrokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          fill="none"
        />
      )}
      <path
        d={pathD}
        stroke={strokeColor || "#04001b"}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
      <text
        className="semi-circle-text semi-circle-percent"
        x="50"
        y="40"
        style={fontStyle}
      >
        {averageProgress}
        {percentageSeperator}
      </text>
      <text className="semi-circle-axis-text" x="0" y="65">
        0%
      </text>
      <text className="semi-circle-axis-text" x="100" y="65" textAnchor="end">
        100%
      </text>
    </svg>
  );
};

export default SemiCircleProgress;

