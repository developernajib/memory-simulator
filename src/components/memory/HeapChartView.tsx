// "Heap Map" tab: a stacked usage bar broken into runtime / tasks / strings /
// channels / free, plus the GC trigger rule. Mirrors the original renderHeapChart().
import { S } from '../../data/steps';
import { useSim } from '../../hooks/SimulatorContext';

interface SegmentBarProps {
  val: number;
  label: string;
  color: string;
  total: number;
}

function SegmentBar({ val, label, color, total }: SegmentBarProps) {
  if (val <= 0) return null;
  const pct = ((val / total) * 100).toFixed(1);
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--t3)',
          marginBottom: 3,
        }}
      >
        <span style={{ color }}>{label}</span>
        <span>
          {val.toLocaleString()} B ({pct}%)
        </span>
      </div>
      <div style={{ height: 5, background: 'var(--b2)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 3,
            transition: 'width .4s',
          }}
        />
      </div>
    </div>
  );
}

export function HeapChartView() {
  const { cur } = useSim();
  const s = S[cur];
  const total = s.heapB || 8192;
  const rows = (s.heap ?? []).flatMap((g) => g.rows);
  const taskB =
    rows.filter((r) => r.name?.includes('Task') && !r.name.includes('Manager')).length * 120;
  const strB = rows.filter((r) => r.cls === 'str').length * 24;
  const rtB = 8192; // G1 stack + descriptors always
  const chanB = rows.filter((r) => r.name?.includes('chan')).length * 80;
  const used = Math.min(total, rtB + taskB + strB + chanB);
  const freeB = Math.max(0, total - used);
  const pct = (v: number) => `${((v / total) * 100).toFixed(1)}%`;

  return (
    <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
      <div
        style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t2)', marginBottom: 12 }}
      >
        Heap usage — step {cur + 1} · total: {total.toLocaleString()} B
      </div>
      <div
        style={{
          height: 16,
          background: 'var(--b2)',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          marginBottom: 16,
        }}
      >
        <div
          style={{ width: pct(rtB), background: 'var(--purple)', transition: 'width .4s' }}
          title="Runtime"
        />
        <div
          style={{ width: pct(taskB), background: 'var(--red)', transition: 'width .4s' }}
          title="Task data"
        />
        <div
          style={{ width: pct(strB), background: 'var(--yellow)', transition: 'width .4s' }}
          title="Strings"
        />
        <div
          style={{ width: pct(chanB), background: 'var(--cyan)', transition: 'width .4s' }}
          title="Channels"
        />
        <div style={{ flex: 1, background: 'var(--b3)' }} title="Free" />
      </div>
      <SegmentBar
        val={rtB}
        label="Runtime (G descriptors, stacks)"
        color="var(--purple)"
        total={total}
      />
      <SegmentBar
        val={taskB}
        label="Task structs + backing arrays"
        color="var(--red)"
        total={total}
      />
      <SegmentBar val={strB} label="String allocations" color="var(--yellow)" total={total} />
      <SegmentBar val={chanB} label="Channel buffers" color="var(--cyan)" total={total} />
      <SegmentBar val={freeB} label="Free / available" color="var(--t4)" total={total} />
      <div
        style={{
          marginTop: 16,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--t3)',
          lineHeight: 1.8,
        }}
      >
        <div style={{ color: 'var(--t2)', fontWeight: 500, marginBottom: 4 }}>GC trigger rule:</div>
        heapAlloc ≥ heapGoal → GC starts
        <br />
        heapGoal = liveAfterGC × (1 + gcPercent/100)
        <br />
        GOGC=100 (default): heap may double before GC
        <br />
        <br />
        <div style={{ color: 'var(--t2)', fontWeight: 500, marginBottom: 4 }}>Stack cost:</div>
        {s.stackB} B used · free instantly on return · no GC
      </div>
    </div>
  );
}
