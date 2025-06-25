"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/GanttChart.css";

const BASE_DAY_PX   = 18;   // px per day when zoomUnit = 1
const ZOOM_UNIT     = 0.4;  // 1 ⇢ 100 % (old 40 %)

export default function GanttChart({ tasks }) {
  const router  = useRouter();
  const wrapRef = useRef(null);

  /* zoom: 1 = 100 %  */
  const [zoom, setZoom] = useState(1);

  /* ───────────────── helpers ───────────────── */
  const normalizeDateStr = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const m = String(dateStr).match(/^(\d{1,2}) (\w{3}) (\d{4})$/);
    if (!m) return null;
    const [_, d, monStr, y] = m;
    const mm = {
      Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06",
      Jul:"07", Aug:"08", Sep:"09", Oct:"10", Nov:"11", Dec:"12",
    }[monStr];
    return mm ? `${y}-${mm}-${d.padStart(2,"0")}` : null;
  };
  const formatDMY = (s) =>
    new Date(normalizeDateStr(s)).toLocaleDateString("en-GB");

  /* ─────────── preprocess ─────────── */
  const { valid, invalidCount, minDate, maxDate, totalDays, months } =
    useMemo(() => {
      const valid = tasks.filter(
        (t) => normalizeDateStr(t.start) && normalizeDateStr(t.end)
      );
      const dates = valid.flatMap((t) => [
        new Date(normalizeDateStr(t.start)),
        new Date(normalizeDateStr(t.end)),
      ]);
      const min   = new Date(Math.min(...dates));
      const max   = new Date(Math.max(...dates));
      const total = (max - min) / 86_400_000;
      const getMonths = (a,b) => {
        const out=[]; let cur=new Date(a.getFullYear(),a.getMonth(),1);
        const last=new Date(b.getFullYear(),b.getMonth(),1);
        while (cur<=last){ out.push(new Date(cur)); cur.setMonth(cur.getMonth()+1);}
        return out;
      };
      return {
        valid,
        invalidCount: tasks.length - valid.length,
        minDate: min,
        maxDate: max,
        totalDays: total,
        months: getMonths(min, max),
      };
    }, [tasks]);

  /* ───────── pixels / zoom helpers ───────── */
  const dayW      = BASE_DAY_PX * ZOOM_UNIT * zoom;
  const chartW    = Math.max(totalDays * dayW, 1);
  const dayDiff   = (d1,d2)=>(new Date(d2)-new Date(d1))/86_400_000;
  const dateToPx = (input) => {
    const date = input instanceof Date
      ? input
      : new Date(normalizeDateStr(input));
    return dayDiff(minDate, date) * dayW;
  };

  /* wheel zoom (Ctrl/⌘-wheel) */
  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const d = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(z => Math.max(0.01, z + d));
  };

  /* drag-to-scroll */
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    let down=false,startX=0,scr=0;
    const downH=e=>{down=true;startX=e.pageX;scr=el.scrollLeft;};
    const moveH=e=>{ if(down) el.scrollLeft=scr-(e.pageX-startX); };
    const upH =()=>{down=false;};
    el.addEventListener("pointerdown",downH);
    el.addEventListener("pointermove",moveH);
    window.addEventListener("pointerup",upH);
    return ()=>{ el.removeEventListener("pointerdown",downH);
                 el.removeEventListener("pointermove",moveH);
                 window.removeEventListener("pointerup",upH);};
  },[]);

  /* today line */
  const today = new Date();
  const todayPx = (today>=minDate && today<=maxDate)
    ? dayDiff(minDate,today)*dayW : null;

  console.log(
    "DEBUG months length", months.length,
    "minDate", minDate?.toISOString?.(),
    "maxDate", maxDate?.toISOString?.()
  );

  /* ─────────────── render ─────────────── */
  return (
    <div className="gantt-container">
      {/* Toolbar */}
      <div className="gantt-toolbar">
        <input
          type="range" min="0.25" max="4" step="0.05"
          value={zoom} onChange={e=>setZoom(+e.target.value)}
        />
        <button onClick={()=>setZoom(1)}>Reset</button>
        <span className="zoom-label">{Math.round(zoom*100)} %</span>
      </div>

      {/* Scroll area */}
      <div
        className="gantt-scroll-area" ref={wrapRef}
        onWheel={handleWheel} style={{cursor:"grab"}}
      >
        <div
          style={{
            position:"relative",
            width:chartW,
            height:valid.length*50+60
          }}
        >

          {/* ───── month band & vertical grid ───── */}
          <div className="month-band" style={{ width: chartW }}>
            {months.map((m, i) => {
              const left  = dateToPx(m);
              const right = i + 1 < months.length
                ? dateToPx(months[i + 1])
                : chartW;
              const width = right - left;
              console.log("MONTH JSX", i, m.toISOString(), { left, width });  // 👈 add this

              return (
                <React.Fragment key={i}>
                  {/* label cell */}
                  <div
                    className="month-cell"
                    style={{ left, width }}
                  >
                    {m.toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  {/* grid line */}
                  <div className="vertical-line" style={{ left }} />
                </React.Fragment>
              );
            })}
          </div>
          {todayPx!==null && <div className="today-line" style={{left:todayPx}} />}

          {/* tasks */}
          {valid.map((t,i)=>{
            const left = dateToPx(t.start);
            const width= dateToPx(t.end)-left;
            const narrow= width<60;
            return(
              <div
                key={t.id} className="task-bar"
                style={{top:i*50+40,left,width}}
                onClick={()=>router.push(`/objectives/${t.id}`)}
                role="link" tabIndex={0}
                onKeyDown={(e)=>
                  ["Enter"," "].includes(e.key)&&router.push(`/objectives/${t.id}`)}
              >
                <div className="task-dates">
                  <span>{formatDMY(t.start)}</span>
                  <span>{formatDMY(t.end)}</span>
                </div>
                {!narrow && <div className="task-text">{t.name}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="invalid-count">
        Objectives with invalid or missing dates: {invalidCount}
      </div>
    </div>
  );
}
