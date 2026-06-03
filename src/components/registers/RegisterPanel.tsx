// The full CPU register panel: a collapsible region whose body shows the control-
// flow strip, the 16 GP registers, RFLAGS, segment / SIMD / control chips, and the
// calling-convention footer. Mirrors the original renderRegisters().
import { REG_FOOTER_HTML, REGS_INTRO_HTML } from '../../data/introHtml';
import { REGION_TIPS } from '../../data/registerMeta';
import { countRegChanges, deriveRegisters } from '../../lib/registers';
import { S } from '../../data/steps';
import { useSim } from '../../hooks/SimulatorContext';
import { Html } from '../Html';
import { MemoryIntro } from '../MemoryIntro';
import { ControlFlowStrip } from './ControlFlowStrip';
import { GeneralPurposeTable } from './GeneralPurposeTable';
import { FlagsGrid } from './FlagsGrid';
import { ControlChips, SegmentChips, SimdChips } from './RegisterChips';

const CAPTION = { color: 'var(--t4)', textTransform: 'none' as const, letterSpacing: 0 };

/** A section divider label with a muted trailing caption. */
function SubLabel({ tip, children, caption }: { tip: string; children: string; caption: string }) {
    return (
        <div className="reg-sub tip" data-tip={tip}>
            {children} <span style={CAPTION}>{caption}</span>
        </div>
    );
}

interface RegisterPanelProps {
    /** When true the panel is always expanded (the standalone CPU Registers tab). */
    forceOpen?: boolean;
}

export function RegisterPanel({ forceOpen = false }: RegisterPanelProps) {
    const { cur, regionOpen, toggleRegion } = useSim();
    const s = S[cur];
    const R = deriveRegisters(s, cur);
    const prev = R.changed;
    const open = forceOpen || regionOpen.regs;
    const nChg = countRegChanges(R);

    return (
        <div className="mr">
            <div className="mr-hdr mr-reg-hdr" onClick={() => toggleRegion('regs')}>
                <span className={`mr-chevron${open ? ' open' : ''}`}>▶</span>
                <span className="mr-title tip" data-tip={REGION_TIPS.regs}>
                    CPU REGISTERS
                </span>
                <span className="mr-size">x86-64 · core 0</span>
                {nChg > 0 && (
                    <span
                        className="reg-chg-badge tip"
                        data-tip={`${nChg} register value(s) changed since the previous step (highlighted yellow below)`}
                    >
                        Δ {nChg} changed
                    </span>
                )}
                <span style={{ flex: 1 }} />
                <span className="mr-addr">PC {R.pc}</span>
            </div>
            <div
                className={`mr-body${open ? '' : ' collapsed'}`}
                style={{ maxHeight: open ? '9999px' : '0' }}
            >
                <MemoryIntro
                    introKey="regs"
                    title="What are CPU registers? (read me first)"
                    bodyHtml={REGS_INTRO_HTML}
                />
                <ControlFlowStrip R={R} prev={prev} step={s} />

                <SubLabel
                    tip="The 16 main registers the CPU does general work with (math, holding pointers, passing arguments). The same physical register can be read at 4 widths: 64-bit (RAX), 32-bit (EAX), 16-bit (AX), 8-bit (AL/AH). 'volatile' = a called function may overwrite it; 'saved' = a called function must preserve it."
                    caption="— the CPU’s main work registers (4 sizes each)"
                >
                    General-purpose (16) · RAX–R15
                </SubLabel>
                <GeneralPurposeTable R={R} prev={prev} />

                <SubLabel
                    tip="RFLAGS holds 1-bit results of the last operation. Example: ZF (zero flag) turns on when a comparison came out equal/zero — that is how 'if' statements decide which way to branch. Green = bit is set (1)."
                    caption="— status bits set by the last operation (drives if/loops)"
                >
                    {`RFLAGS · ${R.rflags}`}
                </SubLabel>
                <FlagsGrid R={R} />

                <SubLabel
                    tip="Segment registers are a leftover from older CPUs. In 64-bit mode most are unused; CS/SS still encode privilege level, and FS/GS give each thread a private base address (used for thread-local storage)."
                    caption="— mostly legacy; FS/GS give per-thread storage"
                >
                    Segment registers (6)
                </SubLabel>
                <SegmentChips R={R} />

                <SubLabel
                    tip="SIMD registers hold several numbers at once so one instruction can process them in parallel (used for floating-point and vector math). XMM = 128-bit, YMM = 256-bit, ZMM = 512-bit; the smaller ones are the low part of the bigger ones."
                    caption="— wide registers for float & parallel math"
                >
                    Floating-point / SIMD (XMM · YMM · ZMM)
                </SubLabel>
                <SimdChips R={R} />

                <SubLabel
                    tip="Control registers configure the CPU itself (paging, protection, features). They are privileged — only the operating system kernel can write them, not your program. Shown here for completeness."
                    caption="— OS/kernel-only CPU configuration"
                >
                    Control registers (CR0–CR4)
                </SubLabel>
                <ControlChips R={R} />

                <Html className="reg-note" html={REG_FOOTER_HTML} />
            </div>
        </div>
    );
}
