// Top bar: project identity, runtime badges, and live heap/stack/goroutine stats.
import { S } from '../data/steps';
import { useSim } from '../hooks/SimulatorContext';

function fmtBytes(b: number): string {
  return b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;
}

export function TopBar() {
  const { cur } = useSim();
  const s = S[cur];
  const goroutines = s.goroutines ?? [{ id: 'G1', state: 'run' as const, fn: 'main()', stack: '' }];

  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-pulse" />
        TaskMgr · Memory Simulator
      </div>
      <div
        className="tbadge tip tip-below"
        data-tip="Go 1.21: register-based ABI (≥1.17), arena allocator, improved GC pauses, PGO support"
      >
        Go 1.21
      </div>
      <div
        className="tbadge tip tip-below"
        data-tip="amd64: 64-bit x86. Registers: AX/BX/CX/DX/SI/DI/SP/BP + R8-R15. SP = stack pointer (grows down)."
      >
        amd64
      </div>
      <div className="tsep" />
      <div
        className="tb-meta tip tip-below"
        data-tip="Total bytes currently live on the GC-managed heap across all steps shown"
      >
        heap: <b id="tb-heap">{fmtBytes(s.heapB)}</b>
      </div>
      <div
        className="tb-meta tip tip-below"
        data-tip="Total bytes in goroutine stacks, freed automatically on function return"
      >
        stack: <b id="tb-stack">{s.stackB} B</b>
      </div>
      <div
        className="tb-meta tip tip-below"
        data-tip="Active goroutines (G structs). Each starts with an 8 KB stack that grows as needed."
      >
        goroutines: <b id="tb-g">{goroutines.length}</b>
      </div>
      <div className="tright" id="goroutines-row">
        {goroutines.map((g) => {
          const cls = g.state === 'run' ? 'gb-run' : g.state === 'wait' ? 'gb-wait' : 'gb-gc';
          return (
            <span className={`gb ${cls}`} key={g.id}>
              <span className="gledge" />
              {g.id}
            </span>
          );
        })}
      </div>
    </div>
  );
}
