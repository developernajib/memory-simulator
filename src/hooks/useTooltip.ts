// ──────────────────────────────────────────────────────────────────────────────
// Global tooltip engine.
//
// The ported markup carries `data-tip` attributes throughout. Rather than wrap every
// element in a React tooltip component, we replicate the original's lightweight
// document-level delegation: a single floating element appended to <body> (so
// position:fixed is never clipped by overflow:hidden parents) follows the cursor.
// ──────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';

export function useTooltip(): void {
    useEffect(() => {
        const tt = document.createElement('div');
        tt.id = 'tt';
        document.body.appendChild(tt);

        const position = (e: MouseEvent) => {
            const GAP = 12;
            const w = tt.offsetWidth;
            const h = tt.offsetHeight;
            const vw = window.innerWidth;
            let x = e.clientX - w / 2;
            let y = e.clientY - h - GAP;
            if (y < 6) y = e.clientY + GAP; // flip below when no room above
            x = Math.max(6, Math.min(vw - w - 6, x)); // clamp horizontally
            tt.style.left = `${x}px`;
            tt.style.top = `${y}px`;
        };

        const show = (el: Element, e: MouseEvent) => {
            const text = el.getAttribute('data-tip');
            if (!text) return;
            tt.textContent = text;
            tt.classList.add('visible');
            position(e);
        };
        const hide = () => tt.classList.remove('visible');

        const onOver = (e: MouseEvent) => {
            const el = (e.target as Element)?.closest('[data-tip]');
            if (el) show(el, e);
        };
        const onOut = (e: MouseEvent) => {
            if ((e.target as Element)?.closest('[data-tip]')) hide();
        };
        const onMove = (e: MouseEvent) => {
            if (tt.classList.contains('visible')) position(e);
        };

        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('scroll', hide, true);

        return () => {
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('scroll', hide, true);
            tt.remove();
        };
    }, []);
}
