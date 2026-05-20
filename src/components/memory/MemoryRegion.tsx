// A collapsible memory region (STACK / HEAP / CODE / DATA) with header, optional
// beginner explainer line, and its groups. Faithful port of the original regionHtml().
import { REGION_EXPLAINERS, REGION_TIPS } from '../../data/registerMeta';
import { useSim } from '../../hooks/SimulatorContext';
import type { MemoryGroup as Group, RegionKey } from '../../types';
import { Html } from '../Html';
import { MemoryGroup } from './MemoryGroup';

interface MemoryRegionProps {
  regionKey: RegionKey;
  titleCls: string;
  title: string;
  badge: string;
  sizeStr: string;
  groups: Group[] | null;
  emptyMsg: string;
}

export function MemoryRegion({
  regionKey,
  titleCls,
  title,
  badge,
  sizeStr,
  groups,
  emptyMsg,
}: MemoryRegionProps) {
  const { regionOpen, toggleRegion } = useSim();
  const open = regionOpen[regionKey];
  const hasGroups = !!groups && groups.length > 0;
  const explainer = (REGION_EXPLAINERS as Record<string, string>)[regionKey];
  const tip = (REGION_TIPS as Record<string, string>)[regionKey];
  const maxH = open ? (hasGroups ? '9999px' : '80px') : '0';

  return (
    <div className="mr">
      <div className={`mr-hdr ${titleCls}`} onClick={() => toggleRegion(regionKey)}>
        <span className={`mr-chevron${open ? ' open' : ''}`}>▶</span>
        <span className={tip ? 'mr-title tip' : 'mr-title'} data-tip={tip}>
          {title}
        </span>
        <span className="mr-size">{badge}</span>
        <span style={{ flex: 1 }} />
        <span className="mr-addr">{sizeStr}</span>
      </div>
      <div className={`mr-body${open ? '' : ' collapsed'}`} style={{ maxHeight: maxH }}>
        {hasGroups ? (
          <>
            {explainer && <Html className="region-explainer" html={explainer} />}
            {groups!.map((g, i) => (
              <MemoryGroup g={g} key={`${g.grp}-${i}`} />
            ))}
          </>
        ) : (
          <div className="mem-empty">{emptyMsg}</div>
        )}
      </div>
    </div>
  );
}
