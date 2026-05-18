// Verbatim register/region metadata, extracted unchanged from the original.
// Typed via the *Meta interfaces in ../types.
/* eslint-disable */
import type { GprMeta, FlagMeta, SegMeta } from '../types';
export const TAG_TIPS = {
    'new': 'Newly allocated in this step — memory did not exist before',
    'upd': 'Value changed in this step — same allocation, updated field',
    'free': 'Released in this step — GC sweep or stack frame pop'
};
export const ADDR_TIPS = {
    '0xC000010000': 'goroutine stack base — G1 (main)',
    '0xC000012000': 'goroutine stack limit — grows downward from here',
    '0xC000050000': 'heap: tiny-allocator block — batches ≤16 B non-pointer objects',
    '0xC000060000': 'heap: FileStorage struct (JSON file backend)',
    '0xC000070000': 'heap: TaskManager struct (88 B, owns tasks slice + mu)',
    '0xC000080000': 'heap: tasks backing array — slice grows here via growslice',
    '0xC000090000': 'heap: hmap for GetTasksByPriority result map',
    '0xC0000A0000': 'heap: hchan for ProcessTasksAsync channel (ring buffer)',
};
export const VAL_TIPS = {
    'LOCKED': 'sync.Mutex internal state — atomic CAS set to 1 by Lock()',
    'UNLOCKED': 'sync.Mutex released — CAS reset to 0 by Unlock()',
    'true': 'bool stored as 1 byte (0x01) in memory',
    'false': 'bool stored as 1 byte (0x00) in memory',
    'nil': 'zero value — pointer is 0x0000000000000000',
    'running': 'goroutine is on an M (OS thread) and executing',
    'runnable': 'goroutine is in the run queue, waiting for an M',
    'waiting': 'goroutine is blocked — parked by the scheduler',
    'dead': 'goroutine has exited — G struct may be reused',
};

export const REGION_TIPS = {
    stack: 'Go goroutine stack — grows downward, LIFO frames.\nAlloc ~1 ns (just decrement SP). Freed instantly on return.\nDoes NOT involve the GC. Max 1 GB by default.',
    heap: 'HEAP — the big shared pool of memory for data that must OUTLIVE the\nfunction that created it (returned pointers, slices, maps, channels).\nIn Go you do not free it yourself: the garbage collector (GC) finds\nunreachable objects and reclaims them. Slower than the stack (~100 ns)\nbut flexible. Grows UPWARD. Click a row’s pointer to see where it points.',
    regs: 'CPU REGISTERS — the handful of tiny, ultra-fast storage slots INSIDE the\nprocessor (sub-nanosecond access). The CPU can only do math on values\nthat are in registers, so data is constantly loaded from memory → register\n→ computed → stored back. This panel shows the full x86-64 register file\nfor the core running the program, updated for the current step.',
    code: 'CODE SEGMENT (.text) — the actual machine instructions of your compiled\nprogram. READ-ONLY (so a bug can’t overwrite your code). The PC/RIP\nregister always points at an address in here: the next instruction to run.\n▶ active marks the function executing this step.',
    data: 'DATA SEGMENT — fixed global data baked into the binary at compile time.\n.rodata = read-only constants & string literals. .data = initialized\nglobals. .bss = globals that start at zero. Lives for the whole program;\nthe GC scans it as a “root” to find what is still reachable.',
};
// One-line beginner explainer shown INSIDE each region body (above its rows).
export const REGION_EXPLAINERS = {
    stack: 'Scratch space for the function running <b>right now</b>. Each call gets a <b>frame</b> (locals + return address); the frame vanishes the instant the function returns. <b>RSP</b> points at its top.',
    heap: 'Long-lived data that escapes the function that made it. Freed automatically by the <b>garbage collector</b>, not by you. Each row is one allocation; orange values are <b>pointers</b> into the heap.',
    code: 'Your compiled instructions (read-only). The CPU’s <b>program counter (RIP)</b> walks through these addresses one instruction at a time. <b>▶ active</b> = the function running this step.',
    data: 'Globals & constants fixed at compile time. <code>.rodata</code> = read-only literals, <code>.data</code> = initialized globals, <code>.bss</code> = zero-initialized globals.',
};

export const GPR_META: GprMeta[] = [
    { q: 'RAX', d: 'EAX', w: 'AX', b: 'AL/AH', role: 'Accumulator / return value', conv: 'caller', note: 'The “result” register. Math often lands here, and a function’s return value comes back in RAX. A syscall number also goes in RAX.' },
    { q: 'RBX', d: 'EBX', w: 'BX', b: 'BL/BH', role: 'Base — general purpose', conv: 'callee', note: 'A general scratch register. Callee-saved, so it is handy for values you need to survive across a function call.' },
    { q: 'RCX', d: 'ECX', w: 'CX', b: 'CL/CH', role: 'Counter / 4th argument', conv: 'caller', note: 'Classic loop/string counter, and the 4th function argument in the calling convention.' },
    { q: 'RDX', d: 'EDX', w: 'DX', b: 'DL/DH', role: 'Data / 3rd argument', conv: 'caller', note: 'Used for the high half of multiply/divide results, and the 3rd function argument.' },
    { q: 'RSI', d: 'ESI', w: 'SI', b: 'SIL', role: 'Source index / 2nd argument', conv: 'caller', note: '“Source” pointer for copy operations, and the 2nd function argument.' },
    { q: 'RDI', d: 'EDI', w: 'DI', b: 'DIL', role: 'Destination index / 1st argument', conv: 'caller', note: '“Destination” pointer for copy operations, and the 1st function argument (in Go method calls, usually the receiver pointer).' },
    { q: 'RBP', d: 'EBP', w: 'BP', b: 'BPL', role: 'Base / frame pointer', conv: 'callee', note: 'Marks the BASE of the current function’s stack frame, giving a stable anchor to find local variables even as RSP moves.' },
    { q: 'RSP', d: 'ESP', w: 'SP', b: 'SPL', role: 'Stack pointer', conv: 'callee', note: 'Always points at the TOP of the stack. A function call pushes (RSP goes down); a return pops (RSP goes up).' },
    { q: 'R8', d: 'R8D', w: 'R8W', b: 'R8B', role: '5th argument', conv: 'caller', note: 'Extra register added in 64-bit mode. Used as the 5th function argument.' },
    { q: 'R9', d: 'R9D', w: 'R9W', b: 'R9B', role: '6th argument', conv: 'caller', note: 'Extra 64-bit register. Used as the 6th function argument; further arguments go on the stack.' },
    { q: 'R10', d: 'R10D', w: 'R10W', b: 'R10B', role: 'Scratch', conv: 'caller', note: 'General scratch register. Caller-saved, so a called function is free to overwrite it.' },
    { q: 'R11', d: 'R11D', w: 'R11W', b: 'R11B', role: 'Scratch', conv: 'caller', note: 'General scratch register, often used by the linker for call thunks. Caller-saved.' },
    { q: 'R12', d: 'R12D', w: 'R12W', b: 'R12B', role: 'General purpose', conv: 'callee', note: 'General register. Callee-saved: a function that uses it must restore it before returning.' },
    { q: 'R13', d: 'R13D', w: 'R13W', b: 'R13B', role: 'General purpose', conv: 'callee', note: 'General register. Callee-saved.' },
    { q: 'R14', d: 'R14D', w: 'R14W', b: 'R14B', role: 'Current goroutine pointer (Go ABI)', conv: 'callee', note: 'In Go, this always holds a pointer to the current goroutine’s descriptor (g). That is how the runtime finds the stack bounds and scheduler state.' },
    { q: 'R15', d: 'R15D', w: 'R15W', b: 'R15B', role: 'General purpose', conv: 'callee', note: 'General register. Callee-saved.' },
];
export const FLAG_META: FlagMeta[] = [
    { k: 'CF', n: 'Carry', note: 'Set when unsigned math overflows past the top bit (e.g. adding two big numbers carries out). Used for multi-word arithmetic.' },
    { k: 'PF', n: 'Parity', note: 'Set when the low byte of the result has an even number of 1-bits. A historical flag, rarely used today.' },
    { k: 'AF', n: 'Adjust', note: 'Carry out of the low 4 bits (nibble). Used only for old-style binary-coded-decimal math.' },
    { k: 'ZF', n: 'Zero', note: 'Set when the result is zero / a comparison was equal. This is THE flag that if-statements check (CMP then “jump if equal”).' },
    { k: 'SF', n: 'Sign', note: 'Copies the top bit of the result, i.e. set when the result is negative (for signed numbers).' },
    { k: 'OF', n: 'Overflow', note: 'Set when SIGNED math overflows (the result is too big/small to fit and the sign flipped wrongly).' },
    { k: 'DF', n: 'Direction', note: 'Controls whether string/array copy instructions move forward (0) or backward (1) through memory.' },
    { k: 'IF', n: 'Interrupt', note: 'When 1, the CPU accepts hardware interrupts. The kernel clears it briefly in critical sections (e.g. Go’s stop-the-world GC pause).' },
    { k: 'TF', n: 'Trap', note: 'When 1, the CPU single-steps: it traps after every instruction. Debuggers use this to step through code.' },
];
export const SEG_META: SegMeta[] = [
    { k: 'CS', n: 'Code', note: 'Code segment selector. In 64-bit mode it mainly encodes the privilege level (0x33 = user mode, ring 3).' },
    { k: 'DS', n: 'Data', note: 'Data segment. Effectively unused (base 0) in 64-bit “flat” memory mode.' },
    { k: 'ES', n: 'Extra', note: 'Extra data segment for string operations. Unused (base 0) in 64-bit mode.' },
    { k: 'FS', n: 'Thread-local', note: 'Repurposed in 64-bit mode to point at thread-local storage (per-thread private data). C runtimes use it heavily.' },
    { k: 'GS', n: 'Per-CPU / TLS', note: 'Like FS, gives a per-thread/per-CPU base address. Kernels use it for per-CPU data; on Go/amd64 it is generally unused in user code.' },
    { k: 'SS', n: 'Stack', note: 'Stack segment selector. In 64-bit mode it mainly carries the privilege level alongside CS.' },
];
