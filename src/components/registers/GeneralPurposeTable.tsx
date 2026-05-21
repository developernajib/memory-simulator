// The 16 general-purpose registers, each at 64 / 32 / 16 / 8-bit widths, with the
// writeback marker and change highlighting.
import { GPR_META } from '../../data/registerMeta';
import { low16, low32, low8 } from '../../lib/registers';
import type { RegisterFile } from '../../types';

interface Props {
  R: RegisterFile;
  prev: RegisterFile | null;
}

export function GeneralPurposeTable({ R, prev }: Props) {
  const changed = (k: string, v: string) => (prev && prev.gpr && prev.gpr[k] !== v ? ' chg' : '');

  return (
    <>
      <div className="reg-hdrow">
        <div>64-bit</div>
        <div>value</div>
        <div>32-bit</div>
        <div>16-bit</div>
        <div>8-bit</div>
      </div>
      {GPR_META.map((m) => {
        const v = R.gpr[m.q];
        const isZero = /^0x0+$/.test(v.replace(/0x/, ''));
        const isPtr = /^0xC0000|^0x04|^0x05/.test(v) && !isZero;
        const vcls = isZero ? 'zero' : isPtr ? 'ptr' : '';
        const v32 = low32(v);
        const v16 = low16(v);
        const v8 = low8(v);
        const isWB = R.writes === m.q;
        const saved = m.conv === 'callee';
        return (
          <div className={`greg${changed(m.q, v)}${isWB ? ' wb' : ''}`} key={m.q}>
            <div
              className="rk tip"
              data-tip={`${m.q} — ${m.role}\n${m.note}\n\n${
                saved
                  ? 'callee-saved (non-volatile): a function you call must preserve it.'
                  : 'caller-saved (volatile): a function you call may overwrite it.'
              }`}
            >
              {m.q}
              <span className="role">{saved ? 'saved' : 'volatile'}</span>
            </div>
            <div className={`rv ${vcls} tip`.trim()} data-tip={`${m.q} (64-bit) = ${v}`}>
              {v}
              {isWB && (
                <span
                  className="wb-mark tip"
                  data-tip={`Written by this instruction (${R.ir}) — destination of the writeback stage`}
                >
                  ◀ write
                </span>
              )}
            </div>
            <div className="r32 tip" data-tip={`${m.d} — low 32 bits of ${m.q} = ${v32}`}>
              {v32}
            </div>
            <div className="r16 tip" data-tip={`${m.w} — low 16 bits of ${m.q} = ${v16}`}>
              {v16}
            </div>
            <div className="r8 tip" data-tip={`${m.b} — low 8 bits of ${m.q} = ${v8}`}>
              {v8}
            </div>
          </div>
        );
      })}
    </>
  );
}
