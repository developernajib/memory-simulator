// Bottom navigation bar shown on narrow screens: prev/next plus panel switching.
import { useSim } from '../hooks/SimulatorContext';
import type { MobilePanel } from '../hooks/useResponsive';

interface MobileNavProps {
  panel: MobilePanel;
  setPanel: (p: MobilePanel) => void;
}

export function MobileNav({ panel, setPanel }: MobileNavProps) {
  const { cur, total, nav } = useSim();
  return (
    <div className="mobile-nav" id="mobile-nav">
      <button className="mn-btn mn-nav" id="mn-prev" disabled={cur === 0} onClick={() => nav(-1)}>
        <span className="mn-nav-icon">←</span>
      </button>
      <button
        className={`mn-btn${panel === 'steps' ? ' active' : ''}`}
        onClick={() => setPanel('steps')}
      >
        <span className="mn-icon">☰</span>Steps
      </button>
      <button
        className={`mn-btn${panel === 'center' ? ' active' : ''}`}
        onClick={() => setPanel('center')}
      >
        <span className="mn-icon">◎</span>Code
      </button>
      <button
        className={`mn-btn${panel === 'memory' ? ' active' : ''}`}
        onClick={() => setPanel('memory')}
      >
        <span className="mn-icon">⊟</span>Memory
      </button>
      <button
        className="mn-btn mn-nav"
        id="mn-next"
        disabled={cur === total - 1}
        onClick={() => nav(1)}
      >
        <span className="mn-nav-icon">→</span>
      </button>
    </div>
  );
}
