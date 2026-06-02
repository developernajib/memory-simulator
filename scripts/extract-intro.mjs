// Extracts the verbatim beginner-intro HTML bodies + register footer note from the
// original memory_simulator.html into a TS constants module. Run once.
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync(new URL('../../memory_simulator.html', import.meta.url), 'utf8').split('\n');
const grab = (a, b) =>
  lines
    .slice(a - 1, b)
    .map((l) => l.replace(/^ {6}/, ''))
    .join('\n')
    .trim();

const regsIntro = grab(5117, 5130);
const allIntro = grab(5187, 5199);
const regNote = grab(5148, 5152);

// Escape for a JS template literal: backslash, backtick, and ${.
const esc = (s) => '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';

const out =
  '// Verbatim beginner-intro HTML bodies and the register footer note,\n' +
  '// extracted unchanged from the original memory_simulator.html.\n' +
  'export const REGS_INTRO_HTML = ' + esc(regsIntro) + ';\n\n' +
  'export const ALL_INTRO_HTML = ' + esc(allIntro) + ';\n\n' +
  'export const REG_FOOTER_HTML = ' + esc(regNote) + ';\n';

writeFileSync(new URL('../src/data/introHtml.ts', import.meta.url), out);
console.log('wrote introHtml.ts:', { regsIntro: regsIntro.length, allIntro: allIntro.length, regNote: regNote.length });
