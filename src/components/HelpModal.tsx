// Keyboard-shortcut help modal. Opens via the sidebar "?" button or the "?" key,
// closes on its ✕, a backdrop click, or Escape.
import { useEffect } from 'react';

const SHORTCUTS: { desc: string; keys: string[] }[] = [
  { desc: 'Next step', keys: ['→', '↓'] },
  { desc: 'Previous step', keys: ['←', '↑'] },
  { desc: 'First step', keys: ['Home'] },
  { desc: 'Last step', keys: ['End'] },
  { desc: 'Toggle auto-play', keys: ['Space'] },
  { desc: 'Switch to Step View', keys: ['1'] },
  { desc: 'Switch to Code View', keys: ['2'] },
  { desc: 'Show this help', keys: ['?'] },
  { desc: 'Close modal / clear search', keys: ['Esc'] },
];

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  // The global keyboard handler dispatches sim:escape; close on it.
  useEffect(() => {
    const onEsc = () => onClose();
    window.addEventListener('sim:escape', onEsc);
    return () => window.removeEventListener('sim:escape', onEsc);
  }, [onClose]);

  return (
    <div
      className={`modal-overlay${open ? ' visible' : ''}`}
      id="help-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-title">
          ⌨ Keyboard Shortcuts
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {SHORTCUTS.map((s) => (
          <div className="kbd-row" key={s.desc}>
            <span className="kbd-desc">{s.desc}</span>
            <span className="kbd-keys">
              {s.keys.map((k) => (
                <span className="kbd" key={k}>
                  {k}
                </span>
              ))}
            </span>
          </div>
        ))}
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--b1)',
            fontSize: 11,
            color: 'var(--t3)',
            lineHeight: 1.7,
          }}
        >
          <b style={{ color: 'var(--blue)' }}>CPU Registers panel</b> — open the{' '}
          <b style={{ color: 'var(--t2)' }}>CPU Registers</b> tab (or scroll the All Regions view)
          to watch the x86-64 register file per step: <b style={{ color: 'var(--t2)' }}>RIP</b>{' '}
          (program counter), instruction register, decoder,{' '}
          <b style={{ color: 'var(--t2)' }}>RSP/RBP</b>, all 16 general-purpose registers
          (64/32/16/8-bit), RFLAGS, segment, SIMD and control registers. Yellow rows changed this
          step; <span style={{ color: 'var(--green)' }}>◀ write</span> marks the register the
          current instruction writes back to. Hover any value for the full width.
        </div>
      </div>
    </div>
  );
}
