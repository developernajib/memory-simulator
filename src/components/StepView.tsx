// Center "Step View" tab: current operation, CPU instruction, and memory explanation.
import { S } from '../data/steps';
import { fmtCPU } from '../lib/format';
import { useSim } from '../hooks/SimulatorContext';
import { Html } from './Html';

const REGION_LABELS: Record<string, string> = {
  stack: 'Stack — local vars, frames, LIFO, free on return',
  heap: 'Heap — GC managed, escaping data, long-lived',
  goroutine: 'Goroutines — new G descriptor + 8KB stack on heap',
  gc: 'GC — mark & sweep, never touches stack',
  mutex: 'Mutex — atomic ops on heap-resident sync.RWMutex',
  interface: 'Interface — itab (type) + data pointer, 16 bytes',
};

export function StepView() {
  const { cur, total } = useSim();
  const s = S[cur];

  const allRows = [...(s.stack ?? []), ...(s.heap ?? [])].flatMap((g) => g.rows ?? []);
  const newCnt = allRows.filter((r) => r.tag === 'new').length;
  const updCnt = allRows.filter((r) => r.tag === 'upd').length;
  const freeCnt = allRows.filter((r) => r.tag === 'free').length;

  return (
    <div className="step-view">
      <div className="sv-section">
        <div className="sv-hdr">
          <span className="sv-hdr-label">
            Step {cur + 1} / {total} &nbsp;·&nbsp; {s.name}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {newCnt > 0 && (
              <span
                className="badge-tag bt-new tip tip-below"
                data-tip={`${newCnt} new memory cell(s) allocated this step.\nGreen highlight in the memory panel.`}
              >
                +{newCnt} alloc
              </span>
            )}
            {updCnt > 0 && (
              <span
                className="badge-tag bt-upd tip tip-below"
                data-tip={`${updCnt} existing cell(s) written to this step.\nYellow highlight in the memory panel.`}
              >
                {updCnt} updated
              </span>
            )}
            {freeCnt > 0 && (
              <span
                className="badge-tag bt-free tip tip-below"
                data-tip={`${freeCnt} cell(s) freed this step.\nRed highlight — GC sweep or frame pop.`}
              >
                {freeCnt} freed
              </span>
            )}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--blue)' }}>{s.fn}</span>
          </span>
        </div>
        <div className="sv-body">
          <Html className="cblock" html={s.code} />
        </div>
        <div className="cpu-row">
          <span
            className="cpu-tag tip"
            data-tip={
              'M0 = OS thread executing this goroutine.\nGo uses M:N threading — M OS threads, N goroutines.\nM is bound to one P (logical processor) at a time.'
            }
          >
            CPU · M0
          </span>
          <Html className="asm-block" style={{ flex: 1 }} html={fmtCPU(s.cpu)} />
        </div>
      </div>

      <div className="sv-section">
        <div className="sv-hdr">
          <span className="sv-hdr-label">What's happening in memory</span>
        </div>
        <div className="sv-body">
          <Html className="desc-text" html={s.desc} />
        </div>
      </div>

      <div className="sv-section">
        <div className="sv-hdr">
          <span className="sv-hdr-label">Memory regions involved</span>
        </div>
        <div className="sv-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(s.tags ?? []).map((t) => (
            <span className={`si-tag t-${t}`} style={{ fontSize: 11, padding: '3px 10px' }} key={t}>
              {REGION_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
