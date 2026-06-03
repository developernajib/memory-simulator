// ──────────────────────────────────────────────────────────────────────────────
// Text formatting / syntax highlighting — pure functions returning HTML strings.
//
// These mirror the original simulator exactly. The HTML they emit is rendered via
// dangerouslySetInnerHTML in the relevant components, and relies on the same CSS
// classes (asm-*, go-*) carried over from the original stylesheet.
// ──────────────────────────────────────────────────────────────────────────────

/** Format a CPU narration string into highlighted assembly instruction rows. */
export function fmtCPU(cpu: string): string {
    return cpu
        .split(' · ')
        .map((part) => {
            const hl = part
                .replace(/\b(SYSCALL|SYSENTER)\b/g, (m) => `<span class="asm-syscall">${m}</span>`)
                .replace(
                    /\b(CALL|MOVQ|MOVB|MOVW|MOVL|SUBQ|ADDQ|INCQ|DECQ|CMPQ|CMPL|JMP|JZ|JNZ|JE|JNE|TEST|LOCK|PUSH|POP|RET|XCHG|XADD|LEAL|LEAQ)\b/g,
                    (m) => `<span class="asm-mnem">${m}</span>`,
                )
                .replace(/\b(0x[0-9A-Fa-f]+)\b/g, (m) => `<span class="asm-addr">${m}</span>`)
                .replace(
                    /\b(runtime\.[A-Za-z_]\w*|main\.[A-Za-z_]\w*|flag\.[A-Za-z_]\w*|sync\.[A-Za-z_]\w*|time\.[A-Za-z_]\w*|strings\.[A-Za-z_]\w*|os\.[A-Za-z_]\w*|encoding\/json\.[A-Za-z_]\w*)\b/g,
                    (m) => `<span class="asm-fn">${m}</span>`,
                )
                .replace(
                    /\b(G\d+|M\d+|P\d+|AX|BX|CX|DX|R8|R9|R10|SP|PC|SB)\b/g,
                    (m) => `<span class="asm-greg">${m}</span>`,
                );
            return `<div class="asm-inst">${hl}</div>`;
        })
        .join('');
}

const GO_KEYWORDS = new Set([
    'package',
    'import',
    'func',
    'var',
    'const',
    'type',
    'struct',
    'interface',
    'return',
    'if',
    'else',
    'for',
    'range',
    'switch',
    'case',
    'default',
    'break',
    'continue',
    'go',
    'chan',
    'make',
    'append',
    'copy',
    'close',
    'len',
    'cap',
    'defer',
    'select',
    'map',
    'nil',
    'true',
    'false',
    'iota',
    'new',
]);
const GO_TYPES = new Set([
    'int',
    'int64',
    'int32',
    'uint',
    'uint32',
    'uint64',
    'bool',
    'string',
    'byte',
    'error',
    'float64',
    'uintptr',
    'unsafe',
]);

/** Lightweight Go syntax highlighter for a single source line. */
export function highlightGo(line: string): string {
    const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc.replace(
        /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)/g,
        (m, cm, ds, bs, nu, id) => {
            if (cm !== undefined) return `<span class="go-cm">${m}</span>`;
            if (ds !== undefined || bs !== undefined) return `<span class="go-st">${m}</span>`;
            if (nu !== undefined) return `<span class="go-nu">${m}</span>`;
            if (id !== undefined) {
                if (GO_KEYWORDS.has(m)) return `<span class="go-kw">${m}</span>`;
                if (GO_TYPES.has(m)) return `<span class="go-ty">${m}</span>`;
            }
            return m;
        },
    );
}
