// One-shot extractor: slices the verbatim data/metadata/logic blocks out of the
// original memory_simulator.html and emits typed TS source modules.
// Run once from the project root: `node scripts/extract-data.mjs`.
// Kept in-repo to document exactly how the data modules were produced.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = '../../memory_simulator.html';
const html = readFileSync(new URL(SRC, import.meta.url), 'utf8');
const lines = html.split('\n');

// inclusive 1-based line slice -> string (de-indented by the common leading 8 spaces)
const slice = (from, to) =>
  lines
    .slice(from - 1, to)
    .map((l) => l.replace(/^ {8}/, ''))
    .join('\n')
    .trim();

mkdirSync(new URL('../src/data', import.meta.url), { recursive: true });
mkdirSync(new URL('../src/lib', import.meta.url), { recursive: true });

// ── GO_SOURCE constant (the Go program shown in the code tab) ──
const goSource = slice(2474, 2707); // `const GO_SOURCE = \`...\`;`
writeFileSync(
  new URL('../src/data/goSource.ts', import.meta.url),
  `// Verbatim Go program rendered in the "task.go" tab.\n// Extracted unchanged from the original memory_simulator.html.\nexport ${goSource}\n`,
);

// ── S: the 31-step execution data array ──
const stepsArr = slice(2713, 4450).replace(/^const S = \[/, 'const S_RAW = ['); // `const S = [ ... ];`
writeFileSync(
  new URL('../src/data/steps.ts', import.meta.url),
  `// Verbatim 31-step execution dataset, extracted unchanged from the original\n// memory_simulator.html. Typed via the Step interface in ../types.\nimport type { Step } from '../types';\n${stepsArr}\n\nexport const S: Step[] = S_RAW as unknown as Step[];\n`,
);

// ── register/region metadata constants ──
// (data and render functions are interleaved in the source, so we slice the
//  precise constant sub-ranges and re-export them.)
const meta = [
  slice(4731, 4756), // TAG_TIPS, ADDR_TIPS, VAL_TIPS
  slice(4781, 4794), // REGION_TIPS, REGION_EXPLAINERS
  slice(4825, 4861), // GPR_META, FLAG_META, SEG_META
]
  .join('\n\n')
  .replace(/(^|\n)const /g, '$1export const ')
  .replace('export const GPR_META = [', 'export const GPR_META: GprMeta[] = [')
  .replace('export const FLAG_META = [', 'export const FLAG_META: FlagMeta[] = [')
  .replace('export const SEG_META = [', 'export const SEG_META: SegMeta[] = [');
writeFileSync(
  new URL('../src/data/registerMeta.ts', import.meta.url),
  `// Verbatim register/region metadata, extracted unchanged from the original.\n// Typed via the *Meta interfaces in ../types.\nimport type { GprMeta, FlagMeta, SegMeta } from '../types';\n${meta}\n`,
);

// Note: the register-derivation logic (deriveRegisters/countRegChanges and the
// hex helpers) is hand-ported with full TypeScript types in src/lib/registers.ts
// rather than extracted raw, since the original is untyped JS.

console.log('extracted: goSource.ts, steps.ts, registerMeta.ts');
