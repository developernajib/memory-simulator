// "Virtual Map" tab: the process virtual address space, top (kernel) to bottom (null).
import { S } from '../../data/steps';
import { useSim } from '../../hooks/SimulatorContext';

interface Segment {
  label: string;
  addr: string;
  color: string;
  bg: string;
  h: number;
  note: string;
}

export function VirtualMapView() {
  const { cur } = useSim();
  const s = S[cur];
  const hStr = s.heapB >= 1024 ? `${(s.heapB / 1024).toFixed(1)} KB` : `${s.heapB} B`;

  const segments: Segment[] = [
    {
      label: 'KERNEL SPACE',
      addr: '0xFFFF800000000000',
      color: 'var(--t4)',
      bg: 'rgba(55,65,81,.25)',
      h: 38,
      note: 'inaccessible to user code — any access is a segfault',
    },
    {
      label: 'GOROUTINE STACKS',
      addr: '0xC000100000+',
      color: 'var(--red)',
      bg: 'rgba(248,113,113,.08)',
      h: 52,
      note: 'G1–G4 stacks (each starts 8 KB, lives on heap, can grow by copying)',
    },
    {
      label: 'HEAP',
      addr: '0xC000040000+',
      color: 'var(--red)',
      bg: 'rgba(248,113,113,.13)',
      h: 80,
      note: `GC managed · mallocgc · mspan free lists · ${hStr} used this step`,
    },
    {
      label: 'BSS (.bss)',
      addr: '0x0510000',
      color: 'var(--cyan)',
      bg: 'rgba(34,211,238,.08)',
      h: 32,
      note: 'zero-init globals: Priority iota consts, MaxWorkers, os.Args header',
    },
    {
      label: 'DATA (.data)',
      addr: '0x0515000',
      color: 'var(--cyan)',
      bg: 'rgba(34,211,238,.06)',
      h: 28,
      note: 'initialized globals: itab tables, type descriptors, gcController, mheap_',
    },
    {
      label: 'RODATA (.rodata)',
      addr: '0x0500000',
      color: 'var(--yellow)',
      bg: 'rgba(251,191,36,.08)',
      h: 32,
      note: 'read-only: string literals ("tasks.json", "1.0.0"), const values, type info',
    },
    {
      label: 'TEXT (.text)',
      addr: '0x0401000',
      color: 'var(--purple)',
      bg: 'rgba(167,139,250,.08)',
      h: 48,
      note: 'machine code: all compiled functions + runtime (mallocgc, newproc, GC…)',
    },
    {
      label: 'NULL (unmapped)',
      addr: '0x00000000',
      color: 'var(--t4)',
      bg: 'rgba(255,255,255,.02)',
      h: 24,
      note: 'any read/write → SIGSEGV · nil pointer dereference caught here',
    },
  ];

  return (
    <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--t2)',
          marginBottom: 10,
          lineHeight: 1.6,
        }}
      >
        Go process virtual address space · amd64 · step {cur + 1}
        <br />
        <span style={{ fontSize: 10, color: 'var(--t3)' }}>
          Addresses illustrative — layout varies per run (ASLR)
        </span>
      </div>
      {segments.map((seg) => (
        <div
          key={seg.label}
          style={{
            marginBottom: 3,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,.05)',
            background: seg.bg,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              gap: 10,
              minHeight: seg.h,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--t3)',
                minWidth: 96,
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {seg.addr}
            </div>
            <div
              style={{
                width: 3,
                alignSelf: 'stretch',
                background: seg.color,
                borderRadius: 2,
                flexShrink: 0,
                minHeight: 14,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: seg.color,
                }}
              >
                {seg.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--t3)',
                  marginTop: 2,
                  whiteSpace: 'normal',
                  lineHeight: 1.4,
                }}
              >
                {seg.note}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 14,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--t3)',
          lineHeight: 1.9,
        }}
      >
        <div style={{ color: 'var(--t2)', fontWeight: 500, marginBottom: 4, fontSize: 11 }}>
          This step at a glance:
        </div>
        <div>
          <span style={{ color: 'var(--yellow)' }}>Stack</span> · ~1ns alloc · freed instantly on
          return · no GC · {s.stackB} B now
        </div>
        <div>
          <span style={{ color: 'var(--red)' }}>Heap &nbsp;</span> · ~100–200ns alloc · GC marks and
          sweeps · survives frames · {hStr} now
        </div>
        <div>
          <span style={{ color: 'var(--purple)' }}>Text &nbsp;</span> · read-only after load ·
          shared between OS processes · no runtime cost
        </div>
        <div>
          <span style={{ color: 'var(--cyan)' }}>Data &nbsp;</span> · loaded from binary ·
          process-lifetime · no GC
        </div>
        <div style={{ marginTop: 8, color: 'var(--t2)' }}>
          Goroutine stacks start at <span style={{ color: 'var(--orange)' }}>8 KB</span> and grow by{' '}
          <span style={{ color: 'var(--orange)' }}>doubling (copystack)</span> if deeper call chains
          are needed.
        </div>
        <div>
          They live on the <span style={{ color: 'var(--red)' }}>heap</span>, NOT the OS thread
          stack. This allows millions of goroutines with minimal overhead.
        </div>
      </div>
    </div>
  );
}
