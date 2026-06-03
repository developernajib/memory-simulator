// Right column: memory view tabs, the timeline, the active view body, and the
// legend + copy-snapshot button.
import { useState } from 'react';
import { S } from '../data/steps';
import { buildSnapshot } from '../lib/snapshot';
import { useSim } from '../hooks/SimulatorContext';
import type { MemTab } from '../types';
import { MemoryTimeline } from './MemoryTimeline';
import { AllRegionsView } from './memory/AllRegionsView';
import { GoroutinesView } from './memory/GoroutinesView';
import { HeapChartView } from './memory/HeapChartView';
import { VirtualMapView } from './memory/VirtualMapView';
import { RegisterPanel } from './registers/RegisterPanel';

const TABS: { tab: MemTab; label: string; tip: string }[] = [
    { tab: 'all', label: 'All Regions', tip: 'Stack + Heap + Code + Data: full memory view' },
    {
        tab: 'regs',
        label: 'CPU Registers',
        tip: 'x86-64 CPU register file: PC/RIP, instruction register, decoder, RSP, RBP, RAX–R15, RFLAGS, segment & control registers, SIMD',
    },
    {
        tab: 'goroutines',
        label: 'Goroutines',
        tip: 'Active goroutines (G structs): state, PC, stack range',
    },
    {
        tab: 'chart',
        label: 'Heap Map',
        tip: 'Visual mspan layout: shows allocated vs free spans in heap',
    },
    {
        tab: 'vmap',
        label: 'Virtual Map',
        tip: 'Linux virtual address space layout: null, text, data, heap, stacks, kernel',
    },
];

export function MemoryPanel({ className = '' }: { className?: string }) {
    const { cur, total, memTab, setMemTab } = useSim();
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(buildSnapshot(S[cur], cur, total));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable — ignore */
        }
    };

    return (
        <div className={`mem-panel ${className}`.trim()}>
            <div className="mem-tabs">
                {TABS.map((t) => (
                    <div
                        key={t.tab}
                        className={`mt tip tip-below${memTab === t.tab ? ' on' : ''}`}
                        onClick={() => setMemTab(t.tab)}
                        data-tip={t.tip}
                    >
                        {t.label}
                    </div>
                ))}
            </div>
            <MemoryTimeline />
            <div className="mem-body" id="mem-body">
                {memTab === 'all' && <AllRegionsView />}
                {memTab === 'regs' && <RegisterPanel forceOpen />}
                {memTab === 'goroutines' && <GoroutinesView />}
                {memTab === 'chart' && <HeapChartView />}
                {memTab === 'vmap' && <VirtualMapView />}
            </div>
            <div className="mem-legend">
                <div className="leg-item">
                    <div className="leg-dot" style={{ background: 'var(--green)' }} />
                    new alloc
                </div>
                <div className="leg-item">
                    <div className="leg-dot" style={{ background: 'var(--yellow)' }} />
                    updated
                </div>
                <div className="leg-item">
                    <div className="leg-dot" style={{ background: 'var(--red)' }} />
                    freed/GC
                </div>
                <div className="leg-item">
                    <div className="leg-dot" style={{ background: 'var(--orange)' }} />
                    ptr
                </div>
                <button
                    className={`export-btn tip${copied ? ' copied' : ''}`}
                    id="export-btn"
                    onClick={onCopy}
                    data-tip="Copy this step's full memory state to clipboard"
                >
                    {copied ? '✓ copied' : 'copy'}
                </button>
            </div>
        </div>
    );
}
