// Segment, SIMD/FP, and control-register chip rows.
import { SEG_META } from '../../data/registerMeta';
import type { RegisterFile } from '../../types';

const CR_TIPS: Record<string, string> = {
  CR0: 'CR0 — master on/off switches for the CPU: paging enabled, protected mode, write-protect, FPU presence. Set once by the OS at boot.',
  CR2: 'CR2 — when a page fault happens, the CPU stores the bad memory address here so the OS knows what was accessed. 0 when no fault.',
  CR3: 'CR3 — points at the top-level page table (PML4). This is the mapping from virtual addresses to physical RAM for the current process. Swapped on every context switch.',
  CR4: 'CR4 — enables newer CPU features: PAE, SSE/AVX support (OSXSAVE/OSFXSR), security features (SMEP/SMAP). Set by the OS.',
};

export function SegmentChips({ R }: { R: RegisterFile }) {
  return (
    <div className="reg-chips">
      {SEG_META.map((sg) => (
        <span
          className="reg-chip tip"
          data-tip={`${sg.k} — ${sg.n} segment register · value ${R.seg[sg.k]}\n${sg.note}`}
          key={sg.k}
        >
          <b>{sg.k}</b>
          <span className="cv">{R.seg[sg.k]}</span>
        </span>
      ))}
    </div>
  );
}

export function SimdChips({ R }: { R: RegisterFile }) {
  const xmm0Tip = R.simdActive
    ? `XMM0 (128-bit) — low lane holds a float64 this step (e.g. time.Now seconds / printf arg). Value: ${R.xmm0}`
    : 'XMM0 (128-bit) — low lane of YMM0/ZMM0 · float args & SSE results · zero this step';
  return (
    <div className="reg-chips">
      <span className={`reg-chip${R.simdActive ? '' : ' zero'} tip`} data-tip={xmm0Tip}>
        <b>XMM0</b>
        <span className="cv">{R.simdActive ? R.xmm0 : '0…0'}</span>
      </span>
      <span className="reg-chip zero tip" data-tip="XMM1–XMM15 (128-bit, 16 total)">
        <b>XMM1–15</b>
        <span className="cv">0…0</span>
      </span>
      <span
        className="reg-chip zero tip"
        data-tip="YMM0–YMM15 (256-bit AVX) — upper 128 bits extend XMM"
      >
        <b>YMM0–15</b>
        <span className="cv">0…0</span>
      </span>
      <span
        className="reg-chip zero tip"
        data-tip="ZMM0–ZMM31 (512-bit AVX-512) — upper 256 bits extend YMM, 32 total"
      >
        <b>ZMM0–31</b>
        <span className="cv">0…0</span>
      </span>
      <span
        className="reg-chip tip"
        data-tip="MXCSR — SSE control/status (rounding mode, exception masks). 0x1F80 = all exceptions masked, round-to-nearest."
      >
        <b>MXCSR</b>
        <span className="cv">0x1F80</span>
      </span>
    </div>
  );
}

export function ControlChips({ R }: { R: RegisterFile }) {
  return (
    <div className="reg-chips">
      {Object.entries(R.cr).map(([k, v]) => (
        <span
          className="reg-chip tip"
          data-tip={`${CR_TIPS[k]} · value ${v} · privileged (kernel-only)`}
          key={k}
        >
          <b>{k}</b>
          <span className="cv">{v}</span>
        </span>
      ))}
    </div>
  );
}
