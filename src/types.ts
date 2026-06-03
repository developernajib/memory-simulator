// ──────────────────────────────────────────────────────────────────────────────
// Domain types for the memory simulator.
//
// These mirror the shape of the verbatim dataset extracted from the original
// memory_simulator.html. The data is authored as plain object literals, so the
// optional fields below reflect that not every step populates every region.
// ──────────────────────────────────────────────────────────────────────────────

/** Visual classification of a memory cell's value (drives its colour). */
export type ValueClass = 'ptr' | 'str' | 'bt' | 'bf' | 'fn' | 'nil' | 'stale' | '';

/** Lifecycle tag highlighting how a row changed this step. */
export type RowTag = 'new' | 'upd' | 'free' | '';

/** A single memory cell: address, label, and value. */
export interface MemoryRow {
    addr: string;
    name: string;
    val: string;
    cls?: ValueClass;
    tag?: RowTag;
}

/** A labelled group of memory rows within a region (stack frame, heap object…). */
export interface MemoryGroup {
    grp: string;
    /** CSS label modifier: 'frame-lbl' | 'heap-lbl' | 'freed-lbl' … */
    lbl?: string;
    rows: MemoryRow[];
}

/** A function entry in the .text / code segment. */
export interface CodeSegmentEntry {
    addr: string;
    name: string;
    active: boolean;
}

/** Goroutine scheduler state for the step. */
export interface Goroutine {
    id: string;
    state: 'run' | 'wait' | 'gc';
    fn: string;
    stack: string;
}

/** Memory regions a step touches (drives the sidebar tag chips). */
export type RegionTag = 'stack' | 'heap' | 'goroutine' | 'gc' | 'mutex' | 'interface';

/** One step of the simulated program execution. */
export interface Step {
    name: string;
    fn: string;
    group: string;
    tags?: RegionTag[];
    /** 1-based source lines to highlight in the code tab. */
    lines?: number[];
    /** Pre-highlighted HTML for the step-view code block. */
    code: string;
    /** Pre-highlighted HTML describing what happens in memory. */
    desc: string;
    /** Human-readable CPU / assembly narration. */
    cpu: string;
    goroutines?: Goroutine[];
    stack?: MemoryGroup[];
    heap?: MemoryGroup[];
    code_seg?: CodeSegmentEntry[];
    data_seg?: MemoryGroup[];
    /** Live heap bytes at this step. */
    heapB: number;
    /** Stack bytes in use at this step. */
    stackB: number;
    /** Optional per-step register overrides. */
    regs?: {
        gpr?: Record<string, string>;
        flags?: Record<string, number>;
        writes?: string;
    };
}

/** Static metadata for one general-purpose register (64/32/16/8-bit views). */
export interface GprMeta {
    q: string;
    d: string;
    w: string;
    b: string;
    role: string;
    conv: 'caller' | 'callee';
    note: string;
}

/** Static metadata for one RFLAGS bit. */
export interface FlagMeta {
    k: string;
    n: string;
    note: string;
}

/** Static metadata for one segment register. */
export interface SegMeta {
    k: string;
    n: string;
    note: string;
}

/** The fully-derived x86-64 register file for a step. */
export interface RegisterFile {
    pc: string;
    fn: string;
    ir: string;
    writes: string | null;
    sp: string;
    bp: string;
    gpr: Record<string, string>;
    rflags: string;
    flags: Record<string, number>;
    seg: Record<string, string>;
    cr: Record<string, string>;
    simdActive: boolean;
    xmm0: string | null;
    changed: RegisterFile | null;
}

/** Which panel is shown in the center column. */
export type CenterTab = 'step' | 'code';

/** Which view is shown in the memory panel. */
export type MemTab = 'all' | 'regs' | 'goroutines' | 'chart' | 'vmap';

/** Which collapsible regions are open in the "All Regions" view. */
export type RegionKey = 'stack' | 'heap' | 'regs' | 'code' | 'data';

/** Which beginner intro banners are expanded. */
export type IntroKey = 'all' | 'regs';
