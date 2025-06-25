// components/Logo_sidebar.js
"use client";

const Logo_sidebar = () => (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
    <svg
      width="220"
      height="70"
      viewBox="0 0 220 70"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
    >
      <defs>
        <style>
          {`
            .text {
              font-family: 'Segoe UI', sans-serif;
              font-weight: 600;
              font-size: 36px;
              dominant-baseline: middle;
            }
            .blue {
              fill: #ffffff;
            }
            .gray {
              fill: #ffffff;
            }
            .halo {
              fill: none;
              stroke: #ffffff;
              stroke-width: 4;
              stroke-dasharray: 150;
              stroke-dashoffset: 20;
            }
          `}
        </style>
      </defs>

      <g transform="translate(30, 15)">
        <path
          className="halo"
          d="M20,35 a20,20 0 1,1 40,0.1"
          transform="rotate(-20 40 35)"
        />
        <text x="30" y="45" className="text">
          <tspan className="blue">O</tspan>
          <tspan className="blue">k</tspan>
          <tspan className="gray">ula</tspan>
          <tspan className="blue">r</tspan>
        </text>
      </g>
    </svg>
  </div>
);

export default Logo_sidebar;
