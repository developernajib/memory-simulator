// "Goroutines" memory tab: per-step goroutine states + an M:N scheduler primer.
import { S } from '../../data/steps';
import { useSim } from '../../hooks/SimulatorContext';

export function GoroutinesView() {
    const { cur } = useSim();
    const s = S[cur];
    const gs = s.goroutines ?? [
        { id: 'G1', state: 'run' as const, fn: 'main()', stack: '0xC000010000' },
    ];
    const runningId = gs.find((g) => g.state === 'run')?.id?.replace('G', '') ?? '1';

    return (
        <div className="go-view" style={{ flex: 1, overflowY: 'auto', border: 'none' }}>
            <div className="go-title" style={{ marginBottom: 8 }}>
                Active goroutines — step {cur + 1}
            </div>
            {gs.map((g) => {
                const cls = g.state === 'run' ? 'gb-run' : g.state === 'wait' ? 'gb-wait' : 'gb-gc';
                const stateTip =
                    g.state === 'run'
                        ? 'running — bound to M (OS thread), executing on CPU'
                        : g.state === 'wait'
                          ? 'waiting — parked (channel, mutex, sleep). Not on run queue.'
                          : 'GC worker — background mark/sweep goroutine spawned by runtime';
                const stateLabel =
                    g.state === 'run' ? '● running' : g.state === 'wait' ? '◌ waiting' : '◎ GC';
                return (
                    <div className="go-row" key={g.id}>
                        <span
                            className="go-id tip"
                            data-tip={`${g.id}: goroutine descriptor (G struct) — holds PC, SP, stack bounds, defer chain`}
                        >
                            {g.id}
                        </span>
                        <span className="go-state">
                            <span className={`gb ${cls} tip`} data-tip={stateTip}>
                                <span className="gledge" />
                                {stateLabel}
                            </span>
                            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--t2)' }}>
                                {g.fn || ''}
                            </span>
                        </span>
                        <span
                            className="go-stack tip"
                            data-tip={`Stack memory range for ${g.id} — 8 KB initial, grows/shrinks at runtime`}
                        >
                            {g.stack || ''}
                        </span>
                    </div>
                );
            })}
            <div style={{ marginTop: 16 }}>
                <div className="go-title">M:N Scheduler</div>
                <div
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: 'var(--t3)',
                        lineHeight: 1.7,
                        marginTop: 6,
                    }}
                >
                    M0 (OS thread) → P0 (processor) → G{runningId} (goroutine)
                    <br />
                    goroutine stacks live on the <span style={{ color: 'var(--red)' }}>heap</span>,
                    not OS stack
                    <br />
                    goroutine switch: save/restore registers only
                    <br />
                    OS thread switch: kernel involvement, ~1000ns
                    <br />
                    goroutine switch: ~100ns
                </div>
            </div>
        </div>
    );
}
