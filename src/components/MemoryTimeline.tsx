// Heap/stack sparkline above the memory panel. Click (or drag) to seek to a step;
// hover shows that step's heap/stack figures via the global tooltip (data-tip).
import { useRef, useState } from 'react';
import { S } from '../data/steps';
import { useSim } from '../hooks/SimulatorContext';

const H = 48;
const PAD = 4;

export function MemoryTimeline() {
  const { cur, go } = useSim();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverTip, setHoverTip] = useState<string | undefined>();

  // Use a fixed logical width; the SVG scales to its container via viewBox.
  const W = 360;
  const heapVals = S.map((s) => s.heapB || 0);
  const stackVals = S.map((s) => s.stackB || 0);
  const maxH = Math.max(...heapVals, 1);
  const maxS = Math.max(...stackVals, 1);
  const n = S.length;
  const px = (i: number) => +((i / (n - 1)) * W).toFixed(2);
  const pyH = (v: number) => +(H - PAD - (v / maxH) * (H - PAD * 2)).toFixed(2);
  const pyS = (v: number) => +(H - PAD - (v / maxS) * (H - PAD * 2)).toFixed(2);

  const heapLine = heapVals.map((v, i) => `${px(i)},${pyH(v)}`).join(' ');
  const stackLine = stackVals.map((v, i) => `${px(i)},${pyS(v)}`).join(' ');
  const heapArea = `0,${H} ${heapLine} ${W},${H}`;
  const stackArea = `0,${H} ${stackLine} ${W},${H}`;
  const cx = px(cur);
  const s = S[cur];
  const hStr = s.heapB >= 1024 ? `${(s.heapB / 1024).toFixed(1)} KB` : `${s.heapB} B`;

  const indexFromEvent = (e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    return Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))));
  };

  return (
    <div className="mem-timeline" id="mem-timeline">
      <div className="tl-header">
        <span>
          <span style={{ color: 'var(--red)' }}>▬</span> heap &nbsp;
          <span style={{ color: 'var(--yellow)' }}>▬</span> stack
        </span>
        <span style={{ color: 'var(--t2)' }}>
          {hStr} &nbsp;·&nbsp; {s.stackB} B stack
        </span>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: 'block', cursor: 'pointer', overflow: 'visible' }}
        className={hoverTip ? 'tip' : undefined}
        data-tip={hoverTip}
        onClick={(e) => go(indexFromEvent(e))}
        onMouseMove={(e) => {
          const idx = indexFromEvent(e);
          const step = S[idx];
          setHoverTip(
            `Step ${idx + 1}: ${step.name} · heap ${step.heapB}B · stack ${step.stackB}B`,
          );
        }}
        onMouseLeave={() => setHoverTip(undefined)}
      >
        <defs>
          <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity=".25" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity=".18" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={heapArea} fill="url(#gH)" />
        <polygon points={stackArea} fill="url(#gS)" />
        <polyline
          points={heapLine}
          fill="none"
          stroke="#f87171"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={stackLine}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {heapVals.map((v, i) => (
          <circle
            key={`h${i}`}
            cx={px(i)}
            cy={pyH(v)}
            r={i === cur ? 3.5 : 2}
            fill="#f87171"
            opacity={i === cur ? 1 : 0.5}
          />
        ))}
        {stackVals.map((v, i) => (
          <circle
            key={`s${i}`}
            cx={px(i)}
            cy={pyS(v)}
            r={i === cur ? 3.5 : 2}
            fill="#fbbf24"
            opacity={i === cur ? 1 : 0.5}
          />
        ))}
        <line
          x1={cx}
          y1="0"
          x2={cx}
          y2={H}
          stroke="#4ade80"
          strokeWidth="1"
          strokeDasharray="3,2"
          opacity=".6"
        />
        <circle
          cx={cx}
          cy={pyH(heapVals[cur])}
          r="6"
          fill="none"
          stroke="#f87171"
          strokeWidth="1"
          opacity=".5"
        />
      </svg>
    </div>
  );
}
