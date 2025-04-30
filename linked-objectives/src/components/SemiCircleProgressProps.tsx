import React from "react";

type ISemiCircleProgress = {
  strokeWidth: number;
  strokeLinecap?: "butt" | "round" | "square" | "inherit";
  percentage: number;
  percentageSeperator?: string;
  size: {
    width: number;
    height: number;
  };
  strokeColor?: string;
  fontStyle?: {
    fontSize: string;
    fontFamily?: string;
    fontWeight: string;
    fill: string;
  };
  hasBackground?: boolean;
  bgStrokeColor?: string;
};

const SemiCircleProgress = ({
  strokeWidth,
  percentage,
  strokeColor,
  size,
  strokeLinecap = "round",
  percentageSeperator = "%",
  fontStyle,
  hasBackground = false,
  bgStrokeColor = "#d3d3d3",
}: ISemiCircleProgress) => {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  const radius = 50 - strokeWidth / 2;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  // Flip path to go from left to right (clockwise)
  const pathD = `M ${strokeWidth / 2},50 A ${radius},${radius} 0 0 1 ${
    100 - strokeWidth / 2
  },50`;

  return (
    <svg
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
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />

      <text
        x="50"
        y="40"
        textAnchor="middle"
        dominantBaseline="middle"
        style={fontStyle}
      >
        {percentage}
        {percentageSeperator}
      </text>

      {/* 0% and 100% labels slightly lower */}
      <text x="0" y="65" fontSize="10" fill="#666">
        0%
      </text>
      <text x="100" y="65" fontSize="10" fill="#666" textAnchor="end">
        100%
      </text>
    </svg>
  );
};

export default SemiCircleProgress;
