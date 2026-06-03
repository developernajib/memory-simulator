// ──────────────────────────────────────────────────────────────────────────────
// Snapshot builder — serializes a step's full memory + register state to plain
// text for the "copy" button. Pure: returns a string, performs no clipboard I/O.
// ──────────────────────────────────────────────────────────────────────────────
import { GPR_META, FLAG_META, SEG_META } from '../data/registerMeta';
import { deriveRegisters } from './registers';
import type { MemoryGroup, Step } from '../types';

export function buildSnapshot(s: Step, idx: number, total: number): string {
  const lines: string[] = [
    `Step ${idx + 1}/${total}: ${s.name}`,
    `Function: ${s.fn}  |  Group: ${s.group}`,
    `Heap: ${s.heapB} B  |  Stack: ${s.stackB} B`,
    `CPU: ${s.cpu}`,
    '',
  ];

  const dumpRegion = (label: string, groups?: MemoryGroup[] | null) => {
    if (!groups || groups.length === 0) return;
    lines.push(`── ${label} ──`);
    groups.forEach((g) => {
      if (g.grp) lines.push(`  [${g.grp}]`);
      (g.rows || []).forEach((r) => {
        lines.push(`  ${r.addr.padEnd(14)}  ${(r.name || '').padEnd(28)}  ${r.val}`);
      });
    });
    lines.push('');
  };

  dumpRegion('STACK', s.stack);
  dumpRegion('HEAP', s.heap);
  dumpRegion(
    'CODE SEGMENT',
    s.code_seg
      ? [
          {
            grp: '',
            rows: s.code_seg.map((f) => ({
              addr: f.addr,
              name: f.name,
              val: f.active ? '▶ active' : '—',
            })),
          },
        ]
      : null,
  );
  dumpRegion('DATA SEGMENT', s.data_seg);

  // ── CPU REGISTERS (x86-64) ──
  const R = deriveRegisters(s, idx);
  lines.push('── CPU REGISTERS (x86-64) ──');
  lines.push(`  RIP (PC) ${R.pc}  → ${R.fn}`);
  lines.push(`  IR       ${R.ir}${R.writes ? `   (writeback → ${R.writes})` : ''}`);
  lines.push(`  RSP      ${R.sp}      RBP ${R.bp}`);
  lines.push('  general-purpose:');
  GPR_META.forEach((m) => {
    lines.push(`    ${m.q.padEnd(4)} ${R.gpr[m.q]}  ${R.writes === m.q ? '◀ written' : ''}`);
  });
  const flagStr = FLAG_META.map((f) => `${f.k}=${R.flags[f.k]}`).join(' ');
  lines.push(`  RFLAGS   ${R.rflags}  [${flagStr}]`);
  lines.push(`  segment  ${SEG_META.map((sg) => `${sg.k}=${R.seg[sg.k]}`).join(' ')}`);
  lines.push(
    `  control  ${Object.entries(R.cr)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')}`,
  );
  lines.push(`  XMM0     ${R.simdActive ? R.xmm0 : '0 (inactive this step)'}  ·  MXCSR=0x1F80`);
  lines.push('');

  return lines.join('\n');
}
