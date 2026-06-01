// Application root: provides simulator state, installs the global tooltip and
// pointer-highlight engines, and composes the three-column layout plus the mobile
// chrome and help modal.
import { useEffect, useState } from 'react';
import { CenterPanel } from './components/CenterPanel';
import { HelpModal } from './components/HelpModal';
import { MemoryPanel } from './components/MemoryPanel';
import { MobileNav } from './components/MobileNav';
import { MobileStepBar } from './components/MobileStepBar';
import { StepsSidebar } from './components/StepsSidebar';
import { TopBar } from './components/TopBar';
import { SimulatorContext } from './hooks/SimulatorContext';
import { usePointerHighlight } from './hooks/usePointerHighlight';
import { useResponsive, type MobilePanel } from './hooks/useResponsive';
import { useSimulator } from './hooks/useSimulator';
import { useTooltip } from './hooks/useTooltip';

export default function App() {
  const sim = useSimulator();
  const { isMobile, panel, setPanel } = useResponsive();
  const [helpOpen, setHelpOpen] = useState(false);

  useTooltip();
  usePointerHighlight();

  // The "?" keyboard shortcut dispatches sim:help; open the modal on it.
  useEffect(() => {
    const onHelp = () => setHelpOpen(true);
    window.addEventListener('sim:help', onHelp);
    return () => window.removeEventListener('sim:help', onHelp);
  }, []);

  // On mobile, only the selected panel stays visible (panels remain direct grid
  // children so the desktop layout is untouched).
  const hidden = (p: MobilePanel) => (isMobile && panel !== p ? 'mobile-hidden' : '');

  return (
    <SimulatorContext.Provider value={sim}>
      <div className="app">
        <TopBar />
        <div className="body">
          <StepsSidebar onOpenHelp={() => setHelpOpen(true)} className={hidden('steps')} />
          <CenterPanel className={hidden('center')} />
          <MemoryPanel className={hidden('memory')} />
        </div>
        {isMobile && <MobileStepBar />}
        {isMobile && <MobileNav panel={panel} setPanel={setPanel} />}
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </SimulatorContext.Provider>
  );
}
