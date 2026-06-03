// ──────────────────────────────────────────────────────────────────────────────
// useSimulator — the single source of truth for navigation and view state.
//
// Owns the current step index, the active center/memory tabs, which collapsible
// regions and intro banners are open, and auto-play. Also wires keyboard shortcuts
// and two-way sync with the URL hash (permalink to a step). Components consume this
// via the SimulatorContext provider so no prop-drilling is required.
// ──────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from 'react';
import { S } from '../data/steps';
import type { CenterTab, IntroKey, MemTab, RegionKey } from '../types';

const DEFAULT_REGIONS: Record<RegionKey, boolean> = {
    stack: true,
    heap: true,
    regs: true,
    code: true,
    data: true,
};
// Intro/Q&A banners start collapsed; the user expands them when they want the primer.
const DEFAULT_INTROS: Record<IntroKey, boolean> = { all: false, regs: false };

function initialStepFromHash(): number {
    const hash = parseInt(window.location.hash.slice(1), 10);
    if (!isNaN(hash) && hash >= 1 && hash <= S.length) return hash - 1;
    return 0;
}

export interface SimulatorState {
    cur: number;
    total: number;
    centerTab: CenterTab;
    memTab: MemTab;
    regionOpen: Record<RegionKey, boolean>;
    introOpen: Record<IntroKey, boolean>;
    autoPlay: boolean;
    speed: number;
    nav: (delta: number) => void;
    go: (index: number) => void;
    setCenterTab: (tab: CenterTab) => void;
    setMemTab: (tab: MemTab) => void;
    toggleRegion: (key: RegionKey) => void;
    toggleIntro: (key: IntroKey) => void;
    toggleAutoPlay: () => void;
    setSpeed: (ms: number) => void;
}

export function useSimulator(): SimulatorState {
    const total = S.length;
    const [cur, setCur] = useState<number>(initialStepFromHash);
    const [centerTab, setCenterTab] = useState<CenterTab>('step');
    const [memTab, setMemTab] = useState<MemTab>('all');
    const [regionOpen, setRegionOpen] = useState<Record<RegionKey, boolean>>(DEFAULT_REGIONS);
    const [introOpen, setIntroOpen] = useState<Record<IntroKey, boolean>>(DEFAULT_INTROS);
    const [autoPlay, setAutoPlay] = useState(false);
    const [speed, setSpeedState] = useState(2800);

    const go = useCallback((index: number) => {
        const next = Math.max(0, Math.min(S.length - 1, index));
        setCur(next);
        window.history.replaceState(null, '', `#${next + 1}`);
    }, []);

    const nav = useCallback(
        (delta: number) => setCur((c) => Math.max(0, Math.min(S.length - 1, c + delta))),
        [],
    );

    // keep the hash in sync when cur changes via nav()/auto-play
    useEffect(() => {
        window.history.replaceState(null, '', `#${cur + 1}`);
    }, [cur]);

    const toggleRegion = useCallback(
        (key: RegionKey) => setRegionOpen((r) => ({ ...r, [key]: !r[key] })),
        [],
    );
    const toggleIntro = useCallback(
        (key: IntroKey) => setIntroOpen((r) => ({ ...r, [key]: !r[key] })),
        [],
    );
    const toggleAutoPlay = useCallback(() => setAutoPlay((p) => !p), []);
    const setSpeed = useCallback((ms: number) => setSpeedState(ms), []);

    // auto-play timer: advance until the last step, then stop
    useEffect(() => {
        if (!autoPlay) return;
        const id = window.setInterval(() => {
            setCur((c) => {
                if (c < S.length - 1) return c + 1;
                setAutoPlay(false);
                return c;
            });
        }, speed);
        return () => window.clearInterval(id);
    }, [autoPlay, speed]);

    // keyboard shortcuts (ignored while typing in form controls)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nav(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nav(-1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                go(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                go(S.length - 1);
            } else if (e.key === ' ') {
                e.preventDefault();
                toggleAutoPlay();
            } else if (e.key === '1') {
                setCenterTab('step');
            } else if (e.key === '2') {
                setCenterTab('code');
            } else if (e.key === '?') {
                window.dispatchEvent(new CustomEvent('sim:help'));
            } else if (e.key === 'Escape') {
                window.dispatchEvent(new CustomEvent('sim:escape'));
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [nav, go, toggleAutoPlay]);

    return useMemo(
        () => ({
            cur,
            total,
            centerTab,
            memTab,
            regionOpen,
            introOpen,
            autoPlay,
            speed,
            nav,
            go,
            setCenterTab,
            setMemTab,
            toggleRegion,
            toggleIntro,
            toggleAutoPlay,
            setSpeed,
        }),
        [
            cur,
            total,
            centerTab,
            memTab,
            regionOpen,
            introOpen,
            autoPlay,
            speed,
            nav,
            go,
            toggleRegion,
            toggleIntro,
            toggleAutoPlay,
            setSpeed,
        ],
    );
}
