// Mobile-only status strip (progress ring + step name) and the thin top progress bar.
import { S } from '../data/steps';
import { useSim } from '../hooks/SimulatorContext';

export function MobileStepBar() {
    const { cur, total } = useSim();
    const pct = total > 1 ? cur / (total - 1) : 0;
    const C = 2 * Math.PI * 8;

    return (
        <>
            <div className="mobile-stepbar" id="mobile-stepbar">
                <div className="msb-left">
                    <div className="ring-wrap" style={{ width: 22, height: 22 }}>
                        <svg className="ring-svg" width="22" height="22" viewBox="0 0 22 22">
                            <circle className="ring-bg" cx="11" cy="11" r="8" />
                            <circle
                                cx="11"
                                cy="11"
                                r="8"
                                fill="none"
                                stroke="var(--green)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={C}
                                strokeDashoffset={C * (1 - pct)}
                                style={{
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%',
                                    transition: 'stroke-dashoffset .3s ease',
                                }}
                            />
                        </svg>
                        <div className="ring-label" style={{ fontSize: 6 }}>
                            {Math.round(pct * 100)}%
                        </div>
                    </div>
                    <span className="msb-step">
                        Step <b>{cur + 1}</b> / <b>{total}</b>
                    </span>
                </div>
                <div className="msb-name">{S[cur].name}</div>
            </div>

            <div className="mobile-progress-bar" id="mobile-progress-bar">
                <div
                    className="mobile-progress-fill"
                    style={{ width: `${(pct * 100).toFixed(1)}%` }}
                />
            </div>
        </>
    );
}
