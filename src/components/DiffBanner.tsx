// Thin banner under the center tabs summarizing this step's memory delta.
import { S } from '../data/steps';
import { useSim } from '../hooks/SimulatorContext';

export function DiffBanner() {
  const { cur } = useSim();
  const s = S[cur];
  const allRows = [...(s.stack ?? []), ...(s.heap ?? [])].flatMap((g) => g.rows ?? []);
  const newCnt = allRows.filter((r) => r.tag === 'new').length;
  const updCnt = allRows.filter((r) => r.tag === 'upd').length;
  const freeCnt = allRows.filter((r) => r.tag === 'free').length;
  const heapDelta = (s.heapB ?? 0) - (cur > 0 ? S[cur - 1].heapB ?? 0 : 0);
  const stackDelta = (s.stackB ?? 0) - (cur > 0 ? S[cur - 1].stackB ?? 0 : 0);

  const pills: React.ReactNode[] = [];
  if (newCnt > 0) pills.push(<span className="diff-pill alloc" key="a">+{newCnt} alloc</span>);
  if (updCnt > 0) pills.push(<span className="diff-pill upd" key="u">~ {updCnt} updated</span>);
  if (freeCnt > 0) pills.push(<span className="diff-pill freed" key="f">-{freeCnt} freed</span>);
  if (heapDelta !== 0)
    pills.push(
      <span className="diff-pill heap" key="h">
        {heapDelta > 0 ? '+' : ''}
        {heapDelta} B heap
      </span>,
    );
  if (stackDelta !== 0)
    pills.push(
      <span className="diff-pill stack" key="s">
        {stackDelta > 0 ? '+' : ''}
        {stackDelta} B stack
      </span>,
    );

  return (
    <div className="diff-banner" id="diff-banner">
      {pills.length === 0 ? (
        <span className="diff-label">no memory changes this step</span>
      ) : (
        <>
          <span className="diff-label">Δ this step:</span>
          {pills}
        </>
      )}
    </div>
  );
}
