// RFLAGS bit grid — one chip per condition/status flag, lit when set.
import { FLAG_META } from '../../data/registerMeta';
import type { RegisterFile } from '../../types';

export function FlagsGrid({ R }: { R: RegisterFile }) {
  return (
    <div className="flags-grid">
      {FLAG_META.map((f) => {
        const on = !!R.flags[f.k];
        return (
          <span
            className={`flag-bit${on ? ' set' : ''} tip`}
            data-tip={`${f.k} — ${f.n} Flag · ${on ? 'currently SET (1)' : 'currently clear (0)'}\n${f.note}`}
            key={f.k}
          >
            <b>{f.k}</b>
            {R.flags[f.k]}
          </span>
        );
      })}
    </div>
  );
}
