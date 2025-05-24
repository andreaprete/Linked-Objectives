import React, { useEffect, useState, useMemo } from "react";
import {
  CurrentOKRIcon,
  NeedsIcon,
  NeededByIcon,
  ContributesToIcon,
  ContributedToByIcon,
} from "./GraphIcons";
import "@/app/styles/RelatedGraph.css";

const typeToComponent = {
  needs: NeedsIcon,
  neededBy: NeededByIcon,
  contributesTo: ContributesToIcon,
  contributedToBy: ContributedToByIcon,
};

export default function RelatedGraph({ data }) {
  const [relatedOKRs, setRelatedOKRs] = useState([]);

  const allRelations = useMemo(() => {
    if (!data) return [];

    return [
      ...(data.needs || []).map((id) => ({ id, type: "needs" })),
      ...(data.neededBy || []).map((id) => ({ id, type: "neededBy" })),
      ...(data.contributesTo || []).map((id) => ({
        id,
        type: "contributesTo",
      })),
      ...(data.contributedToBy || []).map((id) => ({
        id,
        type: "contributedToBy",
      })),
    ];
  }, [data]);

  useEffect(() => {
    async function fetchRelated() {
      const uniqueIds = [...new Set(allRelations.map((r) => r.id))];
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          const res = await fetch(`/api/objectives/${id}`);
          const json = await res.json();
          return { id, title: json.data.title };
        })
      );
      setRelatedOKRs(results);
    }

    if (allRelations.length) fetchRelated();
  }, [allRelations]);

  if (!data) return null;

  const boxW = 160;
  const boxH = 90; 
  const marginX = 20;
  const svgWidth = 1200;
  const svgHeight = 500;

  const rowY = {
    needs: 70,
    neededBy: 70,
    current: 180,
    contributesTo: 290,
    contributedToBy: 290,
  };

  const rowGroups = {
    needs: [],
    neededBy: [],
    contributesTo: [],
    contributedToBy: [],
  };

  allRelations.forEach((r) => {
    rowGroups[r.type].push(r);
  });

  const renderRow = (type) => {
    const nodes = rowGroups[type];
    if (!nodes.length) return null;

    const Icon = typeToComponent[type];
    const totalWidth = nodes.length * boxW + (nodes.length - 1) * marginX;
    const startX =
      type === "needs" || type === "contributesTo"
        ? 60
        : svgWidth - totalWidth - 60;

    return nodes.map((rel, i) => {
      const related = relatedOKRs.find((r) => r.id === rel.id);
      if (!related) return null;

      const x = startX + i * (boxW + marginX);
      const y = rowY[type];

      return (
        <a key={`${type}-${rel.id}`} href={`/objectives/${rel.id}`}>
          <g transform={`translate(${x}, ${y})`}>
            <Icon title={related.title} />
          </g>
        </a>
      );
    });
  };

  return (
    <svg className="svg-graph" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {/* Center node */}
      <g transform={`translate(${(svgWidth - boxW) / 2}, ${rowY.current})`}>
        <CurrentOKRIcon title={data.title} />
      </g>

      {/* Rows */}
      {renderRow("needs")}
      {renderRow("neededBy")}
      {renderRow("contributesTo")}
      {renderRow("contributedToBy")}

      {/* Legend */}
      <foreignObject
        x={svgWidth - 220}
        y={svgHeight - 70}
        width={220}
        height={90}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "6px",
            fontSize: "9px",
            fontFamily: "sans-serif",
          }}
        >
          <strong>Legend</strong>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: "6px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "50%",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "#ffc9c9",
                  marginRight: 6,
                }}
              ></div>
              Needs
            </div>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "50%",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "#b2f2bb",
                  marginRight: 6,
                }}
              ></div>
              Needed By
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "50%",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "#a5d8ff",
                  marginRight: 6,
                }}
              ></div>
              Contributes To
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "50%",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "#ffec99",
                  marginRight: 6,
                }}
              ></div>
              Contributed To By
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
