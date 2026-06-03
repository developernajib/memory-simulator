// ──────────────────────────────────────────────────────────────────────────────
// Pointer hover highlight.
//
// Memory rows whose value is a pointer carry `data-ptr="0x…"`; the cell they point
// at carries `data-addr="0x…"`. Hovering a pointer highlights its target row, so a
// learner can visually trace where a pointer leads. Implemented as document-level
// delegation to match the ported markup, which is re-rendered by React each step.
// ──────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';

export function usePointerHighlight(): void {
    useEffect(() => {
        const clear = () =>
            document
                .querySelectorAll('.mrow.ptr-target')
                .forEach((el) => el.classList.remove('ptr-target'));

        const onOver = (e: MouseEvent) => {
            const cell = (e.target as Element)?.closest<HTMLElement>('[data-ptr]');
            if (!cell) return;
            clear();
            const target = cell.dataset.ptr;
            document.querySelectorAll(`[data-addr="${target}"]`).forEach((addr) => {
                const row = addr.closest('.mrow');
                if (row) row.classList.add('ptr-target');
            });
        };
        const onOut = (e: MouseEvent) => {
            if ((e.target as Element)?.closest('[data-ptr]')) clear();
        };

        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        return () => {
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            clear();
        };
    }, []);
}
