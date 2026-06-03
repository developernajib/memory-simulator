// Collapsible beginner-intro banner shared by the All Regions and CPU Registers
// views. Body HTML is the verbatim copy from the original simulator.
import { useSim } from '../hooks/SimulatorContext';
import type { IntroKey } from '../types';
import { Html } from './Html';

interface MemoryIntroProps {
    introKey: IntroKey;
    title: string;
    bodyHtml: string;
}

export function MemoryIntro({ introKey, title, bodyHtml }: MemoryIntroProps) {
    const { introOpen, toggleIntro } = useSim();
    const open = introOpen[introKey];
    return (
        <div className="mem-intro">
            <div className="mem-intro-hdr" onClick={() => toggleIntro(introKey)}>
                <span className="ico">?</span>
                <span>{title}</span>
                <span className={`chev${open ? ' open' : ''}`}>▶</span>
            </div>
            <Html className={`mem-intro-body${open ? '' : ' collapsed'}`} html={bodyHtml} />
        </div>
    );
}
