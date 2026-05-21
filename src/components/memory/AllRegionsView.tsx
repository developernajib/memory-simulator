// "All Regions" view: beginner intro, then STACK / HEAP / CODE / DATA regions,
// followed by the full CPU register panel. Mirrors the original renderAllRegions().
import { ALL_INTRO_HTML } from '../../data/introHtml';
import { S } from '../../data/steps';
import { useSim } from '../../hooks/SimulatorContext';
import type { MemoryGroup } from '../../types';
import { MemoryIntro } from '../MemoryIntro';
import { RegisterPanel } from '../registers/RegisterPanel';
import { MemoryRegion } from './MemoryRegion';

export function AllRegionsView() {
  const { cur } = useSim();
  const s = S[cur];

  const codeGroups: MemoryGroup[] | null =
    s.code_seg && s.code_seg.length > 0
      ? [
          {
            grp: 'functions (.text section)',
            lbl: '',
            rows: s.code_seg.map((f) => ({
              addr: f.addr,
              name: f.name,
              val: f.active ? '▶ active' : '—',
              cls: (f.active ? 'bt' : 'nil') as 'bt' | 'nil',
            })),
          },
        ]
      : null;

  return (
    <>
      <MemoryIntro
        introKey="all"
        title="New here? How to read this memory view"
        bodyHtml={ALL_INTRO_HTML}
      />
      <MemoryRegion
        regionKey="stack"
        titleCls="mr-stack-hdr"
        title="STACK"
        badge="LIFO · ~1ns alloc"
        sizeStr="0xC000010000–0xC000012000"
        groups={s.stack && s.stack.length > 0 ? s.stack : null}
        emptyMsg="empty — no active frames"
      />
      <MemoryRegion
        regionKey="heap"
        titleCls="mr-heap-hdr"
        title="HEAP"
        badge="GC · ~100ns alloc"
        sizeStr="0xC000040000–…"
        groups={s.heap && s.heap.length > 0 ? s.heap : null}
        emptyMsg="no heap allocations this step"
      />
      <MemoryRegion
        regionKey="code"
        titleCls="mr-code-hdr"
        title="CODE SEGMENT"
        badge=".text · read-only"
        sizeStr="0x0401000–0x0480000"
        groups={codeGroups}
        emptyMsg="no functions referenced"
      />
      <MemoryRegion
        regionKey="data"
        titleCls="mr-data-hdr"
        title="DATA SEGMENT"
        badge=".rodata/.data/.bss"
        sizeStr="0x0500000–0x0520000"
        groups={s.data_seg && s.data_seg.length > 0 ? s.data_seg : null}
        emptyMsg="no data segment entries"
      />
      <RegisterPanel />
    </>
  );
}
