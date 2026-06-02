// Verbatim beginner-intro HTML bodies and the register footer note,
// extracted unchanged from the original memory_simulator.html.
export const REGS_INTRO_HTML = `Registers are a tiny set of storage slots <b>inside the CPU</b> — only a few dozen, each 64 bits wide,
but accessed in well under a nanosecond. The CPU can only compute on values that are in registers, so a
program is really just a loop of: <b>load</b> from memory → <b>compute</b> → <b>store</b> back.
Every step runs one instruction through 4 stages:
<div class="step-line"><span class="step-n">1</span><div><b>Fetch</b> — read the next instruction from the address in <code>RIP</code> (the program counter).</div></div>
<div class="step-line"><span class="step-n">2</span><div><b>Decode</b> — the <b>decoder</b> figures out what the instruction means and which registers it touches.</div></div>
<div class="step-line"><span class="step-n">3</span><div><b>Execute</b> — the ALU does the math / the address unit computes a memory address.</div></div>
<div class="step-line"><span class="step-n">4</span><div><b>Writeback</b> — the result is stored into a destination register (marked <span style="color:var(--green)">◀ write</span> below). Then <code>RIP</code> advances to the next instruction.</div></div>
<div class="legend-mini">
  <span><i style="background:var(--yellow)"></i><b style="color:var(--t2)">Yellow row</b> = changed since the previous step</span>
  <span><i style="background:var(--green)"></i><b style="color:var(--t2)">◀ write</b> = register this instruction writes to</span>
  <span><i style="background:var(--orange)"></i><b style="color:var(--t2)">Orange value</b> = a pointer (an address)</span>
</div>
<div style="margin-top:8px;color:var(--t3)">Each register shows four sizes: the full 64-bit value, plus its low 32 / 16 / 8 bits (e.g. <code>RAX</code>→<code>EAX</code>→<code>AX</code>→<code>AL</code>). Hover any cell for the full value and meaning.</div>`;

export const ALL_INTRO_HTML = `A running program splits its memory into <b>regions</b>, each with a different job. As you click
<b>Next ▶</b>, watch how each step moves data between them. Colours: <span style="color:var(--green)">green</span> = just
allocated, <span style="color:var(--yellow)">yellow</span> = value changed, <span style="color:var(--red)">red</span> = freed.
<div class="step-line"><span class="step-n">1</span><div><b>STACK</b> — fast scratch space for the function running now. Locals + the return address live here and disappear when the function returns. Grows <b>downward</b>.</div></div>
<div class="step-line"><span class="step-n">2</span><div><b>HEAP</b> — long-lived data that outlives its function (returned pointers, slices, maps). Cleaned up automatically by the <b>garbage collector</b>.</div></div>
<div class="step-line"><span class="step-n">3</span><div><b>CPU REGISTERS</b> — the few tiny slots inside the processor where all actual computation happens. See the dedicated <b>CPU Registers</b> tab for the full story.</div></div>
<div class="step-line"><span class="step-n">4</span><div><b>CODE SEGMENT</b> — your compiled instructions (read-only). <b>▶ active</b> marks the function running this step.</div></div>
<div class="step-line"><span class="step-n">5</span><div><b>DATA SEGMENT</b> — global constants & variables fixed when the program was built.</div></div>
<div class="legend-mini">
  <span><i style="background:var(--orange)"></i>orange = a <b style="color:var(--t2)">pointer</b> (an address pointing at other memory). Hover it to highlight its target.</span>
  <span><i style="background:var(--purple)"></i>purple = a memory <b style="color:var(--t2)">address</b>. Hover any row for a plain-English explanation.</span>
</div>
<div style="margin-top:8px;color:var(--t3)">Tip: click a region’s ▶ title to collapse it. Hover the title for a deeper explanation.</div>`;

export const REG_FOOTER_HTML = `<b>How functions pass data (System V AMD64 calling convention):</b><br>
  The first 6 arguments go in registers <b>RDI, RSI, RDX, RCX, R8, R9</b> (in that order); any extras go on the stack. The result comes back in <b>RAX</b> (or RDX:RAX for 128-bit values). This is why you see RDI/RSI change right before a call.<br>
  <b>Caller-saved (volatile):</b> RAX RCX RDX RSI RDI R8–R11 — a called function may clobber these.<br>
  <b>Callee-saved (non-volatile):</b> RBX RSP RBP R12–R15 — a called function must restore these before returning.<br>
  <b>Go note:</b> the runtime keeps a pointer to the current goroutine <code style="color:var(--cyan)">g</code> in <b>R14</b> at all times.`;
