// Verbatim 31-step execution dataset, extracted unchanged from the original
// memory_simulator.html. Typed via the Step interface in ../types.
import type { Step } from '../types';
const S_RAW = [
    {
        name: "Runtime init & binary load", fn: "runtime → main()", group: "Boot",
        tags: ["stack", "heap"],
        lines: [],
        code: `<span class="cm">// $ go run task.go</span>
<span class="cm">// 1. OS maps binary into virtual address space</span>
<span class="cm">// 2. Go runtime initialises (schedinit)</span>
<span class="cm">// 3. G1 goroutine created with 8 KB stack on heap</span>
<span class="cm">// 4. M0 OS thread created, P0 logical processor bound</span>
<span class="cm">// 5. Package-level consts/vars placed in data segment</span>
<span class="cm">// 6. main() called</span>`,
        desc: `The OS loads the compiled binary. The Go runtime (<code>runtime.schedinit</code>) sets up the M:N scheduler: <strong>M0</strong> is the first OS thread, <strong>P0</strong> is the logical processor, <strong>G1</strong> is the main goroutine. G1 gets an initial <strong>8 KB stack</strong>, which is itself heap-allocated. All <code>const</code> and package-level data are placed in the data segment at load time, with zero runtime cost.`,
        cpu: "M0 OS thread starts · runtime.schedinit · runtime.newproc(main) → G1 · SP = 0xC000011FF8",
        goroutines: [{ id: "G1", state: "run", fn: "runtime init", stack: "0xC000010000–0xC000012000" }],
        stack: [],
        heap: [
            {
                grp: "G1 goroutine descriptor (runtime.g)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000044000", name: "goid", val: "1", tag: "new" },
                    { addr: "0xC000044008", name: "stack.lo", val: "0xC000010000", cls: "ptr", tag: "new" },
                    { addr: "0xC000044010", name: "stack.hi", val: "0xC000012000", cls: "ptr", tag: "new" },
                    { addr: "0xC000044018", name: "status", val: "2 = Grunning", tag: "new" },
                    { addr: "0xC000044020", name: "m (→M0)", val: "0xC000046000", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "M0 OS thread (runtime.m)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000046000", name: "id", val: "0", tag: "new" },
                    { addr: "0xC000046008", name: "g0 (sched goroutine)", val: "0xC000048000", cls: "ptr", tag: "new" },
                    { addr: "0xC000046010", name: "curg (current G)", val: "0xC000044000 → G1", cls: "ptr", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: false },
            { addr: "0x0402000", name: "main.NewTaskManager", active: false },
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: false },
            { addr: "0x0404000", name: "main.(*TaskManager).CompleteTask", active: false },
            { addr: "0x0404800", name: "main.(*TaskManager).DeleteTask", active: false },
            { addr: "0x0405000", name: "main.(*TaskManager).GetTasks", active: false },
            { addr: "0x0405800", name: "main.(*TaskManager).ProcessTasksAsync", active: false },
            { addr: "0x0406000", name: "main.(*FileStorage).Save", active: false },
            { addr: "0x0406800", name: "main.(*FileStorage).Load", active: false },
            { addr: "0x0407000", name: "runtime.mallocgc", active: true },
            { addr: "0x0408000", name: "runtime.newproc (go stmt)", active: true },
            { addr: "0x0409000", name: "sync.(*RWMutex).Lock", active: false },
            { addr: "0x040A000", name: "encoding/json.MarshalIndent", active: false },
        ],
        data_seg: [
            {
                grp: '.rodata: string literals', rows: [
                    { addr: "0x0500000", name: 'DataFile', val: '"tasks.json" [10 B]', cls: "str", tag: "new" },
                    { addr: "0x0500010", name: 'Version', val: '"1.0.0" [5 B]', cls: "str", tag: "new" },
                    { addr: "0x0500020", name: 'TimeFormat', val: '"2006-01-02 15:04:05"', cls: "str", tag: "new" },
                    { addr: "0x0500050", name: 'errEmptyTitle', val: '"task title cannot be empty"', cls: "str", tag: "new" },
                ]
            },
            {
                grp: '.bss: zero-value globals (iota)', rows: [
                    { addr: "0x0510000", name: 'Low (Priority)', val: '0', tag: "new" },
                    { addr: "0x0510004", name: 'Medium (Priority)', val: '1', tag: "new" },
                    { addr: "0x0510008", name: 'High (Priority)', val: '2', tag: "new" },
                    { addr: "0x051000C", name: 'Critical (Priority)', val: '3', tag: "new" },
                    { addr: "0x0510010", name: 'MaxWorkers (const)', val: '3', tag: "new" },
                ]
            },
            {
                grp: 'itab: interface dispatch tables', rows: [
                    { addr: "0x0520000", name: 'itab<FileStorage,TaskStorage>', val: 'Save,Load fn ptrs', cls: "fn", tag: "new" },
                ]
            },
        ],
        heapB: 8448, stackB: 0,
    },
    {
        name: "main() frame pushed onto G1 stack", fn: "main()", group: "main()",
        tags: ["stack"],
        lines: [208],
        code: `<span class="kw">func</span> <span class="fn">main</span>() {
    <span class="kw">var</span> (
<span class="hl">interactive</span> = ...
<span class="cm">// G1 is already running. Calling main() pushes a new
// stack frame: SP moves DOWN (stack grows downward).
// The frame is reserved on the goroutine's 8KB stack
// (which itself lives on the heap at 0xC000010000).
// No heap allocation yet — frame space is free.</span>`,
        desc: `When <code>main()</code> is called, a new <strong>stack frame</strong> is pushed onto G1's goroutine stack. The stack pointer (SP) moves downward by the frame size (determined at compile time). On amd64, the Go stack grows <strong>downward</strong>: lower addresses are newer frames. The goroutine stack (8 KB by default) lives on the <strong>heap</strong>, not the OS thread stack. At this moment no locals exist yet. They'll be created as each <code>flag.Bool</code>/<code>flag.String</code> call executes and writes a pointer back to the stack.`,
        cpu: "M0/G1 · CALL main.main · SUBQ $frame_size, SP · return addr pushed",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame: freshly pushed, no locals yet", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FE8", name: "return addr → runtime.goexit", val: "0x0408500", cls: "ptr", tag: "new" },
                    { addr: "0xC000011FE0", name: "(locals reserved, not yet written)", val: "uninitialized", cls: "nil", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "G1 goroutine stack (8 KB, heap-allocated)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000010000", name: "G1 stack.lo", val: "base of 8KB stack", tag: "" },
                    { addr: "0xC000011FE8", name: "G1 SP (current)", val: "stack grows ↓ here", cls: "ptr" },
                    { addr: "0xC000012000", name: "G1 stack.hi", val: "top (original SP)", tag: "" },
                ]
            },
        ],
        code_seg: [{ addr: "0x0401000", name: "main.main", active: true }],
        data_seg: [],
        heapB: 8448, stackB: 8,
    },
    {
        name: "interactive = flag.Bool(\"interactive\", false)", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [210],
        code: `interactive = flag.<span class="fn">Bool</span>(<span class="st">"interactive"</span>, <span class="hl">false</span>, <span class="st">"Run in interactive mode"</span>)
<span class="cm">// flag.Bool does TWO things:
//   1. runtime.new(bool) → allocates 1 byte on heap
//      (aligned to 8 bytes → occupies a full word)
//   2. Registers the flag in global flag.CommandLine FlagSet
// Returns *bool — an 8-byte pointer stored on the stack.
// Default value false is written into the heap bool.</span>`,
        desc: `<code>flag.Bool</code> calls <code>runtime.new(bool)</code> which calls <code>runtime.mallocgc(1)</code>, allocating <strong>1 byte on the heap</strong> (padded to 8 bytes by the allocator's size class). The default value <code>false</code> (0x00) is written into that byte. The returned pointer is stored in the local variable <code>interactive</code> at the top of the stack frame. The flag name <code>"interactive"</code> is a string literal: its bytes live in <strong>.rodata</strong>, not the heap. The FlagSet registration stores both the pointer and the name for later <code>flag.Parse()</code> to match against <code>os.Args</code>.`,
        cpu: "M0/G1 · CALL flag.Bool → CALL runtime.new(bool) → mallocgc(1) → 0xC000050000 · MOVB $0 [0xC000050000] · MOVQ ptr → [SP+interactive]",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011FD0", name: "(version, not yet)", val: "(none)", cls: "nil" },
                ]
            },
        ],
        heap: [
            {
                grp: "heap bool @ 0xC000050000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive bool", val: "false (default)", cls: "bf", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x040B000", name: "flag.Bool", active: true },
            { addr: "0x0407000", name: "runtime.new(bool) → mallocgc(1)", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata: flag name strings (not heap)', rows: [
                    { addr: "0x0500060", name: '"interactive" [11B]', val: 'string literal, read-only', cls: "str" },
                ]
            },
        ],
        heapB: 8449, stackB: 16,
    },
    {
        name: "version = flag.Bool(\"version\", false)", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [211],
        code: `version = flag.<span class="fn">Bool</span>(<span class="st">"version"</span>, <span class="hl">false</span>, <span class="st">"Show version"</span>)
<span class="cm">// Second call to flag.Bool — same pattern:
//   runtime.new(bool) → 1 byte on heap
// Note: 0xC000050001 is ONE byte after *interactive.
// The allocator's tiny allocator batches small (≤16B)
// non-pointer objects into the same 16-byte block.
// Both bools share a 16-byte heap allocation unit.</span>`,
        desc: `Same pattern as <code>interactive</code>. This is the <strong>tiny allocator</strong> in action: for very small objects with no pointers (like <code>bool</code>), Go's allocator groups them into a shared 16-byte block rather than making a separate heap call. So <code>*version</code> lands at <code>0xC000050001</code>, just 1 byte after <code>*interactive</code>. They share the same underlying allocation unit. This is why you can't take the address of <code>true</code>/<code>false</code> literals: they have no addressable heap location until <code>runtime.new</code> allocates one.`,
        cpu: "M0/G1 · CALL flag.Bool → tiny alloc reuses 16B block → MOVB $0 [0xC000050001] · MOVQ ptr → [SP+version]",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FD0", name: "version *bool", val: "0xC000050001", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "tiny-allocated 16B block @ 0xC000050000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive bool", val: "false", cls: "bf" },
                    { addr: "0xC000050001", name: "*version bool", val: "false (default)", cls: "bf", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x040B000", name: "flag.Bool (tiny alloc path)", active: true },
        ],
        data_seg: [],
        heapB: 8450, stackB: 24,
    },
    {
        name: "addTask = flag.String(\"add\", \"\")", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [212],
        code: `addTask = flag.<span class="fn">String</span>(<span class="st">"add"</span>, <span class="st">""</span>, <span class="st">"Add a task with title"</span>)
<span class="cm">// flag.String allocates a string HEADER (16 bytes) on heap:
//   {ptr *byte, len int}
// Default "" is an empty string: ptr=nil (or zero), len=0
// string header is 16 bytes — larger than a bool
// Cannot use tiny allocator → separate mallocgc(16) call
// *addTask is a *string — pointer to a string header</span>`,
        desc: `<code>flag.String</code> allocates a <strong>string header</strong> (16 bytes: a data pointer + length integer) on the heap via <code>runtime.new(string)</code>. The default value <code>""</code> is an empty string: the data pointer is nil and length is 0. A <code>*string</code> is a pointer to this 16-byte struct. Later when <code>flag.Parse()</code> runs and finds <code>--add "Fix login bug"</code>, it will allocate a new heap byte array for the string bytes and write the new pointer and length into this header. The stack pointer itself never changes.`,
        cpu: "M0/G1 · CALL flag.String → mallocgc(16) → 0xC000050010 · zero 16B · MOVQ ptr → [SP+addTask]",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FD0", name: "version *bool", val: "0xC000050001", cls: "ptr" },
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "string header @ 0xC000050010 (16 bytes)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050010", name: "*addTask string.ptr", val: 'nil → empty string ""', cls: "nil", tag: "new" },
                    { addr: "0xC000050018", name: "*addTask string.len", val: "0", tag: "new" },
                ]
            },
            {
                grp: "tiny block", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive", val: "false", cls: "bf" },
                    { addr: "0xC000050001", name: "*version", val: "false", cls: "bf" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x040B200", name: "flag.String", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(16): string header", active: true },
        ],
        data_seg: [],
        heapB: 8466, stackB: 32,
    },
    {
        name: "listTasks = flag.Bool(\"list\", false)", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [213],
        code: `listTasks = flag.<span class="fn">Bool</span>(<span class="st">"list"</span>, <span class="hl">false</span>, <span class="st">"List all tasks"</span>)
<span class="cm">// Fourth and last flag variable.
// Another 1-byte bool heap allocation (tiny allocator).
// Now all 4 flag pointers are written to the stack.
// 4 heap objects: 0xC000050000 (bool), 0xC000050001 (bool),
//                 0xC000050010 (string hdr), 0xC000050030 (bool)
// Stack frame now holds 4 pointers — 32 bytes used.</span>`,
        desc: `The fourth flag allocation completes the <code>var</code> block. All four local variables (<code>interactive</code>, <code>version</code>, <code>addTask</code>, <code>listTasks</code>) are now written to the main() stack frame. They are all <strong>pointers</strong>, 8 bytes each on the stack. The actual values (bools and string) are on the heap. This separation is key: the stack holds cheap-to-copy pointers, while heap objects can be updated by <code>flag.Parse()</code> without moving the stack pointers at all.`,
        cpu: "M0/G1 · tiny alloc reuse → MOVB $0 [0xC000050030] · MOVQ ptr → [SP+listTasks] · all 4 vars written",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame: all 4 flag pointers written", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FD0", name: "version *bool", val: "0xC000050001", cls: "ptr" },
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr" },
                    { addr: "0xC000011FC0", name: "listTasks *bool", val: "0xC000050030", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "all flag heap allocations", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive bool", val: "false", cls: "bf" },
                    { addr: "0xC000050001", name: "*version bool", val: "false", cls: "bf" },
                    { addr: "0xC000050010", name: "*addTask string.ptr", val: 'nil (empty "")', cls: "nil" },
                    { addr: "0xC000050030", name: "*listTasks bool", val: "false (default)", cls: "bf", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x040B000", name: "flag.Bool (4th call)", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata: all flag names (string literals, not heap)', rows: [
                    { addr: "0x0500060", name: '"interactive"', val: '[11B] read-only', cls: "str" },
                    { addr: "0x050006C", name: '"version"', val: '[7B] read-only', cls: "str" },
                    { addr: "0x0500074", name: '"add"', val: '[3B] read-only', cls: "str" },
                    { addr: "0x0500078", name: '"list"', val: '[4B] read-only', cls: "str" },
                ]
            },
        ],
        heapB: 8492, stackB: 32,
    },
    {
        name: "flag.Parse(): scanning os.Args", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [215],
        code: `flag.<span class="fn">Parse</span>()
<span class="cm">// Reads os.Args[1:] — slice header in .bss → OS argv
// flag.CommandLine (global FlagSet) walks each argument:
//   "--add=Fix login bug" → *addTask gets new heap string
//   "--interactive"       → *interactive = true (1 byte write)
// Local stack pointers unchanged — same heap addresses
// Only the heap values at those addresses are updated</span>`,
        desc: `<code>flag.Parse()</code> reads <code>os.Args[1:]</code>, a <strong>slice header in BSS</strong> whose data pointer comes from the OS-provided argv array. It walks each CLI argument, matches flag names, and <strong>writes the parsed value into the heap-allocated pointers</strong> created by <code>flag.Bool</code> and <code>flag.String</code>. For string flags a new heap string is allocated for the parsed value. For booleans it's a single-byte write. The local stack pointers (<code>interactive</code>, <code>addTask</code>, etc.) do not change. They still point to the same heap locations, but those locations now hold the parsed values.`,
        cpu: "M0/G1 · CALL flag.Parse → scan os.Args → mallocgc(13) for 'Fix login bug' → MOVQ → [0xC000050010]",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame: stack pointers unchanged", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FD0", name: "version *bool", val: "0xC000050001", cls: "ptr" },
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr" },
                    { addr: "0xC000011FC0", name: "listTasks *bool", val: "0xC000050030", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "flag heap values: UPDATED by Parse()", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive bool", val: "false", cls: "bf" },
                    { addr: "0xC000050001", name: "*version bool", val: "false", cls: "bf" },
                    { addr: "0xC000050010", name: "*addTask string.ptr", val: "0xC000051000 → 'Fix login bug'", cls: "ptr", tag: "upd" },
                    { addr: "0xC000050018", name: "*addTask string.len", val: "13", tag: "upd" },
                    { addr: "0xC000050030", name: "*listTasks bool", val: "false", cls: "bf" },
                ]
            },
            {
                grp: "parsed string backing @ 0xC000051000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000051000", name: "[13]byte", val: '"Fix login bug"', cls: "str", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x040B400", name: "flag.Parse → scan os.Args", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(13): parsed string", active: true },
        ],
        data_seg: [
            {
                grp: '.bss: os.Args slice header (points to kernel-provided argv)', rows: [
                    { addr: "0x0511000", name: "os.Args.ptr", val: "argv from OS kernel (not heap)", cls: "ptr" },
                    { addr: "0x0511008", name: "os.Args.len", val: "3 (argc: task --add 'Fix login bug')" },
                ]
            },
        ],
        heapB: 8518, stackB: 32,
    },
    {
        name: "if *version { fmt.Printf(...); return }", fn: "main()", group: "main()",
        tags: ["stack"],
        lines: [216, 217, 218, 219],
        code: `<span class="kw">if</span> *version {
    fmt.<span class="fn">Printf</span>(<span class="st">"Task Manager v%s\\n"</span>, Version)
    <span class="kw">return</span>
}
<span class="cm">// *version = dereference pointer: MOVB [0xC000050001] → AL
// AL = 0x00 (false) → condition fails → skip branch
// This is the "fast path": no fmt.Printf, no return
// Branch prediction: CPU speculatively executes fall-through
// If *version were true:
//   fmt.Printf would box Version (string→interface{}) on heap
//   return would POP main() frame instantly — no GC needed</span>`,
        desc: `<code>*version</code> dereferences the heap pointer: the CPU loads 1 byte from address <code>0xC000050001</code>. It reads <code>0x00</code> (false). The conditional branch is <strong>not taken</strong>, so <code>fmt.Printf</code> and <code>return</code> are skipped. Branch prediction means the CPU has likely already speculatively executed the fall-through path. If the flag were true, <code>fmt.Printf("Task Manager v%s", Version)</code> would need to <strong>box</strong> the <code>Version</code> string into an <code>interface{}</code> value, a heap allocation of 16 bytes (itab + data pointer). Then <code>return</code> would instantly reclaim the entire main() stack frame.`,
        cpu: "M0/G1 · MOVB [0xC000050001] → AL · TEST AL,AL · JZ fall-through (not taken) · fall-through: continue past if block",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame: no change, branch skipped", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FD0", name: "version *bool", val: "0xC000050001", cls: "ptr" },
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr" },
                    { addr: "0xC000011FC0", name: "listTasks *bool", val: "0xC000050030", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "flag values (read but not modified)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050001", name: "*version (READ)", val: "false → branch NOT taken", cls: "bf" },
                ]
            },
        ],
        code_seg: [{ addr: "0x0401000", name: "main.main: if *version check", active: true }],
        data_seg: [
            {
                grp: '.rodata: would be used if branch taken', rows: [
                    { addr: "0x0500010", name: 'Version const', val: '"1.0.0" [5B], read-only', cls: "str" },
                ]
            },
        ],
        heapB: 8518, stackB: 32,
    },
    {
        name: "&FileStorage{}: escape to heap", fn: "main()", group: "main()",
        tags: ["stack", "heap"],
        lines: [220, 221],
        code: `storage := &<span class="ty">FileStorage</span>{filename: <span class="hl">DataFile</span>}
<span class="cm">// &{} → address-of → escape analysis triggers
// FileStorage escapes to heap
// runtime.mallocgc(24 bytes) called
// stack holds only the 8-byte pointer</span>`,
        desc: `The <code>&</code> operator takes the address of the struct literal. Go's <strong>escape analysis</strong> (run at compile time) sees that this pointer is returned and stored, so the struct must outlive <code>main()</code>'s stack frame. Result: <code>runtime.mallocgc(16)</code> allocates 16 bytes on the heap. The stack only holds an 8-byte pointer. The <code>filename</code> field is a <strong>string header</strong> (ptr+len, as strings in Go have NO cap field unlike slices), where ptr points into the read-only data segment, not the heap.`,
        cpu: "M0/G1 · (compile-time: escape analysis detected &FileStorage) · runtime.mallocgc(16) → 0xC000060000",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FD8", name: "interactive *bool", val: "0xC000050000", cls: "ptr" },
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "FileStorage struct (16 bytes) @ 0xC000060000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000060000", name: "filename.ptr", val: "0x0500000 → .rodata", cls: "ptr", tag: "new" },
                    { addr: "0xC000060008", name: "filename.len", val: "10  (string, not slice, no cap)", tag: "new" },
                ]
            },
            {
                grp: "flag values", lbl: "heap-lbl", rows: [
                    { addr: "0xC000050000", name: "*interactive", val: "false", cls: "bf" },
                    { addr: "0xC000050010", name: "*addTask string", val: 'ptr→"" len=0', cls: "str" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0401000", name: "main.main", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(16)", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata (ptr target)', rows: [
                    { addr: "0x0500000", name: 'DataFile bytes', val: '"tasks.json" ← filename.ptr', cls: "str" },
                ]
            },
            {
                grp: '.bss', rows: [
                    { addr: "0x0520000", name: 'itab<FileStorage,TaskStorage>', val: 'type descriptor + fn ptrs', cls: "fn" },
                ]
            },
        ],
        heapB: 8516, stackB: 40,
    },
    {
        name: "NewTaskManager(): interface + heap struct", fn: "NewTaskManager()", group: "NewTaskManager()",
        tags: ["stack", "heap", "interface"],
        lines: [110, 111, 112, 113, 114],
        code: `<span class="kw">func</span> <span class="fn">NewTaskManager</span>(storage <span class="ty">TaskStorage</span>) *<span class="ty">TaskManager</span> {
    tm := &<span class="ty">TaskManager</span>{     <span class="cm">// escapes → heap</span>
storage: storage,   <span class="cm">// interface = {itab ptr, data ptr}</span>
nextID:  <span class="nu">1</span>,
    }
    <span class="cm">// storage.Load() called via interface dispatch</span>
    <span class="kw">return</span> tm
}`,
        desc: `New stack frame pushed for <code>NewTaskManager</code>. The <code>storage</code> parameter is a <strong>TaskStorage interface</strong> value, 16 bytes on the stack: an <em>itab pointer</em> (type+method table) and a <em>data pointer</em> (pointing to FileStorage on heap). <code>TaskManager</code> escapes (returned as pointer) and is <strong>72 bytes heap-allocated</strong>. It contains: <code>[]Task</code> slice header (24B, nil), interface storage (16B), nextID int (8B), <code>sync.RWMutex</code> (24B, comprising w.Mutex 8B + writerSem 4B + readerSem 4B + readerCount 4B + readerWait 4B).`,
        cpu: "M0/G1 · CALL NewTaskManager · push frame · mallocgc(72) → 0xC000070000 · interface dispatch: itab→Load() · RET",
        goroutines: [{ id: "G1", state: "run", fn: "NewTaskManager()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "NewTaskManager() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F60", name: "storage.itab", val: "0x0520000 (FileStorage itab)", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F68", name: "storage.data", val: "0xC000060000 → FileStorage", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F70", name: "tm *TaskManager (retval)", val: "0xC000070000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F78", name: "return addr", val: "0x0401080 → main()", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager (72 bytes) @ 0xC000070000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr ([]Task)", val: "nil, no tasks yet", cls: "nil", tag: "new" },
                    { addr: "0xC000070008", name: "tasks.len", val: "0", tag: "new" },
                    { addr: "0xC000070010", name: "tasks.cap", val: "0", tag: "new" },
                    { addr: "0xC000070018", name: "storage.itab", val: "0x0520000", cls: "ptr", tag: "new" },
                    { addr: "0xC000070020", name: "storage.data", val: "0xC000060000", cls: "ptr", tag: "new" },
                    { addr: "0xC000070028", name: "nextID int", val: "1", tag: "new" },
                    { addr: "0xC000070030", name: "mutex.state int32", val: "0 (unlocked)", tag: "new" },
                    { addr: "0xC000070034", name: "mutex.sema uint32", val: "0", tag: "new" },
                    { addr: "0xC000070038", name: "mutex.readerSem", val: "0", tag: "new" },
                    { addr: "0xC000070040", name: "mutex.readerCount", val: "0", tag: "new" },
                ]
            },
            {
                grp: "FileStorage @ 0xC000060000 (16 bytes)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000060000", name: "filename.ptr", val: "0x0500000 → .rodata", cls: "ptr" },
                    { addr: "0xC000060008", name: "filename.len", val: "10  (string, ptr+len only, no cap)" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0402000", name: "main.NewTaskManager", active: true },
            { addr: "0x0406800", name: "main.(*FileStorage).Load", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(72)", active: true },
            { addr: "0x0520000", name: "itab<FileStorage,TaskStorage>", active: true },
        ],
        data_seg: [
            {
                grp: 'itab dispatch', rows: [
                    { addr: "0x0520000", name: 'itab.type', val: '*FileStorage typeinfo', cls: "fn" },
                    { addr: "0x0520008", name: 'itab.fun[0] = Save', val: '0x0406000', cls: "fn" },
                    { addr: "0x0520010", name: 'itab.fun[1] = Load', val: '0x0406800', cls: "fn" },
                ]
            },
        ],
        heapB: 8604, stackB: 72,
    },
    {
        name: "NewTaskManager(): storage.Load() via itab", fn: "NewTaskManager()", group: "NewTaskManager()",
        tags: ["stack", "heap", "interface"],
        lines: [115, 116, 117, 118, 119, 120, 121, 122, 123, 124],
        code: `<span class="kw">if</span> tasks, err := storage.<span class="fn">Load</span>(); err == <span class="hl">nil</span> {
    tm.tasks = tasks
    <span class="kw">for</span> _, task := <span class="kw">range</span> tasks {
<span class="kw">if</span> task.ID >= tm.nextID {
    tm.nextID = task.ID + <span class="nu">1</span>
}
    }
}
<span class="kw">return</span> tm
<span class="cm">// Interface dispatch: itab[0x0520000].fun[1] → FileStorage.Load
// Load: os.ReadFile("tasks.json") → ENOENT (no file yet)
// os.IsNotExist(err) = true → return nil, nil
// No tasks loaded; tm.tasks stays a nil slice
// NewTaskManager frame POPPED; tm ptr → main()</span>`,
        desc: `<code>storage.Load()</code> uses <strong>interface dispatch</strong>: the runtime reads <code>storage.itab</code> (an 8-byte pointer on the stack), dereferences to the itab table, and jumps to <code>itab.fun[1]</code> = <code>FileStorage.Load</code> at address <code>0x0406800</code>. Inside Load, <code>os.ReadFile("tasks.json")</code> performs a <code>openat</code> syscall. Since the file does not exist yet, the kernel returns <code>ENOENT</code>, <code>os.IsNotExist(err)</code> returns <code>true</code>, and Load returns <code>nil, nil</code>. No tasks are loaded. <code>NewTaskManager</code> then returns: its stack frame is popped and the <code>tm</code> pointer is placed into <code>main()</code>'s frame.`,
        cpu: "M0/G1 · itab.fun[1]=0x0406800 · JMP FileStorage.Load · SYSCALL openat('tasks.json') ENOENT · RET nil,nil · POP frame",
        goroutines: [{ id: "G1", state: "run", fn: "main() ← NewTaskManager returning", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame: NewTaskManager frame gone", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FC8", name: "addTask *string", val: "0xC000050010", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager @ 0xC000070000: tasks still nil", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr", val: "nil (no saved file found)", cls: "nil" },
                    { addr: "0xC000070008", name: "tasks.len", val: "0" },
                    { addr: "0xC000070018", name: "storage.itab", val: "0x0520000", cls: "ptr" },
                    { addr: "0xC000070020", name: "storage.data", val: "0xC000060000", cls: "ptr" },
                    { addr: "0xC000070028", name: "nextID int", val: "1" },
                    { addr: "0xC000070030", name: "mutex.state", val: "0 (unlocked)", cls: "bf" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0402000", name: "main.NewTaskManager (returning)", active: true },
            { addr: "0x0406800", name: "main.(*FileStorage).Load", active: true },
            { addr: "0x0520010", name: "itab.fun[1] = Load (dispatch)", active: true },
        ],
        data_seg: [
            {
                grp: 'itab dispatch used', rows: [
                    { addr: "0x0520000", name: 'itab.type', val: '*FileStorage typeinfo', cls: "fn" },
                    { addr: "0x0520010", name: 'itab.fun[1] = Load', val: '0x0406800 → FileStorage.Load', cls: "fn" },
                ]
            },
        ],
        heapB: 8604, stackB: 24,
    },
    {
        name: "AddTask(): input validation TrimSpace", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack"],
        lines: [126, 127, 128, 129],
        code: `<span class="kw">func</span> (tm *<span class="ty">TaskManager</span>) <span class="fn">AddTask</span>(
    title, description <span class="kw">string</span>, priority <span class="ty">Priority</span>) <span class="kw">error</span> {

  <span class="kw">if</span> strings.<span class="fn">TrimSpace</span>(title) == <span class="st">""</span> {
      <span class="kw">return</span> errors.<span class="fn">New</span>(<span class="st">"task title cannot be empty"</span>)
  }
<span class="cm">// TrimSpace: returns sub-slice of title — ZERO allocation
// Adjusts ptr and len, does NOT copy bytes
// == "" checks len == 0, does NOT touch heap
// title = "Fix login bug" (len=13) → validation passes
// If failed: errors.New() → small heap struct → early return
//   (mutex would never be locked in that path)</span>`,
        desc: `A new stack frame for <code>AddTask</code> is pushed. In Go 1.17+, arguments are passed via <strong>CPU registers</strong> (AX/BX for title ptr+len, CX/DX for desc ptr+len, R8 for priority) and then spilled to the stack. <code>strings.TrimSpace(title)</code> returns a <strong>sub-slice</strong> of the original, just adjusting the data pointer and length, with <strong>zero allocation, zero heap touch</strong>. The <code>== ""</code> comparison checks <code>len == 0</code>. Since title is "Fix login bug" (len=13), validation passes. If it had failed, <code>errors.New()</code> would allocate a small heap struct for the error value, return early, and the mutex would never be locked, saving a potentially expensive atomic operation.`,
        cpu: "M0/G1 · args arrive in AX/BX/CX/DX/R8 (register ABI) · CALL strings.TrimSpace → sub-slice (no alloc) · CMPQ len,0 · JNZ continue",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame: newly pushed", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F28", name: "title.ptr", val: "0xC000051000 (heap)", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F30", name: "title.len", val: "13  ('Fix login bug')", tag: "new" },
                    { addr: "0xC000011F38", name: "desc.ptr", val: "0xC000053000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F40", name: "desc.len", val: "22  ('Added via command line')", tag: "new" },
                    { addr: "0xC000011F48", name: "priority Priority", val: "1 = Medium", tag: "new" },
                    { addr: "0xC000011F50", name: "trimmed.ptr (temp)", val: "0xC000051000 (SAME ptr, no copy!)", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F58", name: "trimmed.len (temp)", val: "13 (no whitespace trimmed)", tag: "new" },
                ]
            },
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "no new allocations: TrimSpace is zero-alloc", lbl: "heap-lbl", rows: [
                    { addr: "0xC000051000", name: "title [13]byte", val: '"Fix login bug", same ptr reused by trimmed', cls: "str" },
                    { addr: "0xC000070000", name: "TaskManager (unchanged)", val: "tasks.len=0, nextID=1, mutex=0", cls: "nil" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x040C100", name: "strings.TrimSpace (zero-alloc, sub-slice)", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata: error message ready if validation fails', rows: [
                    { addr: "0x0500050", name: 'errEmptyTitle', val: '"task title cannot be empty"', cls: "str" },
                ]
            },
        ],
        heapB: 8518, stackB: 80,
    },
    {
        name: "AddTask(): mutex.Lock()", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "mutex"],
        lines: [126, 130, 131],
        code: `<span class="kw">func</span> (tm *<span class="ty">TaskManager</span>) <span class="fn">AddTask</span>(
    title, description <span class="kw">string</span>, priority <span class="ty">Priority</span>) <span class="kw">error</span> {

  <span class="kw">if</span> strings.<span class="fn">TrimSpace</span>(title) == <span class="st">""</span> {
    <span class="kw">return</span> errors.<span class="fn">New</span>(<span class="st">"task title cannot be empty"</span>)
  }
  tm.mutex.<span class="hl">Lock</span>()          <span class="cm">// ← atomic write to heap</span>
  <span class="kw">defer</span> tm.mutex.<span class="fn">Unlock</span>()  <span class="cm">// ← registered in defer chain</span>`,
        desc: `New stack frame for <code>AddTask</code>. The <code>title</code> and <code>description</code> params are <strong>string headers</strong> (ptr+len, 16B each) passed via CPU registers (AX/BX, CX/DX since Go 1.17 register ABI). <code>mutex.Lock()</code> performs an atomic CAS (<em>compare-and-swap</em>) on <code>mutex.state</code> at address <code>0xC000070030</code> in the heap. No allocation: it modifies existing memory. <code>defer</code> pushes an entry onto G1's defer chain (on stack).`,
        cpu: "M0/G1 · args via registers AX,BX,CX,DX,R8 · CALL sync.RWMutex.Lock → LOCK CMPXCHG [0xC000070030],0,1",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F28", name: "title.ptr", val: "0xC000080000 (heap)", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F30", name: "title.len", val: "13 (Fix login bug)", tag: "new" },
                    { addr: "0xC000011F38", name: "desc.ptr", val: "0xC000080020", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F40", name: "desc.len", val: "22  ('Added via command line')", tag: "new" },
                    { addr: "0xC000011F48", name: "priority Priority", val: "1 = Medium", tag: "new" },
                    { addr: "0xC000011F50", name: "defer: mutex.Unlock", val: "fn=0x0409000 sp=...", tag: "new" },
                    { addr: "0xC000011F58", name: "return addr", val: "0x0401090 → main()", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager: mutex.state LOCKED", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr", val: "nil", cls: "nil" },
                    { addr: "0xC000070028", name: "nextID", val: "1" },
                    { addr: "0xC000070030", name: "mutex.state", val: "1 = LOCKED", cls: "bt", tag: "upd" },
                    { addr: "0xC000070034", name: "mutex.sema", val: "0" },
                ]
            },
            {
                grp: "string backing arrays (caller-allocated)", lbl: "heap-lbl", rows: [
                    { addr: "0xC000080000", name: "title bytes [13]", val: '"Fix login bug"', cls: "str", tag: "new" },
                    { addr: "0xC000080020", name: "desc bytes [22]", val: '"Added via command line"', cls: "str", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x0409000", name: "sync.(*RWMutex).Lock", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata', rows: [
                    { addr: "0x0500050", name: 'errEmptyTitle', val: '"task title cannot be empty"', cls: "str" },
                ]
            },
        ],
        heapB: 8649, stackB: 96,
    },
    {
        name: "task := Task{: escape analysis, mallocgc(88)", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap"],
        lines: [132],
        code: `task := <span class="ty">Task</span>{
<span class="cm">// Compile-time escape analysis detects:
//   task is passed to append() → stored in tm.tasks slice
//   → task outlives AddTask's stack frame
//   → must allocate on HEAP, not stack
// runtime.mallocgc(88) called:
//   88 = ID(8)+Title hdr(16)+Desc hdr(16)+Priority(8)
//         +Completed(1)+pad(7)+CreatedAt(24)+CompletedAt ptr(8)
//   Verify: go build -gcflags="-m" prints "task escapes to heap"
//   Verify: unsafe.Sizeof(Task{}) == 88
// Returns pointer to zeroed 88-byte block on heap.</span>`,
        desc: `At <strong>compile time</strong>, escape analysis determines that <code>task</code> is passed to <code>append()</code>, meaning it will be stored in the <code>tm.tasks</code> backing array on the heap. It outlives <code>AddTask()</code>'s stack frame. So instead of placing the struct literal on the stack, the compiler emits a <code>runtime.mallocgc(88)</code> call. The allocator returns a pointer to a <strong>zeroed 88-byte block</strong> from a size-class span on the heap. All bytes are zero at this point, and fields are filled in the next instructions. You can verify this with <code>go build -gcflags="-m"</code> which prints "task escapes to heap", or with <code>unsafe.Sizeof(Task{})</code> which returns 88.`,
        cpu: "M0/G1 · (compile-time: escape analysis detected append(tasks, task)) · CALL runtime.mallocgc(88) → 0xC000090000 · zero 88B",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011F28", name: "title.ptr", val: "0xC000051000", cls: "ptr" },
                    { addr: "0xC000011F30", name: "title.len", val: "13" },
                    { addr: "0xC000011F48", name: "priority", val: "1 = Medium" },
                    { addr: "0xC000011F60", name: "&task (local ptr)", val: "0xC000090000", cls: "ptr", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "Task (88 bytes, ZEROED) @ 0xC000090000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000090000", name: "ID int", val: "0 (zero, not filled yet)", tag: "new" },
                    { addr: "0xC000090008", name: "Title.ptr", val: "nil (zero)", cls: "nil", tag: "new" },
                    { addr: "0xC000090030", name: "Completed bool", val: "false (zero)", cls: "bf", tag: "new" },
                    { addr: "0xC000090050", name: "CompletedAt", val: "nil (zero)", cls: "nil", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(88): Task escapes", active: true },
        ],
        data_seg: [],
        heapB: 8649, stackB: 104,
    },
    {
        name: "ID: tm.nextID, Title: title, Priority: priority, Completed: false", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap"],
        lines: [133, 134, 135, 136, 137],
        code: `task := <span class="ty">Task</span>{
    ID:          <span class="hl">tm.nextID</span>,     <span class="cm">// READ from heap → write to heap</span>
    Title:       <span class="hl">title</span>,         <span class="cm">// copy string header (ptr+len)</span>
    Description: <span class="hl">description</span>,   <span class="cm">// copy string header</span>
    Priority:    <span class="hl">priority</span>,      <span class="cm">// copy int from stack register</span>
    Completed:   <span class="hl">false</span>,         <span class="cm">// zero — already zeroed by mallocgc</span>
<span class="cm">// Each assignment is a MOVQ (8 bytes) or MOVW to heap.
// tm.nextID: read 8B from [0xC000070028], write to [0xC000090000]
// title: two MOVQs — copy ptr+len from stack to heap struct
// Completed: false = 0 = already zero from mallocgc — SKIP!</span>`,
        desc: `The struct literal fields are written to the <strong>heap block</strong> allocated in the previous step. Each assignment is a simple memory write (MOVQ for 8-byte values). <code>ID: tm.nextID</code> reads 8 bytes from the TaskManager at <code>0xC000070028</code> then writes them to the Task struct at <code>0xC000090000</code>. <code>Title: title</code> copies 16 bytes (the string header: pointer + length) from the stack frame to <code>0xC000090008</code>. <code>Completed: false</code> is a <strong>no-op</strong>: the allocator already zeroed all bytes, so false (0x00) is already there. The compiler optimizes this away.`,
        cpu: "M0/G1 · MOVQ [0xC000070028] → [0xC000090000] (ID) · MOVQ/MOVQ title hdr → [0xC000090008] · MOVQ/MOVQ desc hdr → [0xC000090018] · MOVQ priority → [0xC000090028]",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F28", name: "title.ptr", val: "0xC000051000", cls: "ptr" },
                    { addr: "0xC000011F30", name: "title.len", val: "13" },
                    { addr: "0xC000011F48", name: "priority", val: "1 = Medium" },
                ]
            },
        ],
        heap: [
            {
                grp: "Task @ 0xC000090000: fields being written", lbl: "heap-lbl", rows: [
                    { addr: "0xC000090000", name: "ID int", val: "1", tag: "upd" },
                    { addr: "0xC000090008", name: "Title.ptr", val: "0xC000051000 → 'Fix login bug'", cls: "ptr", tag: "upd" },
                    { addr: "0xC000090010", name: "Title.len", val: "13", tag: "upd" },
                    { addr: "0xC000090018", name: "Description.ptr", val: "0xC000053000", cls: "ptr", tag: "upd" },
                    { addr: "0xC000090020", name: "Description.len", val: "22", tag: "upd" },
                    { addr: "0xC000090028", name: "Priority", val: "1 = Medium", tag: "upd" },
                    { addr: "0xC000090030", name: "Completed bool", val: "false (zero, skip write)", cls: "bf" },
                    { addr: "0xC000090050", name: "CompletedAt *time.Time", val: "nil (zero, skip write)", cls: "nil" },
                ]
            },
            {
                grp: "TaskManager: nextID READ for ID field", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070028", name: "nextID (READ)", val: "1 → copied to Task.ID", cls: "bt" },
                    { addr: "0xC000070030", name: "mutex.state", val: "1 = LOCKED", cls: "bt" },
                ]
            },
        ],
        code_seg: [{ addr: "0x0403000", name: "main.(*TaskManager).AddTask: field assignments", active: true }],
        data_seg: [],
        heapB: 8769, stackB: 104,
    },
    {
        name: "CreatedAt: time.Now(), SYSCALL clock_gettime", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap"],
        lines: [138],
        code: `    CreatedAt: time.<span class="fn">Now</span>(),
<span class="cm">// time.Now() does THREE things:
//   1. VDSO call: reads wall clock from kernel-mapped page
//      (no full syscall — user-space reads kernel memory)
//   2. Read monotonic clock via SYSCALL clock_gettime(CLOCK_MONOTONIC)
//      → kernel writes into a stack buffer
//   3. Packs result into time.Time struct (24 bytes):
//      wall   uint64 = wall clock nanoseconds + hasMonotonic flag
//      ext    int64  = monotonic reading (offsetted)
//      loc    *Location = pointer to time.UTC (data segment)
// No heap allocation — time.Time is a VALUE TYPE (24B)</span>`,
        desc: `<code>time.Now()</code> is one of the most interesting runtime calls. It uses the <strong>vDSO</strong> (virtual Dynamic Shared Object), a kernel-mapped page in user address space, to read the wall clock without a full syscall context switch. The monotonic clock does require a syscall. The result is a <strong>24-byte value type</strong> (<code>wall</code> + <code>ext</code> + <code>loc</code>). This value is written directly into the Task struct's <code>CreatedAt</code> field at <code>0xC000090038</code>, with no extra heap allocation. The <code>loc</code> field points to <code>time.UTC</code>, a global singleton in the data segment (not the heap).`,
        cpu: "M0/G1 · CALL time.Now → vDSO read wall clock → SYSCALL clock_gettime(MONO) → pack 24B value → MOVQ×3 → [0xC000090038]",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame: time.Time written to heap directly", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011F60", name: "&task (heap ptr)", val: "0xC000090000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "Task @ 0xC000090000: CreatedAt written", lbl: "heap-lbl", rows: [
                    { addr: "0xC000090000", name: "ID int", val: "1" },
                    { addr: "0xC000090008", name: "Title.ptr", val: "0xC000051000", cls: "ptr" },
                    { addr: "0xC000090028", name: "Priority", val: "1 = Medium" },
                    { addr: "0xC000090030", name: "Completed bool", val: "false", cls: "bf" },
                    { addr: "0xC000090038", name: "CreatedAt.wall", val: "13909876543210 (nsec, hasMonotonic bit=1)", tag: "upd" },
                    { addr: "0xC000090040", name: "CreatedAt.ext", val: "8765432 (monotonic offset ns)", tag: "upd" },
                    { addr: "0xC000090048", name: "CreatedAt.loc *Location", val: "0x0515000 → time.UTC", cls: "ptr", tag: "upd" },
                    { addr: "0xC000090050", name: "CompletedAt *time.Time", val: "nil", cls: "nil" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x040C000", name: "time.Now (vDSO + SYSCALL clock_gettime)", active: true },
        ],
        data_seg: [
            {
                grp: '.data: time.UTC is a global pointer, NOT heap', rows: [
                    { addr: "0x0515000", name: "time.UTC *Location", val: "global singleton (data segment)", cls: "fn" },
                ]
            },
        ],
        heapB: 8769, stackB: 96,
    },
    {
        name: "tm.tasks = append(tm.tasks, task): growslice", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap"],
        lines: [139, 140],
        code: `tm.tasks = <span class="fn">append</span>(tm.tasks, task)
<span class="cm">// append() runtime logic (simplified):
//   if len < cap:
//       array[len] = task; return {ptr, len+1, cap}  // no alloc!
//   else: // our case: len=0, cap=0 → must grow
//       newCap = runtime.growslice computes new cap
//       newPtr = mallocgc(sizeof(Task) * newCap)
//       memmove(newPtr, oldPtr, sizeof(Task)*len)
//       newPtr[len] = task
//       return {newPtr, len+1, newCap}
// The NEW slice header {ptr,len,cap} is written back
// to tm.tasks in the TaskManager struct on the heap.</span>`,
        desc: `<code>append</code> first checks if <code>len &lt; cap</code>. Since both are 0, it calls <code>runtime.growslice</code>. For the first element, new cap = 1. A new backing array of 88 bytes is allocated via <code>mallocgc(88)</code> at <code>0xC0000A0000</code>. The Task struct (88 bytes) is copied into <code>array[0]</code> via <code>memmove</code>. The returned new slice header (ptr=new, len=1, cap=1) is written to <code>tm.tasks</code> inside the TaskManager struct on the heap via three 8-byte writes. The <strong>original Task at 0xC000090000</strong> is now unreferenced and the GC will reclaim it. Note: <code>append</code> never directly touches your stack. It returns a new header that you assign back.`,
        cpu: "M0/G1 · len(0)==cap(0) → CALL runtime.growslice → mallocgc(88)→0xC0000A0000 · memmove(88B) · MOVQ×3 update tm.tasks hdr",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager: tasks slice header UPDATED", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr", val: "0xC0000A0000 (was nil)", cls: "ptr", tag: "upd" },
                    { addr: "0xC000070008", name: "tasks.len", val: "1 (was 0)", tag: "upd" },
                    { addr: "0xC000070010", name: "tasks.cap", val: "1 (was 0)", tag: "upd" },
                ]
            },
            {
                grp: "NEW backing array []Task @ 0xC0000A0000 (mallocgc(88))", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000A0000", name: "[0].ID", val: "1", tag: "new" },
                    { addr: "0xC0000A0008", name: "[0].Title.ptr", val: "0xC000051000", cls: "ptr", tag: "new" },
                    { addr: "0xC0000A0010", name: "[0].Title.len", val: "13", tag: "new" },
                    { addr: "0xC0000A0028", name: "[0].Priority", val: "1 = Medium", tag: "new" },
                    { addr: "0xC0000A0030", name: "[0].Completed", val: "false", cls: "bf", tag: "new" },
                    { addr: "0xC0000A0038", name: "[0].CreatedAt.wall", val: "13909876543210", tag: "new" },
                    { addr: "0xC0000A0050", name: "[0].CompletedAt", val: "nil", cls: "nil", tag: "new" },
                ]
            },
            {
                grp: "OLD Task @ 0xC000090000: now unreachable (GC eligible)", lbl: "freed-lbl", rows: [
                    { addr: "0xC000090000", name: "(was original task literal)", val: "no live pointer → GC will reclaim", cls: "stale", tag: "free" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x040D000", name: "runtime.growslice", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(88): new backing array", active: true },
        ],
        data_seg: [],
        heapB: 8889, stackB: 80,
    },
    {
        name: "tm.nextID++: in-place heap increment (ADDQ)", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap"],
        lines: [141],
        code: `tm.nextID++
<span class="cm">// Compiled to a single atomic-class instruction:
//   ADDQ $1, [0xC000070028]
//   (or: MOVQ [0xC000070028] → AX; INCQ AX; MOVQ AX → [0xC000070028])
// tm is a *TaskManager — dereference required:
//   load ptr from stack (0xC000070000), then add at offset +0x28
// This is NOT atomic! Protected only by mutex.state=1 (LOCKED).
// nextID goes from 1 → 2.
// The mutex.Lock earlier in this function ensures no other
// goroutine can race this write.</span>`,
        desc: `<code>tm.nextID++</code> is a <strong>read-modify-write to the heap</strong>. The CPU loads the 8-byte integer at <code>0xC000070028</code> (offset 0x28 inside TaskManager), adds 1, and writes back. This is two memory accesses but it is <strong>not atomic</strong>. It is only safe because <code>mutex.Lock()</code> was called earlier in this function. If you removed the mutex, two goroutines calling <code>AddTask</code> concurrently could both read the same <code>nextID</code>, increment to the same value, and assign duplicate IDs, a classic data race. <code>go build -race</code> would catch this.`,
        cpu: "M0/G1 · MOVQ [0xC000070000+0x28] → AX · INCQ AX · MOVQ AX → [0xC000070028] (protected by mutex, not itself atomic)",
        goroutines: [{ id: "G1", state: "run", fn: "AddTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager: nextID incremented", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070028", name: "nextID int", val: "2 (was 1)", tag: "upd" },
                    { addr: "0xC000070030", name: "mutex.state", val: "1 = LOCKED (protecting this write!)", cls: "bt" },
                    { addr: "0xC000070000", name: "tasks.ptr", val: "0xC0000A0000", cls: "ptr" },
                    { addr: "0xC000070008", name: "tasks.len", val: "1" },
                ]
            },
        ],
        code_seg: [{ addr: "0x0403000", name: "main.(*TaskManager).AddTask: ADDQ nextID", active: true }],
        data_seg: [],
        heapB: 8889, stackB: 80,
    },
    {
        name: "AddTask(): storage.Save() interface dispatch", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "heap", "interface"],
        lines: [142],
        code: `  <span class="kw">return</span> tm.storage.<span class="fn">Save</span>(tm.tasks)
<span class="cm">// Interface dispatch:
//   1. Load tm.storage.itab from heap  → 0x0520000
//   2. Load itab.fun[0]               → 0x0406000 (FileStorage.Save)
//   3. Load tm.storage.data from heap → 0xC000060000 (FileStorage ptr)
//   4. JMP 0x0406000 with data as receiver
// Inside FileStorage.Save:
//   json.MarshalIndent(tasks) → mallocgc(~256B) temp buffer
//   os.WriteFile("tasks.json", data, 0644) → SYSCALL write
//   temp buffer GC-eligible after Save returns</span>`,
        desc: `<code>tm.storage.Save(tm.tasks)</code> performs <strong>interface dispatch</strong>: the CPU reads <code>tm.storage.itab</code> from the heap (16 bytes), dereferences to the itab table, reads <code>fun[0]</code> (the Save function pointer), loads the concrete data pointer (<code>FileStorage</code>), and jumps. Inside <code>FileStorage.Save</code>, <code>json.MarshalIndent</code> allocates a temporary <code>[]byte</code> buffer on the heap to hold the JSON output. A <code>write</code> syscall flushes bytes to disk. This temp buffer has no references after Save returns, so the GC will reclaim it. This is why <code>Save</code> has an <code>error</code> return type: I/O can always fail.`,
        cpu: "M0/G1 · [0xC000070018]=0x0520000 → itab.fun[0]=0x0406000 · JMP FileStorage.Save · json.MarshalIndent → mallocgc(256B) · SYSCALL write",
        goroutines: [{ id: "G1", state: "run", fn: "FileStorage.Save()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "FileStorage.Save() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011EE0", name: "fs *FileStorage receiver", val: "0xC000060000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011EE8", name: "tasks.ptr", val: "0xC0000A0000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011EF0", name: "tasks.len", val: "1", tag: "new" },
                    { addr: "0xC000011EF8", name: "data []byte (JSON buf)", val: "0xC000052000 (temp)", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F00", name: "err error", val: "nil (write OK)", cls: "nil", tag: "new" },
                ]
            },
            {
                grp: "AddTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F20", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011F50", name: "defer: mutex.Unlock", val: "fn=0x0409000 (pending)", tag: "" },
                ]
            },
        ],
        heap: [
            {
                grp: "JSON encode buffer (temp) @ 0xC000052000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000052000", name: "[]byte JSON output", val: '[{"id":1,"title":"Fix login bug",...}]', cls: "str", tag: "new" },
                    { addr: "0xC000052100", name: "(over-allocated cap)", val: "~256 B, standard allocator behavior", tag: "new" },
                ]
            },
            {
                grp: "TaskManager: itab used for dispatch", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070018", name: "storage.itab", val: "0x0520000, dispatch source", cls: "ptr" },
                    { addr: "0xC000070000", name: "tasks.ptr", val: "0xC0000A0000", cls: "ptr" },
                    { addr: "0xC000070030", name: "mutex.state", val: "1 = LOCKED", cls: "bt" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x0406000", name: "main.(*FileStorage).Save", active: true },
            { addr: "0x040A000", name: "encoding/json.MarshalIndent", active: true },
            { addr: "0x0520000", name: "itab.fun[0] = Save (dispatch table)", active: true },
        ],
        data_seg: [],
        heapB: 8969, stackB: 128,
    },
    {
        name: "defer + mutex.Unlock() + return", fn: "(*TaskManager).AddTask()", group: "AddTask()",
        tags: ["stack", "mutex"],
        lines: [130, 131, 142, 143],
        code: `  <span class="kw">return</span> tm.storage.<span class="fn">Save</span>(tm.tasks)
  <span class="cm">// ↑ interface dispatch: itab → FileStorage.Save()
  // defer fires AFTER return value set:
  //   tm.mutex.Unlock() → LOCK XCHG [mutex.state], 0
  // AddTask() stack frame POPPED
  // SP moves back up → locals disappear instantly
  // No GC needed for stack memory</span>`,
        desc: `Before returning, Go's interface dispatch looks up <code>itab[0x0520000].fun[0]</code> → <code>FileStorage.Save</code>. Then the <code>defer</code> runs: <code>mutex.Unlock()</code> atomically clears <code>mutex.state</code> back to 0. Finally the frame is <strong>popped</strong> — SP increments, all stack-local vars (title header, desc header, priority, defer entry) <em>instantly cease to exist</em>. No GC involved. Back in <code>main()</code>'s frame.`,
        cpu: "M0/G1 · interface dispatch → CALL FileStorage.Save · SYSCALL write(tasks.json) · LOCK XCHG [0xC000070030]→0 · RET · SP+=frame",
        goroutines: [{ id: "G1", state: "run", fn: "main()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "main() frame — AddTask frame GONE", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager — mutex UNLOCKED", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr", val: "0xC0000A0000", cls: "ptr" },
                    { addr: "0xC000070008", name: "tasks.len", val: "1" },
                    { addr: "0xC000070028", name: "nextID", val: "2" },
                    { addr: "0xC000070030", name: "mutex.state", val: "0 = UNLOCKED", cls: "bf", tag: "upd" },
                ]
            },
            {
                grp: "[]Task backing array", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000A0000", name: "[0].ID", val: "1" },
                    { addr: "0xC0000A0008", name: "[0].Title.ptr", val: "0xC000080000", cls: "ptr" },
                    { addr: "0xC0000A0030", name: "[0].Completed", val: "false", cls: "bf" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0403000", name: "main.(*TaskManager).AddTask", active: true },
            { addr: "0x0406000", name: "main.(*FileStorage).Save", active: true },
            { addr: "0x0409000", name: "sync.(*RWMutex).Unlock", active: true },
        ],
        data_seg: [],
        heapB: 8889, stackB: 16,
    },
    {
        name: "GetTasks() — RLock + make copy", fn: "(*TaskManager).GetTasks()", group: "GetTasks()",
        tags: ["stack", "heap", "mutex"],
        lines: [145, 146, 147, 148, 149, 150, 151],
        code: `<span class="kw">func</span> (tm *<span class="ty">TaskManager</span>) <span class="fn">GetTasks</span>() []<span class="ty">Task</span> {
    tm.mutex.<span class="hl">RLock</span>()           <span class="cm">// multiple readers OK</span>
    <span class="kw">defer</span> tm.mutex.<span class="fn">RUnlock</span>()

    tasksCopy := <span class="fn">make</span>([]<span class="ty">Task</span>, <span class="fn">len</span>(tm.tasks))
    <span class="fn">copy</span>(tasksCopy, tm.tasks)  <span class="cm">// deep copy 88B×len</span>
    <span class="kw">return</span> tasksCopy
}`,
        desc: `<code>RLock()</code> allows multiple concurrent readers — it atomically increments <code>readerCount</code>. <code>make([]Task, 1)</code> calls <code>runtime.makeslice</code> → <code>mallocgc(88 × 1 = 88 bytes)</code> on the heap. <code>copy()</code> does a <strong>memmove</strong> of all 88 Task bytes. The returned slice header (ptr+len+cap, 24 bytes) is on the <em>caller's</em> stack. The backing array is on the heap. This defensive copy prevents callers from modifying the TaskManager's internal slice.`,
        cpu: "M0/G1 · LOCK ADD [readerCount],1 · CALL runtime.makeslice(88) → 0xC0000B0000 · memmove(88B) · RUnlock",
        goroutines: [{ id: "G1", state: "run", fn: "GetTasks()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "GetTasks() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F00", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F08", name: "tasksCopy.ptr", val: "0xC0000B0000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F10", name: "tasksCopy.len", val: "1", tag: "new" },
                    { addr: "0xC000011F18", name: "tasksCopy.cap", val: "1", tag: "new" },
                ]
            },
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "NEW copy of []Task @ 0xC0000B0000 (88 bytes)", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000B0000", name: "copy[0].ID", val: "1", tag: "new" },
                    { addr: "0xC0000B0008", name: "copy[0].Title.ptr", val: "0xC000080000", cls: "ptr", tag: "new" },
                    { addr: "0xC0000B0030", name: "copy[0].Completed", val: "false", cls: "bf", tag: "new" },
                ]
            },
            {
                grp: "TaskManager — readerCount incremented", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070030", name: "mutex.state", val: "0 = unlocked" },
                    { addr: "0xC000070040", name: "mutex.readerCount", val: "1 (reading)", cls: "bt", tag: "upd" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0405000", name: "main.(*TaskManager).GetTasks", active: true },
            { addr: "0x040E000", name: "runtime.makeslice", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(88)", active: true },
        ],
        data_seg: [],
        heapB: 9009, stackB: 64,
    },
    {
        name: "CompleteTask() + MarkComplete() — pointer escape", fn: "(*Task).MarkComplete()", group: "CompleteTask()",
        tags: ["stack", "heap", "mutex"],
        lines: [61, 62, 63, 64, 65, 153, 154, 155, 156, 157, 158, 159, 160],
        code: `<span class="cm">// CompleteTask → finds task → calls MarkComplete</span>
<span class="kw">func</span> (t *<span class="ty">Task</span>) <span class="fn">MarkComplete</span>() {
    t.Completed = <span class="hl">true</span>         <span class="cm">// write to heap in-place</span>
    now := time.<span class="fn">Now</span>()          <span class="cm">// local var on stack...</span>
    t.CompletedAt = &<span class="hl">now</span>       <span class="cm">// &now → now ESCAPES!</span>
}
<span class="cm">// Escape analysis (compile time):
//   'now' address taken AND stored beyond func lifetime
//   → now moved from stack to HEAP
//   → mallocgc(24 bytes) called at runtime</span>`,
        desc: `Key concept: <code>&now</code> takes the address of a local variable. Because that address is stored in <code>t.CompletedAt</code> which lives on the heap, <code>now</code> must <strong>outlive MarkComplete's stack frame</strong>. Go's escape analysis (compile time) detects this and emits a <code>mallocgc(24)</code> call instead of a stack allocation. <code>t.Completed = true</code> is a direct write to the heap (the backing array). Two writes to the heap in one function call.`,
        cpu: "M0/G1 · MOVB $1 → [0xC0000A0030] (Completed) · mallocgc(24) → 0xC0000C0000 · SYSCALL clock_gettime · MOVQ ptr → [0xC0000A0050]",
        goroutines: [{ id: "G1", state: "run", fn: "MarkComplete()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "MarkComplete() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011EE0", name: "t *Task receiver", val: "0xC0000A0000 → tasks[0]", cls: "ptr", tag: "new" },
                    { addr: "0xC000011EE8", name: "now → ESCAPED", val: "(moved to heap 0xC0000C0000)", cls: "nil", tag: "new" },
                ]
            },
            {
                grp: "CompleteTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F00", name: "id int param", val: "1", tag: "new" },
                    { addr: "0xC000011F08", name: "return addr", val: "0x0401120", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "main() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "tasks[0] — UPDATED in-place", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000A0030", name: "Completed bool", val: "true ✓", cls: "bt", tag: "upd" },
                    { addr: "0xC0000A0050", name: "CompletedAt *time.Time", val: "0xC0000C0000", cls: "ptr", tag: "upd" },
                ]
            },
            {
                grp: "time.Time (escaped from stack) @ 0xC0000C0000", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000C0000", name: "wall uint64", val: "13909999999000", tag: "new" },
                    { addr: "0xC0000C0008", name: "ext int64", val: "8766000 (monotonic)", tag: "new" },
                    { addr: "0xC0000C0010", name: "loc *Location", val: "0x0515000 → UTC", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "TaskManager", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070030", name: "mutex.state", val: "1 = LOCKED", cls: "bt" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0404000", name: "main.(*TaskManager).CompleteTask", active: true },
            { addr: "0x040F000", name: "main.(*Task).MarkComplete", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc(24) — now escaped", active: true },
        ],
        data_seg: [
            {
                grp: '.rodata', rows: [
                    { addr: "0x0515000", name: "time.UTC global", val: "singleton ptr", cls: "fn" },
                ]
            },
        ],
        heapB: 8913, stackB: 112,
    },
    {
        name: "DeleteTask() — slice re-slice trick", fn: "(*TaskManager).DeleteTask()", group: "DeleteTask()",
        tags: ["stack", "heap", "mutex"],
        lines: [165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175],
        code: `<span class="kw">for</span> i, task := <span class="kw">range</span> tm.tasks {
    <span class="kw">if</span> task.ID == id {
tm.tasks = <span class="fn">append</span>(
    tm.tasks[:<span class="hl">i</span>],       <span class="cm">// slice up to i</span>
    tm.tasks[<span class="hl">i+1</span>:]...,  <span class="cm">// rest after i</span>
)
<span class="kw">return</span> tm.storage.<span class="fn">Save</span>(tm.tasks)
    }
}
<span class="cm">// append(a[:i], a[i+1:]...) when len-1 ≤ cap:
//   → NO new allocation
//   → memmove shifts elements left in same array
//   → tasks.len-- on the heap header</span>`,
        desc: `The <code>append(tasks[:i], tasks[i+1:]...)</code> idiom is clever: since we're removing one element, the new length fits within the existing capacity — <strong>no new allocation</strong>. Go calls <code>memmove</code> to shift elements left. The slice header's <code>len</code> is decremented by 1 (in-place on heap). The last slot still holds stale data but is <strong>beyond len</strong> — unreachable and GC-eligible. The loop variable <code>task</code> is a <em>value copy</em> on the stack.`,
        cpu: "M0/G1 · mutex.Lock · loop: CMPQ task.ID,id · memmove(tasks[i+1:]) · DECQ [tasks.len] · CALL Save · Unlock",
        goroutines: [{ id: "G1", state: "run", fn: "DeleteTask()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "DeleteTask() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F00", name: "id int", val: "1", tag: "new" },
                    { addr: "0xC000011F08", name: "i int (loop)", val: "0", tag: "new" },
                    { addr: "0xC000011F10", name: "task Task (VALUE COPY)", val: "copy of tasks[0] — 88B on stack", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "TaskManager — after delete", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "tasks.ptr", val: "0xC0000A0000 (same)", cls: "ptr" },
                    { addr: "0xC000070008", name: "tasks.len", val: "0 (was 1)", tag: "upd" },
                    { addr: "0xC000070010", name: "tasks.cap", val: "1 (unchanged)", tag: "upd" },
                ]
            },
            {
                grp: "backing array — stale data past len=0", lbl: "freed-lbl", rows: [
                    { addr: "0xC0000A0000", name: "[0] (past len, stale)", val: "unreachable → GC eligible", cls: "stale", tag: "free" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0404800", name: "main.(*TaskManager).DeleteTask", active: true },
            { addr: "0x0406000", name: "main.(*FileStorage).Save", active: true },
            { addr: "0x040D000", name: "runtime.memmove (no growslice)", active: true },
        ],
        data_seg: [],
        heapB: 8793, stackB: 160,
    },
    {
        name: "GetTasksByPriority() — hmap & bucket alloc", fn: "(*TaskManager).GetTasksByPriority()", group: "Bonus Methods",
        tags: ["stack", "heap", "mutex"],
        lines: [177, 178, 179, 180, 181, 182, 183, 184, 185],
        code: `<span class="kw">func</span> (tm *<span class="ty">TaskManager</span>) <span class="fn">GetTasksByPriority</span>() <span class="kw">map</span>[<span class="ty">Priority</span>][]<span class="ty">Task</span> {
    tm.mutex.<span class="fn">RLock</span>()
    <span class="kw">defer</span> tm.mutex.<span class="fn">RUnlock</span>()
    priorityMap := <span class="fn">make</span>(<span class="kw">map</span>[<span class="ty">Priority</span>][]<span class="ty">Task</span>)
    <span class="kw">for</span> _, task := <span class="kw">range</span> tm.tasks {
priorityMap[task.Priority] = <span class="fn">append</span>(priorityMap[task.Priority], task)
    }
    <span class="kw">return</span> priorityMap
}
<span class="cm">// make(map) → runtime.makemap:
//   allocs hmap struct  (~56 B) — count, B, hash0, buckets ptr
//   allocs bucket array (~256 B) — 8 key-value slots per bucket
// Key = Priority (int, 8B)  Value = []Task (slice hdr, 24B)
// map assign → runtime.mapassign_fast64
//   hashes key with hash0 (random seed — HashDoS defense)
//   finds bucket → writes key+value inline in bucket
// Map escapes to heap (returned as retval)</span>`,
        desc: `<code>make(map[Priority][]Task)</code> calls <code>runtime.makemap</code> which allocates two things on the heap: (1) an <strong>hmap struct</strong> (~56 bytes) holding count, log2(nBuckets) in field <code>B</code>, a random <code>hash0</code> seed (HashDoS defense), and a <code>buckets</code> pointer; (2) an initial <strong>bucket array</strong> (~256 bytes) where each bucket holds 8 key-value pairs with a <code>tophash</code> array for fast lookup. The map key is <code>Priority</code> (int, 8 bytes) and the value is <code>[]Task</code> (slice header, 24 bytes). Writing <code>priorityMap[task.Priority] = append(...)</code> calls <code>runtime.mapassign_fast64</code>, which hashes the key, locates the bucket, and writes inline. The map itself escapes to the heap because it is returned.`,
        cpu: "M0/G1 · RLock · CALL runtime.makemap → mallocgc(56) hmap + mallocgc(256) bucket · mapassign_fast64 · RUnlock",
        goroutines: [{ id: "G1", state: "run", fn: "GetTasksByPriority()", stack: "0xC000010000–0xC000012000" }],
        stack: [
            {
                grp: "GetTasksByPriority() frame", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011F00", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F08", name: "priorityMap ret (hmap ptr)", val: "0xC0000E0000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011F10", name: "loop: task (88B value copy)", val: "copy of tasks[0] on stack", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "hmap struct @ 0xC0000E0000 (56 bytes)", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000E0000", name: "count int", val: "1 (one entry added)", tag: "new" },
                    { addr: "0xC0000E0008", name: "flags uint8", val: "0 (not currently writing)", tag: "new" },
                    { addr: "0xC0000E0009", name: "B uint8", val: "0 (log2 nBuckets = 1 bucket)", tag: "new" },
                    { addr: "0xC0000E000C", name: "hash0 uint32", val: "0xA1B2C3D4 (random seed)", tag: "new" },
                    { addr: "0xC0000E0010", name: "buckets unsafe.Ptr", val: "0xC0000F0000", cls: "ptr", tag: "new" },
                ]
            },
            {
                grp: "bucket @ 0xC0000F0000 — 8 slots (key=Priority 8B, val=[]Task 24B)", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000F0000", name: "tophash[0..7]", val: "[0x82, 0, 0, 0, 0, 0, 0, 0]", tag: "new" },
                    { addr: "0xC0000F0008", name: "keys[0] Priority", val: "1 (Medium)", tag: "new" },
                    { addr: "0xC0000F0010", name: "values[0] []Task.ptr", val: "0xC0000A0000", cls: "ptr", tag: "new" },
                    { addr: "0xC0000F0018", name: "values[0] []Task.len", val: "1", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0407500", name: "main.(*TaskManager).GetTasksByPriority", active: true },
            { addr: "0x041A000", name: "runtime.makemap", active: true },
            { addr: "0x041B000", name: "runtime.mapassign_fast64", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc (hmap + bucket)", active: true },
        ],
        data_seg: [],
        heapB: 8981, stackB: 80,
    },
    {
        name: "ProcessTasksAsync() — goroutines + channels", fn: "(*TaskManager).ProcessTasksAsync()", group: "Goroutines",
        tags: ["heap", "goroutine", "mutex"],
        lines: [187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206],
        code: `taskChan := <span class="fn">make</span>(<span class="kw">chan</span> <span class="ty">Task</span>, <span class="fn">len</span>(tasks))  <span class="cm">// buffered</span>
done     := <span class="fn">make</span>(<span class="kw">chan</span> <span class="kw">bool</span>)               <span class="cm">// unbuffered</span>

<span class="kw">for</span> i := <span class="num">0</span>; i < MaxWorkers; i++ {
    <span class="kw">go func</span>(workerID <span class="kw">int</span>) {     <span class="cm">// G2, G3, G4 spawned</span>
<span class="kw">for</span> task := <span class="kw">range</span> taskChan {
    processor(task)
}
done <- <span class="hl">true</span>
    }(i)
}
<span class="kw">for</span> _, task := <span class="kw">range</span> tasks { taskChan <- task }
close(taskChan)
<span class="kw">for</span> i := <span class="num">0</span>; i < MaxWorkers; i++ { <-done }`,
        desc: `<code>make(chan Task, 1)</code> → <code>runtime.makechan</code> → allocates an <strong>hchan struct</strong> on the heap (ring buffer + mutex + send/recv queues). Each <code>go func(...)</code> statement calls <code>runtime.newproc</code>: allocates a <strong>runtime.g struct</strong> and a new <strong>8 KB stack</strong> on the heap for each goroutine. Now 4 goroutines exist: G1 (main, blocked on <code>&lt;-done</code>), G2/G3/G4 (workers, blocked on channel receive). The Go scheduler (on M0) context-switches between them.`,
        cpu: "M0 · makechan(Task,1)→0xC0000D0000 · newproc ×3 → G2,G3,G4 each get 8KB stack · G1 blocks on <-done",
        goroutines: [
            { id: "G1", state: "wait", fn: "<-done (blocked)", stack: "0xC000010000" },
            { id: "G2", state: "run", fn: "range taskChan", stack: "0xC000100000" },
            { id: "G3", state: "wait", fn: "range taskChan", stack: "0xC000102000" },
            { id: "G4", state: "wait", fn: "range taskChan", stack: "0xC000104000" },
        ],
        stack: [
            {
                grp: "ProcessTasksAsync() frame (G1)", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011ED0", name: "taskChan chan Task", val: "0xC0000D0000", cls: "ptr", tag: "new" },
                    { addr: "0xC000011ED8", name: "done chan bool", val: "0xC0000D0100", cls: "ptr", tag: "new" },
                    { addr: "0xC000011EE0", name: "tasks []Task hdr (copy)", val: "ptr=0xC0000B0000 len=1", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "hchan (taskChan) ring buffer @ 0xC0000D0000", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000D0000", name: "qcount uint", val: "0 (empty)", tag: "new" },
                    { addr: "0xC0000D0008", name: "dataqsiz uint", val: "1 (cap=len(tasks))", tag: "new" },
                    { addr: "0xC0000D0010", name: "buf unsafe.Ptr", val: "0xC0000D0080 → [Task]", cls: "ptr", tag: "new" },
                    { addr: "0xC0000D0018", name: "elemsize uint16", val: "88 (sizeof Task)", tag: "new" },
                    { addr: "0xC0000D0020", name: "closed uint32", val: "0 (open)", tag: "new" },
                ]
            },
            {
                grp: "G2 descriptor + 8KB stack @ 0xC000100000", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000E0000", name: "G2.goid", val: "2", tag: "new" },
                    { addr: "0xC0000E0008", name: "G2.stack.lo", val: "0xC000100000", cls: "ptr", tag: "new" },
                    { addr: "0xC0000E0010", name: "G2.status", val: "4 = Gwaiting (chan recv)", tag: "new" },
                ]
            },
            {
                grp: "G3 descriptor + 8KB stack @ 0xC000102000", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000F0000", name: "G3.goid", val: "3", tag: "new" },
                    { addr: "0xC0000F0010", name: "G3.status", val: "4 = Gwaiting", tag: "new" },
                ]
            },
            {
                grp: "G4 descriptor + 8KB stack @ 0xC000104000", lbl: "heap-lbl", rows: [
                    { addr: "0xC000100000", name: "G4.goid", val: "4", tag: "new" },
                    { addr: "0xC000100010", name: "G4.status", val: "4 = Gwaiting", tag: "new" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0405800", name: "main.(*TaskManager).ProcessTasksAsync", active: true },
            { addr: "0x0408000", name: "runtime.newproc (go stmt) ×3", active: true },
            { addr: "0x040A000", name: "runtime.makechan", active: true },
            { addr: "0x0407000", name: "runtime.mallocgc (hchan + G stacks)", active: true },
        ],
        data_seg: [
            {
                grp: '.bss', rows: [
                    { addr: "0x0510010", name: "MaxWorkers const", val: "3" },
                ]
            },
        ],
        heapB: 41880, stackB: 96,
    },
    {
        name: "ProcessTasksAsync() — channel send & goroutine wake", fn: "(*TaskManager).ProcessTasksAsync()", group: "Goroutines",
        tags: ["heap", "goroutine"],
        lines: [199, 200, 201, 202, 203, 204, 205],
        code: `<span class="cm">// G1: sender loop</span>
<span class="kw">for</span> _, task := <span class="kw">range</span> tasks {
    taskChan <- <span class="hl">task</span>   <span class="cm">// copy 88B into hchan ring buffer</span>
}
<span class="fn">close</span>(taskChan)         <span class="cm">// sets hchan.closed=1, wakes all receivers</span>
<span class="kw">for</span> i := <span class="nu">0</span>; i < MaxWorkers; i++ { <-done }  <span class="cm">// G1 blocks</span>

<span class="cm">// G2 (worker, now running):
//   <- taskChan: copies 88B from ring buffer → G2 stack
//   processor(task) called with task value copy
//   done <- true: wakes G1 from blocking recv
// Direct send opt: if receiver already waiting,
//   runtime copies sender stack → receiver stack directly
//   skipping the ring buffer entirely</span>`,
        desc: `Sending on a buffered channel (<code>taskChan &lt;- task</code>) calls <code>runtime.chansend</code>. It acquires the <strong>internal hchan lock</strong> (a spinlock inside the hchan struct, different from <code>sync.Mutex</code>), copies 88 bytes of the Task value <strong>directly into the ring buffer</strong> at <code>buf[sendx mod dataqsiz]</code>, increments <code>sendx</code> and <code>qcount</code>, then releases the lock. If a goroutine is already parked waiting to receive (G2 was sleeping), the runtime uses the <strong>direct send optimization</strong>: it copies straight from the sender's stack frame into G2's stack and schedules G2 — the ring buffer is bypassed entirely. After <code>close(taskChan)</code>, <code>hchan.closed</code> is set to 1 and all goroutines parked on receive (G3, G4) are woken immediately.`,
        cpu: "M0/G1 · chansend: hchan.lock → memcopy 88B → ring[0] → G2 scheduled · G1 blocks on <-done · G5 (M0 takes G2) · chanrecv → task on G2 stack",
        goroutines: [
            { id: "G1", state: "wait", fn: "<-done (blocked)", stack: "0xC000010000" },
            { id: "G2", state: "run", fn: "processor(task)", stack: "0xC000100000" },
            { id: "G3", state: "wait", fn: "range taskChan (idle, ch closed)", stack: "0xC000102000" },
            { id: "G4", state: "wait", fn: "range taskChan (idle, ch closed)", stack: "0xC000104000" },
        ],
        stack: [
            {
                grp: "G2 worker frame (currently running)", lbl: "frame-lbl", rows: [
                    { addr: "0xC000100F80", name: "workerID int", val: "0 (first worker)", tag: "new" },
                    { addr: "0xC000100F88", name: "task Task (88B recv copy)", val: "ID=1 Title='Fix login bug'", tag: "new" },
                ]
            },
        ],
        heap: [
            {
                grp: "hchan (taskChan) — after send+recv", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000D0000", name: "qcount uint", val: "0 (sent and consumed)", tag: "upd" },
                    { addr: "0xC0000D0008", name: "dataqsiz uint", val: "1 (cap)" },
                    { addr: "0xC0000D0020", name: "closed uint32", val: "1 (close() called)", cls: "bt", tag: "upd" },
                    { addr: "0xC0000D0080", name: "ring[0] Task", val: "(delivered — consumed by G2)", cls: "nil" },
                ]
            },
            {
                grp: "G1 status — blocked", lbl: "heap-lbl", rows: [
                    { addr: "0xC000044018", name: "G1.status", val: "4 = Gwaiting (chan recv)", tag: "upd" },
                ]
            },
            {
                grp: "G2 status — running", lbl: "heap-lbl", rows: [
                    { addr: "0xC0000E0018", name: "G2.status", val: "2 = Grunning", cls: "bt", tag: "upd" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0405800", name: "main.(*TaskManager).ProcessTasksAsync", active: true },
            { addr: "0x041C000", name: "runtime.chansend1 (G1 sender)", active: true },
            { addr: "0x041D000", name: "runtime.closechan", active: true },
            { addr: "0x041E000", name: "runtime.chanrecv1 (G2 receiver)", active: true },
        ],
        data_seg: [],
        heapB: 41880, stackB: 32,
    },
    {
        name: "GC Phase 0 — trigger: heapAlloc exceeds gcTrigger", fn: "runtime.gcStart()", group: "GC",
        tags: ["gc", "heap"],
        lines: [],
        code: `<span class="cm">// GC is triggered when:
//   heapAlloc >= gcTrigger
//   where gcTrigger = heapMarked × (1 + gcPercent/100)
//   GOGC=100 (default) → heap can double before GC starts
//
// Who triggers it?
//   runtime.mallocgc() checks after every allocation
//   OR: background goroutine G5 (sysmon) polls periodically
//
// runtime.gcStart():
//   sets gcphase = _GCmark
//   enables write barrier (all ptr writes now tracked)
//   sends signal to all Ps to begin GC assistance</span>`,
        desc: `The GC is <strong>not triggered after a fixed time</strong>. It fires when the total live heap reaches <code>gcTrigger = liveAfterLastGC × (1 + GOGC/100)</code>. With <code>GOGC=100</code> (default), the heap may grow to <strong>2× its post-GC size</strong> before the next cycle. The trigger check happens inside <code>runtime.mallocgc()</code> — every allocation potentially starts the GC. <code>runtime.gcStart()</code> sets the global <code>gcphase</code> variable to <code>_GCmark</code> and enables the <strong>write barrier</strong>: from this moment, every pointer write in user code is also recorded in a shadow buffer so the concurrent GC can track mutations.`,
        cpu: "G1 inside mallocgc() · heapAlloc >= gcTrigger · CALL runtime.gcStart · atomic store gcphase=_GCmark · write barrier ON",
        goroutines: [
            { id: "G1", state: "run", fn: "mallocgc() → gcStart()", stack: "0xC000010000" },
            { id: "G5 GC", state: "run", fn: "gcBgMarkWorker (starting)", stack: "0xC000110000" },
        ],
        stack: [
            {
                grp: "main() frame — G1 was doing a normal alloc", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "GC state transition", lbl: "heap-lbl", rows: [
                    { addr: "0x0518010", name: "gcphase (global)", val: "_GCmark (was _GCoff)", tag: "upd" },
                    { addr: "0x0518020", name: "writeBarrier.enabled", val: "1 (ON — was 0)", cls: "bt", tag: "upd" },
                    { addr: "0x0518000", name: "gcController.heapLive", val: "~41 KB (current)", tag: "" },
                    { addr: "0x0518008", name: "gcController.gcTrigger", val: "~40 KB threshold", tag: "" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0407000", name: "runtime.mallocgc (triggered GC)", active: true },
            { addr: "0x0413000", name: "runtime.gcStart", active: true },
            { addr: "0x0414000", name: "runtime.gcBgMarkWorker (G5 spawned)", active: true },
        ],
        data_seg: [
            {
                grp: "GC control variables in .data", rows: [
                    { addr: "0x0518000", name: "gcController struct", val: "heapLive, heapMarked, triggerRatio" },
                    { addr: "0x0518100", name: "mheap_ global struct", val: "all heap spans, free lists, mcentral" },
                    { addr: "0x0518200", name: "work struct", val: "markrootNext, nproc, nwait counters" },
                ]
            },
        ],
        heapB: 41880, stackB: 16,
    },
    {
        name: "GC Phase 1 — STW: stop all goroutines, scan roots", fn: "runtime.stopTheWorld()", group: "GC",
        tags: ["gc", "heap", "goroutine"],
        lines: [],
        code: `<span class="cm">// STW = Stop The World
// Duration: ~0.05 to 0.3 ms (Go 1.21 typical)
//
// runtime.stopTheWorld("GC mark termination"):
//   1. Sets preempt flag on all running goroutines
//   2. Each goroutine sees the flag at its next safe point
//      (function call, loop back-edge — not mid-instruction!)
//   3. Goroutines park themselves (status → Gwaiting)
//   4. STW complete when all Ps have no running G
//
// ROOTS are then recorded:
//   - Each goroutine's stack (ALL local variables, params)
//   - Global variables (BSS + data segment)
//   - CPU registers of each goroutine</span>`,
        desc: `Stop-the-world does NOT freeze the OS. It only stops <strong>Go goroutines</strong> at safe points. The runtime sets a preemption flag on each P (logical processor). Goroutines check this flag at <strong>function call preambles</strong> and loop back-edges — never mid-instruction. When a goroutine reaches a safe point, it parks itself (<code>status = Gwaiting</code>). Once all Ps have stopped, the runtime takes a <strong>snapshot of all goroutine stacks</strong> — these are the GC roots. Every pointer found on any stack is a root from which the mark phase will trace the heap graph. Stack variables are NEVER moved or freed by GC — only heap objects are managed.`,
        cpu: "M0 · setPreemptAll() → each G checks asyncPreempt at safe-point → Gwaiting · GC scans ALL stacks for pointer roots",
        goroutines: [
            { id: "G1", state: "wait", fn: "STW — parked at safe point", stack: "0xC000010000" },
            { id: "G2", state: "wait", fn: "STW — parked", stack: "0xC000100000" },
            { id: "G3", state: "wait", fn: "STW — parked", stack: "0xC000102000" },
            { id: "G5 GC", state: "run", fn: "stopTheWorld → scan roots", stack: "0xC000110000" },
        ],
        stack: [
            {
                grp: "G1 stack — SCANNED for roots (ALL ptrs recorded)", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager → ROOT", val: "0xC000070000 — traced!", cls: "ptr", tag: "upd" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage → ROOT", val: "0xC000060000 — traced!", cls: "ptr", tag: "upd" },
                ]
            },
        ],
        heap: [
            {
                grp: "Root set (what GC will trace from)", lbl: "heap-lbl", rows: [
                    { addr: "STACK", name: "G1 stack ptrs", val: "tm→0xC000070000, storage→0xC000060000", cls: "bt", tag: "new" },
                    { addr: "GLOBAL", name: ".data globals", val: "gcController, mheap_, time.UTC, itab tables", cls: "bt", tag: "new" },
                    { addr: "REGS", name: "CPU registers", val: "AX/BX/CX/DX/R8... saved in goroutine context", cls: "bt", tag: "new" },
                    { addr: "GSCHED", name: "G descriptors", val: "G1/G2/G3/G5 always reachable", cls: "bt", tag: "new" },
                ]
            },
            {
                grp: "GC phase state", lbl: "heap-lbl", rows: [
                    { addr: "0x0518010", name: "gcphase", val: "_GCmark (unchanged)", cls: "bt" },
                    { addr: "0x0518020", name: "writeBarrier.enabled", val: "1 (still ON)", cls: "bt" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0415000", name: "runtime.stopTheWorld", active: true },
            { addr: "0x0416000", name: "runtime.markroot (scan goroutine stacks)", active: true },
            { addr: "0x0417000", name: "runtime.scanstack (G1, G2, G3)", active: true },
        ],
        data_seg: [
            {
                grp: "globals that are GC roots", rows: [
                    { addr: "0x0515000", name: "time.UTC global", val: "root — always reachable", cls: "fn" },
                    { addr: "0x0520000", name: "itab<FileStorage,TaskStorage>", val: "root — always reachable", cls: "fn" },
                ]
            },
        ],
        heapB: 41880, stackB: 0,
    },
    {
        name: "GC Phase 2 — concurrent mark: trace all live objects", fn: "runtime.gcBgMarkWorker()", group: "GC",
        tags: ["gc", "heap", "goroutine"],
        lines: [],
        code: `<span class="cm">// Goroutines RESUME — GC runs concurrently with user code!
// G5 (gcBgMarkWorker) traces the heap graph:
//
// Mark queue (gcWork) is seeded with ROOT pointers.
// For each pointer in the queue:
//   1. Load the object it points to
//   2. Check its mark bit in the heap bitmap
//   3. If NOT marked: set mark bit + scan object for pointers
//   4. Add any found pointers to the queue
//
// Write barrier (Dijkstra hybrid) ensures correctness:
//   If user code writes ptr X → Y while GC runs:
//     old value of X.ptr is shaded grey (added to queue)
//     new value (Y) is also shaded grey
//   Prevents "black object points to white object" bug</span>`,
        desc: `After the brief STW, goroutines <strong>resume running</strong> while the GC mark phase runs concurrently in background goroutine G5 (<code>gcBgMarkWorker</code>). The mark phase uses a <strong>tri-color invariant</strong>: white (not yet seen), grey (seen but not scanned), black (fully scanned). Starting from the root set, G5 pulls grey objects, marks them black, and adds their pointer fields as new grey objects. The <strong>write barrier</strong> (enabled in Phase 0) intercepts any pointer writes by user code — if G1 creates a new pointer while G5 is marking, both the old and new targets are shaded grey to prevent incorrect collection. GC also uses <strong>goroutine assist</strong>: if G1 allocates faster than G5 can mark, G1 pauses and helps mark before its alloc completes.`,
        cpu: "G1 resumes user code (with write barrier overhead ~1-5%) · G5 pulls grey objects from gcWork queue · CALL scanobject → setmark bits",
        goroutines: [
            { id: "G1", state: "run", fn: "user code (with write barrier)", stack: "0xC000010000" },
            { id: "G5 GC", state: "run", fn: "gcBgMarkWorker → gcDrain", stack: "0xC000110000" },
        ],
        stack: [
            {
                grp: "main() frame — G1 running normally (with WB)", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000 ← BLACK (marked)", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000 ← BLACK", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "Mark status of heap objects", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "TaskManager", val: "BLACK — fully scanned", cls: "bt" },
                    { addr: "0xC000060000", name: "FileStorage", val: "BLACK — fully scanned", cls: "bt" },
                    { addr: "0xC0000A0000", name: "[]Task backing array", val: "BLACK — reached via tasks.ptr", cls: "bt" },
                    { addr: "0xC000051000", name: "title string bytes", val: "BLACK — reached via [0].Title.ptr", cls: "bt" },
                    { addr: "0xC0000C0000", name: "time.Time (escaped now)", val: "BLACK — reached via CompletedAt ptr", cls: "bt" },
                    { addr: "0xC000044000", name: "G1 descriptor", val: "BLACK — goroutine always live", cls: "bt" },
                    { addr: "0xC000090000", name: "old Task copy (unreachable)", val: "WHITE — no pointer points here", cls: "nil" },
                    { addr: "0xC0000B0000", name: "GetTasks() copy (gone)", val: "WHITE — caller returned, no ref", cls: "nil" },
                ]
            },
            {
                grp: "Write barrier shading (if G1 writes new ptr during mark)", lbl: "heap-lbl", rows: [
                    { addr: "WB-LOG", name: "writeBarrier log buffer", val: "records old+new ptr values → shade grey", cls: "ptr" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0410000", name: "runtime.gcBgMarkWorker (G5)", active: true },
            { addr: "0x0412000", name: "runtime.gcDrain → scanobject", active: true },
            { addr: "0x0418000", name: "runtime.shade (write barrier)", active: true },
            { addr: "0x0419000", name: "runtime.greyobject → setmark bits", active: true },
        ],
        data_seg: [
            {
                grp: "GC metadata", rows: [
                    { addr: "0x0518200", name: "work.markrootNext", val: "root iterator — all roots done", cls: "fn" },
                    { addr: "0x0518300", name: "gcWork.balance", val: "items in grey queue", cls: "fn" },
                ]
            },
        ],
        heapB: 41880, stackB: 16,
    },
    {
        name: "GC Phase 3 — mark termination STW: drain queues, finalize", fn: "runtime.gcMarkTermination()", group: "GC",
        tags: ["gc", "heap"],
        lines: [],
        code: `<span class="cm">// Second (shorter) STW — stops goroutines again:
//   all goroutines park at next safe point
//   runtime drains remaining grey objects to zero
//   (goroutines may have created new grey objects via WB)
//
// runtime.gcMarkTermination():
//   gcphase = _GCmarktermination  (brief transition)
//   gcphase = _GCoff              (mark is done!)
//   writeBarrier.enabled = 0      (WB turned OFF)
//   heapMarked = heapLive snapshot (baseline for next cycle)
//
// This STW is typically SHORTER than Phase 1 (~0.02ms)
// because write barrier kept the grey queue small.
// After this: goroutines resume, sweep runs concurrently.</span>`,
        desc: `A second, shorter stop-the-world completes the mark phase. While goroutines were running concurrently in Phase 2, the write barrier may have added new grey objects. The mark termination STW ensures the grey queue is <strong>completely drained to zero</strong> — no white objects are reachable from any black object. Once the queue is empty, the invariant holds: any remaining white objects are <strong>provably unreachable</strong> and safe to collect. The GC then sets <code>gcphase = _GCoff</code> and <strong>turns off the write barrier</strong> — user code no longer pays the barrier overhead. The current <code>heapLive</code> value is saved as <code>heapMarked</code> to set the next GC trigger.`,
        cpu: "M0 · stopTheWorld → gcDrain until grey=0 · heapMarked=heapLive · writeBarrier=0 · startTheWorld",
        goroutines: [
            { id: "G1", state: "wait", fn: "STW mark termination", stack: "0xC000010000" },
            { id: "G5 GC", state: "run", fn: "gcMarkTermination — drain final grey", stack: "0xC000110000" },
        ],
        stack: [
            {
                grp: "G1 parked at safe point (second STW)", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "GC state after mark termination", lbl: "heap-lbl", rows: [
                    { addr: "0x0518010", name: "gcphase", val: "_GCoff (mark done)", cls: "bt", tag: "upd" },
                    { addr: "0x0518020", name: "writeBarrier.enabled", val: "0 (OFF — barrier cost gone)", cls: "bf", tag: "upd" },
                    { addr: "0x0518028", name: "gcController.heapMarked", val: "~8.5 KB (live heap snapshot)", tag: "upd" },
                    { addr: "0x0518030", name: "gcController.gcTrigger", val: "~17 KB (next trigger = 2× marked)", tag: "upd" },
                ]
            },
            {
                grp: "All white objects are now unreachable (confirmed)", lbl: "freed-lbl", rows: [
                    { addr: "0xC000090000", name: "old Task copy", val: "WHITE → will be swept", cls: "stale" },
                    { addr: "0xC0000B0000", name: "GetTasks() copy array", val: "WHITE → will be swept", cls: "stale" },
                    { addr: "0xC000052000", name: "JSON encode buffer (temp)", val: "WHITE → will be swept", cls: "stale" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0420000", name: "runtime.gcMarkTermination", active: true },
            { addr: "0x0415000", name: "runtime.stopTheWorld (second)", active: true },
            { addr: "0x0421000", name: "runtime.startTheWorld", active: true },
        ],
        data_seg: [
            {
                grp: "Updated GC stats", rows: [
                    { addr: "0x0518028", name: "heapMarked", val: "locked in — baseline for next gcTrigger" },
                ]
            },
        ],
        heapB: 8889, stackB: 16,
    },
    {
        name: "GC Phase 4 — concurrent sweep: reclaim white spans", fn: "runtime.sweepone()", group: "GC",
        tags: ["gc", "heap"],
        lines: [],
        code: `<span class="cm">// Goroutines resume IMMEDIATELY after mark termination STW.
// Sweep runs CONCURRENTLY with user code — no pause!
//
// runtime.bgsweep() runs in background goroutine G6:
//   for each mspan in mheap_.sweepgen list:
//     span.sweep():
//       scan span's mark bitmap
//       for each unmarked (white) object slot:
//         add slot to span.freelist
//         decrement span.allocCount
//       if span.allocCount == 0:
//         return entire span to mheap_.free
//
// Swept spans return to mheap_ or mcache for reuse.
// The old Task copy at 0xC000090000 is swept here.</span>`,
        desc: `Sweep runs <strong>concurrently with user code</strong> — goroutines keep executing while the sweeper reclaims memory in the background. The sweeper (goroutine G6, <code>bgsweep</code>) walks each <code>mspan</code> in the heap. For each span, it checks the <strong>mark bitmap</strong> (set during the mark phase). Each unmarked object slot is added back to the span's free list. If an entire span becomes empty (<code>allocCount == 0</code>), the span is returned to <code>mheap_.free</code> for reuse by other size classes. This is why Go does not immediately return memory to the OS — it keeps spans in a <strong>local pool</strong> for fast future allocations. The OS receives memory back only after idle periods (via <code>runtime.scavenger</code>).`,
        cpu: "G6 bgsweep · for each mspan: sweep() · scan mark bitmap · free unmarked slots → span.freelist · 0xC000090000 reclaimed",
        goroutines: [
            { id: "G1", state: "run", fn: "user code (normal, no write barrier)", stack: "0xC000010000" },
            { id: "G6 SW", state: "run", fn: "runtime.bgsweep", stack: "0xC000120000" },
        ],
        stack: [
            {
                grp: "main() frame — G1 running at full speed", lbl: "frame-lbl", rows: [
                    { addr: "0xC000011FB0", name: "tm *TaskManager", val: "0xC000070000", cls: "ptr" },
                    { addr: "0xC000011FB8", name: "storage *FileStorage", val: "0xC000060000", cls: "ptr" },
                ]
            },
        ],
        heap: [
            {
                grp: "LIVE — black (marked) objects remain", lbl: "heap-lbl", rows: [
                    { addr: "0xC000070000", name: "TaskManager", val: "LIVE — in use", cls: "bt" },
                    { addr: "0xC000060000", name: "FileStorage", val: "LIVE — in use", cls: "bt" },
                    { addr: "0xC0000A0000", name: "[]Task backing array", val: "LIVE — in use", cls: "bt" },
                    { addr: "0xC000051000", name: "title string [13]byte", val: "LIVE — in use", cls: "bt" },
                    { addr: "0xC000044000", name: "G1 descriptor + 8KB stack", val: "LIVE — goroutine running", cls: "bt" },
                ]
            },
            {
                grp: "SWEPT — reclaimed, returned to mheap_ free lists", lbl: "freed-lbl", rows: [
                    { addr: "0xC000090000", name: "old Task literal", val: "FREED → span.freelist (88B slot available)", cls: "stale", tag: "free" },
                    { addr: "0xC0000B0000", name: "GetTasks() copy array", val: "FREED → span.freelist", cls: "stale", tag: "free" },
                    { addr: "0xC000052000", name: "JSON encode buffer", val: "FREED → mheap_.free (span empty)", cls: "stale", tag: "free" },
                    { addr: "0xC0000D0000", name: "hchan (taskChan, closed)", val: "FREED → returned to mheap_", cls: "stale", tag: "free" },
                ]
            },
        ],
        code_seg: [
            { addr: "0x0411000", name: "runtime.sweepone", active: true },
            { addr: "0x0422000", name: "runtime.mspan.sweep — mark bitmap scan", active: true },
            { addr: "0x0423000", name: "runtime.bgsweep (G6 background goroutine)", active: true },
        ],
        data_seg: [
            {
                grp: "mheap_ free lists updated", rows: [
                    { addr: "0x0518100", name: "mheap_.free", val: "span at 0xC000090xxx returned", cls: "fn" },
                    { addr: "0x0518140", name: "mheap_.scav", val: "candidates for OS return (idle >5min)", cls: "fn" },
                ]
            },
        ],
        heapB: 8640, stackB: 16,
    },
];

export const S: Step[] = S_RAW as unknown as Step[];
