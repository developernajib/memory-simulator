// ──────────────────────────────────────────────────────────────────────────────
// x86-64 register-file derivation — pure functions, no DOM access.
//
// Hand-ported (with full TypeScript types) from the original memory_simulator.html.
// The simulation is Go-runtime themed but executes on an x86-64 core; we derive a
// plausible, self-consistent register file for each step from the data the step
// already carries (active .text function -> RIP, stackB -> RSP, operations -> RAX…).
// Any step may override individual registers via its optional `regs` field.
// ──────────────────────────────────────────────────────────────────────────────
import { GPR_META } from '../data/registerMeta';
import { S } from '../data/steps';
import type { RegisterFile, Step } from '../types';

// hex helpers for 64-bit values
export const hex64 = (v: bigint | number): string =>
    '0x' + BigInt.asUintN(64, BigInt(v)).toString(16).toUpperCase().padStart(16, '0');
export const low32 = (h: string): string => '0x' + h.slice(-8);
export const low16 = (h: string): string => '0x' + h.slice(-4);
export const low8 = (h: string): string => '0x' + h.slice(-2);

/** Pull a hex address out of a step's first active code_seg entry -> RIP. */
function activeRIP(s: Step): string {
    const fn = (s.code_seg || []).find((f) => f.active);
    return fn ? fn.addr : '0x0401000';
}
function activeFnName(s: Step): string {
    const fn = (s.code_seg || []).find((f) => f.active);
    return fn ? fn.name : 'main.main';
}

// Stack grows downward from 0xC000012000.
const STACK_TOP = 0xc000012000n;

/** Collect goroutine-stack addresses (0xC0000…) referenced by a step. */
function stackAddrs(s: Step): bigint[] {
    return (s.stack || [])
        .flatMap((g) => g.rows || [])
        .map((r) => r.addr)
        .filter((a) => /^0xC0000/.test(a || ''))
        .map((a) => {
            try {
                return BigInt(a);
            } catch {
                return null;
            }
        })
        .filter((a): a is bigint => a !== null);
}

/** Compute SP from the deepest (lowest) stack-frame address, else top - stackB. */
function computeSP(s: Step): bigint {
    const addrs = stackAddrs(s);
    if (addrs.length) return addrs.reduce((m, a) => (a < m ? a : m), STACK_TOP);
    return STACK_TOP - BigInt(s.stackB || 0);
}

/** Best-effort decode of the instruction in flight, from the cpu narration. */
function decodeInstr(s: Step): string {
    const cpu = s.cpu || '';
    const m = cpu.match(
        /\b(CALL|RET|MOV[QLWB]?|SUBQ|ADDQ|LEAQ|PUSHQ|POPQ|CMPQ|JMP|JNE|JE|XORQ|SYSCALL|LOCK|XCHGQ|CMPXCHG\w*)\b[^·]*/,
    );
    if (m) return m[0].trim();
    if (/SYSCALL|clock_gettime/.test(cpu)) return 'SYSCALL';
    if (/append|growslice/.test(s.name)) return 'CALL runtime.growslice';
    if (/Lock\(\)/.test(s.name)) return 'LOCK CMPXCHGL';
    if (/mallocgc|escape/.test(s.name)) return 'CALL runtime.mallocgc';
    if (/return|defer/.test(s.name)) return 'RET';
    return 'MOVQ (next op)';
}

/**
 * Build the full register file for a step.
 * @param withPrev when true, also derives the previous step (for change highlights).
 */
export function deriveRegisters(s: Step, idx: number, withPrev = true): RegisterFile {
    const rip = activeRIP(s);
    const sp = computeSP(s);
    const spHex = hex64(sp);

    // RBP: frame base = the highest stack address the step shows (top of its frame).
    let bp = spHex;
    if (s.stack && s.stack.length) {
        const addrs = stackAddrs(s);
        bp = addrs.length ? hex64(addrs.reduce((m, a) => (a > m ? a : m))) : spHex;
    }

    // Default GPR values: zero, then fill the meaningful ones.
    const g: Record<string, string> = {};
    GPR_META.forEach((r) => (g[r.q] = '0x0000000000000000'));
    g.RSP = spHex;
    g.RBP = bp;
    g.R14 = '0xC000044000'; // Go ABI keeps *g (current goroutine) in R14
    g.RDI = '0xC000070000'; // receiver / 1st arg often the TaskManager pointer

    // Step-flavoured fills so the register file visibly changes step to step.
    const nm = s.name || '';
    if (/AddTask|MarkComplete|CompleteTask|DeleteTask/.test(nm)) {
        g.RDI = '0xC000070000';
        g.RSI = '0xC000051000';
    }
    if (/mallocgc|escape|Task\{|growslice|hmap|FileStorage|TaskManager/.test(nm)) {
        g.RAX = '0xC000090000';
        g.RCX = '0x0000000000000058';
    }
    if (/nextID\+\+|increment/.test(nm)) g.RAX = '0x0000000000000001';
    if (/Lock\(\)|mutex/.test(nm)) {
        g.RAX = '0x0000000000000001';
        g.RCX = '0x0000000000000000';
    }
    if (/time\.Now|clock_gettime|SYSCALL/.test(nm + (s.cpu || ''))) {
        g.RAX = '0x00000000000000E4'; // clock_gettime: nr=228(0xE4)
        g.RDI = '0x0000000000000001'; // CLOCK_MONOTONIC
    }
    if (/flag\.Parse|os\.Args/.test(nm)) {
        g.RSI = '0x0000000C000051000';
        g.RCX = '0x0000000000000002';
    }
    if (/return|version/.test(nm)) g.RAX = '0x0000000000000000';

    // RFLAGS bits — set ZF on comparisons / empty checks, IF normally on.
    const flags: Record<string, number> = {
        CF: 0,
        PF: 1,
        AF: 0,
        ZF: 0,
        SF: 0,
        OF: 0,
        DF: 0,
        IF: 1,
        TF: 0,
    };
    if (/== ""|TrimSpace|validation|version|list|interactive/.test(nm)) flags.ZF = 1;
    if (/GC Phase 1|stopTheWorld|STW/.test(nm)) flags.IF = 0; // interrupts off during STW
    const rflags =
        (flags.IF ? 0x200 : 0) |
        (flags.ZF ? 0x40 : 0) |
        (flags.PF ? 0x4 : 0) |
        (flags.SF ? 0x80 : 0) |
        (flags.CF ? 0x1 : 0) |
        (flags.OF ? 0x800 : 0) |
        0x2;

    // Segment registers (user-mode amd64 long mode).
    const seg: Record<string, string> = {
        CS: '0x0033',
        DS: '0x0000',
        ES: '0x0000',
        FS: '0x0000',
        GS: '0x0000',
        SS: '0x002B',
    };

    // Control registers — broadly constant in user mode, shown for completeness.
    const cr: Record<string, string> = {
        CR0: '0x0000000080050033', // PG|WP|NE|ET|MP|PE
        CR2: '0x0000000000000000',
        CR3: '0x000000010A2C4000', // page directory base (illustrative)
        CR4: '0x00000000003406F0', // OSXSAVE|OSFXSR|PAE|…
    };

    // SIMD: XMM0 carries float args / time results on relevant steps.
    const simdActive = /time\.Now|float|XMM|Printf|MarshalIndent/.test(nm + (s.cpu || ''));
    const xmm0 = simdActive ? '0x0000000000000000 : 0x3FF0000000000000' : null; // hi | lo (double 1.0)

    // Decode the destination register the current instruction writes back to.
    const ir = decodeInstr(s);
    let writes: string | null = null;
    if (/mallocgc|growslice|hmap|escape|Task\{|FileStorage|TaskManager/.test(nm)) writes = 'RAX';
    else if (/nextID\+\+|increment|ADDQ/.test(nm + ir)) writes = 'RAX';
    else if (/Lock\(\)|CMPXCHG|XCHG/.test(nm + ir)) writes = 'RAX';
    else if (/SYSCALL|clock_gettime|time\.Now/.test(nm + ir)) writes = 'RAX';
    else if (/^MOV|LEAQ/.test(ir)) writes = 'RDI';
    else if (/^SUBQ|CALL|PUSHQ/.test(ir)) writes = 'RSP';
    else if (/^POPQ|^RET/.test(ir)) writes = 'RSP';

    // Merge per-step explicit overrides.
    const ov = s.regs || {};
    if (ov.gpr) Object.assign(g, ov.gpr);
    if (ov.flags) Object.assign(flags, ov.flags);
    if (ov.writes) writes = ov.writes;

    return {
        pc: rip,
        fn: activeFnName(s),
        ir,
        writes,
        sp: spHex,
        bp,
        gpr: g,
        rflags: hex64(rflags),
        flags,
        seg,
        cr,
        simdActive,
        xmm0,
        changed: withPrev && idx > 0 ? deriveRegisters(S[idx - 1], idx - 1, false) : null,
    };
}

/** Count how many derived registers changed vs the previous step. */
export function countRegChanges(R: RegisterFile): number {
    const p = R.changed;
    if (!p) return 0;
    let n = 0;
    for (const k in R.gpr) if (R.gpr[k] !== (p.gpr ? p.gpr[k] : undefined)) n++;
    if (R.pc !== p.pc) n++;
    if (R.ir !== p.ir) n++;
    if (R.rflags !== p.rflags) n++;
    return n;
}
