// A single memory cell row: address · name (+ lifecycle tag) · value.
// Faithful JSX port of the original rowHtml(), preserving data-addr/data-ptr wiring
// used by the tooltip and pointer-highlight hooks.
import { ADDR_TIPS, TAG_TIPS, VAL_TIPS } from '../../data/registerMeta';
import type { MemoryRow as Row } from '../../types';

const TAG_LABEL: Record<string, string> = { new: 'new', upd: 'upd', free: 'freed' };
const ANIM: Record<string, string> = { new: 'is-new', upd: 'is-upd', free: 'is-free' };

export function MemoryRow({ r }: { r: Row }) {
    const tagKey = r.tag === 'new' || r.tag === 'upd' || r.tag === 'free' ? r.tag : '';
    const addrTipText = (ADDR_TIPS as Record<string, string>)[r.addr];
    const valKey = typeof r.val === 'string' ? r.val.trim() : '';
    const valTipText = (VAL_TIPS as Record<string, string>)[valKey];
    const ptrMatch =
        r.cls === 'ptr' && typeof r.val === 'string'
            ? r.val.match(/0x[0-9A-Fa-f]+/)?.[0]
            : undefined;

    return (
        <div className={`mrow ${tagKey ? ANIM[tagKey] : ''}`.trim()}>
            <div
                className={`mc addr${addrTipText ? ' tip' : ''}`}
                data-tip={addrTipText}
                data-addr={r.addr}
            >
                {r.addr}
            </div>
            <div className="mc name tip" data-tip={r.name}>
                {r.name}
                {tagKey && (
                    <span
                        className={`badge-tag bt-${tagKey}${TAG_TIPS ? ' tip tip-below' : ''}`}
                        data-tip={(TAG_TIPS as Record<string, string>)[tagKey]}
                    >
                        {TAG_LABEL[tagKey]}
                    </span>
                )}
            </div>
            <div
                className={`mc val ${r.cls ?? ''}${valTipText ? ' tip' : ''}`.trim()}
                data-tip={valTipText}
                data-ptr={ptrMatch}
            >
                {r.val}
            </div>
        </div>
    );
}
