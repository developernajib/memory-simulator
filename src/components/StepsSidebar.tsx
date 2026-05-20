// Left sidebar: searchable, grouped list of execution steps + navigation controls.
import { useMemo, useState } from 'react';
import { S } from '../data/steps';
import { useSim } from '../hooks/SimulatorContext';
import type { RegionTag } from '../types';

const SI_TAG_TIPS: Record<string, string> = {
  stack: 'Stack frame activity',
  heap: 'Heap allocation via mallocgc',
  goroutine: 'New goroutine spawned',
  gc: 'GC phase active',
  mutex: 'Mutex lock/unlock',
  interface: 'Interface dispatch (itab)',
};

const SPEEDS = [
  { value: 5600, label: '.5×' },
  { value: 2800, label: '1×' },
  { value: 1400, label: '2×' },
  { value: 700, label: '4×' },
];

interface StepsSidebarProps {
  onOpenHelp: () => void;
}

export function StepsSidebar({ onOpenHelp }: StepsSidebarProps) {
  const { cur, total, go, nav, autoPlay, toggleAutoPlay, speed, setSpeed } = useSim();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      S.map((s) =>
        `${s.name} ${s.fn} ${s.group} ${(s.tags ?? []).join(' ')}`.toLowerCase().includes(term),
      ),
    [term],
  );

  // Build the grouped rows, hiding group labels with no visible children.
  const rows: React.ReactNode[] = [];
  let lastGroup = '';
  S.forEach((s, i) => {
    const visible = term.length === 0 || matches[i];
    if (s.group !== lastGroup) {
      lastGroup = s.group;
      const groupHasVisible = S.some((g, j) => g.group === s.group && (term.length === 0 || matches[j]));
      rows.push(
        <div className="grp-label" key={`grp-${s.group}-${i}`} hidden={!groupHasVisible}>
          {s.group}
        </div>,
      );
    }
    rows.push(
      <div
        className={`si${i === cur ? ' active' : ''}`}
        id={`si${i}`}
        key={i}
        hidden={!visible}
        onClick={() => go(i)}
      >
        <div className="si-num">{String(i + 1).padStart(2, '0')}</div>
        <div className="si-body">
          <div className="si-name">{s.name}</div>
          <div className="si-fn">{s.fn}</div>
          <div className="si-tags">
            {(s.tags ?? []).map((t: RegionTag) => (
              <span className={`si-tag t-${t} tip tip-below`} data-tip={SI_TAG_TIPS[t] ?? t} key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>,
    );
  });

  return (
    <div className="steps-panel">
      <div className="sp-hdr" style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <div className="sp-title">Execution Steps</div>
          <div className="sp-subtitle">CLI Task Manager</div>
        </div>
        <button
          className="btn tip"
          style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: '11px' }}
          onClick={onOpenHelp}
          data-tip="Keyboard shortcuts (?)"
        >
          ?
        </button>
      </div>
      <div className="sp-search">
        <input
          id="step-search"
          type="text"
          placeholder="filter steps…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="sp-list" id="sp-list">
        {rows}
      </div>
      <div className="sp-nav">
        <button className="btn" id="prev-btn" disabled={cur === 0} onClick={() => nav(-1)}>
          ← prev
        </button>
        <div className="sc" id="sc">
          {cur + 1}/{total}
        </div>
        <button className="btn" id="next-btn" disabled={cur === total - 1} onClick={() => nav(1)}>
          next →
        </button>
        <button
          className={`btn tip tip-below${autoPlay ? ' btn-g' : ''}`}
          id="auto-btn"
          onClick={toggleAutoPlay}
          data-tip="Auto-play: advances steps automatically. Use the speed selector to control pace."
        >
          {autoPlay ? '⏸' : '▶'}
        </button>
        <select
          className="speed-sel tip"
          id="speed-sel"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
          data-tip="Auto-play speed"
        >
          {SPEEDS.map((sp) => (
            <option value={sp.value} key={sp.value}>
              {sp.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
