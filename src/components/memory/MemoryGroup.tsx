// A labelled group of memory rows (a stack frame, a heap object, …).
import type { MemoryGroup as Group } from '../../types';
import { MemoryRow } from './MemoryRow';

export function MemoryGroup({ g }: { g: Group }) {
  return (
    <div className="mg">
      <div className={`mg-label ${g.lbl ?? ''}`.trim()}>{g.grp}</div>
      {g.rows.map((r, i) => (
        <MemoryRow r={r} key={`${r.addr}-${i}`} />
      ))}
    </div>
  );
}
