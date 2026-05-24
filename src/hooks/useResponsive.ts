// Tracks viewport width crossing the 640px mobile breakpoint and which mobile panel
// (steps / center / memory) is active. On desktop the panel selection is ignored.
import { useEffect, useState } from 'react';

export type MobilePanel = 'steps' | 'center' | 'memory';

export interface Responsive {
  isMobile: boolean;
  panel: MobilePanel;
  setPanel: (p: MobilePanel) => void;
}

export function useResponsive(): Responsive {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  const [panel, setPanel] = useState<MobilePanel>('steps');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { isMobile, panel, setPanel };
}
