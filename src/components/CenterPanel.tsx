// Center column: tab bar (Step View / task.go), the memory-delta banner, and body.
import { useSim } from '../hooks/SimulatorContext';
import { CodeView } from './CodeView';
import { DiffBanner } from './DiffBanner';
import { StepView } from './StepView';

export function CenterPanel({ className = '' }: { className?: string }) {
    const { centerTab, setCenterTab } = useSim();

    return (
        <div className={`center ${className}`.trim()}>
            <div className="ctabs">
                <div
                    className={`ctab tip tip-below${centerTab === 'step' ? ' on' : ''}`}
                    onClick={() => setCenterTab('step')}
                    data-tip="Step View: current operation, CPU instruction, and memory explanation"
                >
                    <span className="ctab-dot" style={{ background: 'var(--green)' }} />
                    Step View
                </div>
                <div
                    className={`ctab tip tip-below${centerTab === 'code' ? ' on' : ''}`}
                    onClick={() => setCenterTab('code')}
                    data-tip="Source code: full task.go with the active line highlighted"
                >
                    <span className="ctab-dot" style={{ background: 'var(--blue)' }} />
                    task.go
                </div>
            </div>
            <DiffBanner />
            <div className="center-body" id="center-body">
                {centerTab === 'step' ? <StepView /> : <CodeView />}
            </div>
        </div>
    );
}
