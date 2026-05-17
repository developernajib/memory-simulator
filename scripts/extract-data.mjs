// One-shot extractor: slices the verbatim data/metadata/logic blocks out of the
// original memory_simulator.html and emits typed TS source modules.
// Run once from the project root: `node scripts/extract-data.mjs`.
// Kept in-repo to document exactly how the data modules were produced.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = '../memory_simulator.html';
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
  `// Verbatim Go program rendered in the "task.go" tab.\n// Extracted unchanged from the original memory_simulator.html.\n/* eslint-disable */\nexport ${goSource}\n`,
);

// ── S: the 31-step execution data array ──
const stepsArr = slice(2713, 4450).replace(/^const S = \[/, 'const S_RAW = ['); // `const S = [ ... ];`
writeFileSync(
  new URL('../src/data/steps.ts', import.meta.url),
  `// Verbatim 31-step execution dataset, extracted unchanged from the original\n// memory_simulator.html. Typed via the Step interface in ../types.\n/* eslint-disable */\nimport type { Step } from '../types';\n${stepsArr}\n\nexport const S: Step[] = S_RAW as unknown as Step[];\n`,
);

// ── register/region metadata constants ──
const meta = [
  slice(4731, 4779), // TAG_TIPS, ADDR_TIPS, VAL_TIPS
  slice(4781, 4823), // REGION_TIPS, REGION_EXPLAINERS
  slice(4825, 4862), // GPR_META, FLAG_META, SEG_META
].join('\n\n');
writeFileSync(
  new URL('../src/data/registerMeta.ts', import.meta.url),
  `// Verbatim register/region metadata, extracted unchanged from the original.\n/* eslint-disable */\nexport ${meta.replace(/\n        const /g, '\nexport const ').replace(/^const /, '')}\n`,
);

// ── register-derivation logic (pure, no DOM) ──
const logic = slice(4863, 5014); // hex helpers + deriveRegisters + countRegChanges
writeFileSync(
  new URL('../src/lib/registers.ts', import.meta.url),
  `// Verbatim register-derivation logic, extracted unchanged from the original.\n// Pure functions only — no DOM access.\n/* eslint-disable */\nimport { GPR_META, FLAG_META, SEG_META } from '../data/registerMeta';\nimport { S } from '../data/steps';\n${logic}\n\nexport { deriveRegisters, countRegChanges, hex64, low32, low16, low8 };\n`,
);

console.log('extracted: goSource.ts, steps.ts, registerMeta.ts, lib/registers.ts');
