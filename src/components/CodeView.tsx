// Center "task.go" tab: the full Go source with the active step's lines highlighted.
import { useEffect, useMemo, useRef } from 'react';
import { GO_SOURCE } from '../data/goSource';
import { S } from '../data/steps';
import { highlightGo } from '../lib/format';
import { useSim } from '../hooks/SimulatorContext';

export function CodeView() {
    const { cur } = useSim();
    const s = S[cur];
    const highlighted = useMemo(() => new Set(s.lines ?? []), [s.lines]);
    const containerRef = useRef<HTMLDivElement>(null);
    const userScrolledRef = useRef(false);

    // Pre-render highlighted lines once (the source never changes).
    const lines = useMemo(() => GO_SOURCE.split('\n').map((ln) => highlightGo(ln)), []);

    const scrollToActive = () => {
        const first = s.lines?.[0];
        if (!first || !containerRef.current) return;
        const target = containerRef.current.querySelector<HTMLElement>(`[data-ln="${first}"]`);
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    // Auto-scroll to the active line on step change, unless the user is browsing.
    useEffect(() => {
        userScrolledRef.current = false;
        const first = s.lines?.[0];
        if (!first || !containerRef.current) return;
        const target = containerRef.current.querySelector<HTMLElement>(`[data-ln="${first}"]`);
        if (target)
            requestAnimationFrame(() =>
                target.scrollIntoView({ block: 'center', behavior: 'smooth' }),
            );
    }, [cur, s.lines]);

    const stepLabel = highlighted.size > 0 ? `step ${cur + 1} — ${s.name}` : '';

    return (
        <div
            className="code-file-view"
            ref={containerRef}
            onScroll={() => {
                userScrolledRef.current = true;
            }}
        >
            <div className="cf-header">
                <span className="cf-fname">task.go</span>
                <span className="cf-lang">Go</span>
                <span
                    id="cf-step-label"
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color: 'var(--yellow)',
                        marginLeft: 'auto',
                        marginRight: 8,
                    }}
                >
                    {stepLabel}
                </span>
                <button
                    onClick={scrollToActive}
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 3,
                        border: '1px solid var(--b2)',
                        background: 'var(--s2)',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                    }}
                    title="Jump to active line"
                >
                    ⌖ go to line
                </button>
            </div>
            <div className="cf-body">
                {lines.map((html, i) => {
                    const ln = i + 1;
                    return (
                        <div
                            className={`cf-line${highlighted.has(ln) ? ' highlighted' : ''}`}
                            data-ln={ln}
                            key={ln}
                        >
                            <span className="cf-ln">{ln}</span>
                            <span className="cf-code" dangerouslySetInnerHTML={{ __html: html }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
