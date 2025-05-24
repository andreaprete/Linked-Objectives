import React from "react";

const wrapText = (text, maxLen = 24) => {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (let word of words) {
    if ((current + " " + word).trim().length <= maxLen) {
      current += " " + word;
    } else {
      lines.push(current.trim());
      current = word;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
};

const TextLabel = ({ title }) => {
  const lines = wrapText(title);
  const lineHeight = 14;
  const boxHeight = 100;
  const verticalOffset = (boxHeight - lines.length * lineHeight) / 2;

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x="70"
          y={verticalOffset + (i * 1) * lineHeight - 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#1e1e1e"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export function CurrentOKRIcon({ title }) {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100">
      <g strokeLinecap="round" transform="translate(10 10)">
        <rect x="0" y="0" width="140" height="80" rx="10" ry="10"
          stroke="#1e1e1e"
          strokeWidth="2"
          fill="none"
        />
        <TextLabel title={title} />
      </g>
    </svg>
  );
}

const makeIcon = (color, id) => ({ title }) => (
  <svg viewBox="0 0 160 100" width="160" height="100">
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={color} strokeWidth="2" />
      </pattern>
    </defs>
    <g strokeLinecap="round" transform="translate(10 10)">
      <rect
        x="0"
        y="0"
        width="140"
        height="80"
        rx="10"
        ry="10"
        fill={`url(#${id})`}
        stroke="#1e1e1e"
        strokeWidth="2"
      />
      <TextLabel title={title} />
    </g>
  </svg>
);

export const NeedsIcon = makeIcon("#ffc9c9", "hatch-needs");
export const NeededByIcon = makeIcon("#b2f2bb", "hatch-neededby");
export const ContributesToIcon = makeIcon("#a5d8ff", "hatch-contributesto");
export const ContributedToByIcon = makeIcon("#ffec99", "hatch-contributedby");
