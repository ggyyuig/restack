import { useMemo, useState } from 'react';
import type { Card, Workspace } from '../lib/model';
import { Icon } from './Icon';

interface GraphProps {
  workspace: Workspace;
  focusId: string;
  onFocus: (id: string) => void;
  onOpen: (id: string) => void;
}

interface PositionedCard extends Card { x: number; y: number }

function titleLines(title: string): string[] {
  const clean = title || 'Untitled card';
  if (clean.length <= 22) return [clean];
  const breakpoint = clean.lastIndexOf(' ', 22);
  const split = breakpoint > 8 ? breakpoint : 22;
  return [clean.slice(0, split), `${clean.slice(split).trim().slice(0, 21)}${clean.length > split + 21 ? '…' : ''}`];
}

export function Graph({ workspace, focusId, onFocus, onOpen }: GraphProps) {
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const focused = workspace.cards.find((card) => card.id === focusId) ?? workspace.cards[0];
  const positioned = useMemo<PositionedCard[]>(() => {
    const cards = [...workspace.cards].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 25);
    const centerId = cards.some((card) => card.id === focusId) ? focusId : cards[0]?.id;
    const center = cards.find((card) => card.id === centerId);
    const others = cards.filter((card) => card.id !== centerId);
    const placed = others.map((card, index) => {
      const outer = index >= 8;
      const ringIndex = outer ? index - 8 : index;
      const ringCount = outer ? others.length - 8 : Math.min(others.length, 8);
      const angle = (ringIndex / Math.max(ringCount, 1)) * Math.PI * 2 - Math.PI / 2 + (outer ? 0.18 : 0);
      const rx = outer ? 440 : 290;
      const ry = outer ? 265 : 188;
      return { ...card, x: 500 + Math.cos(angle) * rx, y: 310 + Math.sin(angle) * ry };
    });
    return center ? [{ ...center, x: 500, y: 310 }, ...placed] : placed;
  }, [workspace.cards, focusId]);

  const visibleIds = new Set(positioned.map((card) => card.id));
  const edges = workspace.cards.flatMap((source) => source.links
    .filter((target) => visibleIds.has(source.id) && visibleIds.has(target))
    .map((target) => ({ source: positioned.find((card) => card.id === source.id)!, target: positioned.find((card) => card.id === target)! })));
  const related = new Set<string>();
  if (hovered) {
    related.add(hovered);
    workspace.cards.find((card) => card.id === hovered)?.links.forEach((id) => related.add(id));
    workspace.cards.filter((card) => card.links.includes(hovered)).forEach((card) => related.add(card.id));
  }

  if (!focused) {
    return <div className="graph-empty"><Icon name="graph" size={38} /><h2>Your constellation starts with one card.</h2><p>Create a card, then connect it to another.</p></div>;
  }

  return (
    <div className="graph-shell">
      <div className="graph-topline"><span><i /> LIVE MAP · CLICK A CARD TO FOCUS · DOUBLE-CLICK TO OPEN</span><span>{positioned.length} NODES / {edges.length} EDGES</span></div>
      <svg className="graph-canvas" viewBox="0 0 1000 620" role="img" aria-label="Map of connections between your cards">
        <defs>
          <pattern id="dotGrid" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" /></pattern>
          <marker id="edgeArrow" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7Z" fill="currentColor" /></marker>
          <filter id="nodeShadow" x="-20%" y="-20%" width="150%" height="160%"><feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#1c1d1a" floodOpacity=".18" /></filter>
        </defs>
        <rect width="1000" height="620" className="graph-grid" fill="url(#dotGrid)" />
        <g transform={`translate(500 310) scale(${zoom}) translate(-500 -310)`}>
          {edges.map(({ source, target }) => {
            const key = `${source.id}-${target.id}`;
            const isActive = !hovered || (related.has(source.id) && related.has(target.id) && (source.id === hovered || target.id === hovered));
            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;
            const bend = source.id < target.id ? 18 : -18;
            return <path key={key} className={`graph-edge ${isActive ? 'active' : 'muted'}`}
              d={`M${source.x},${source.y} Q${mx + bend},${my - bend} ${target.x},${target.y}`} markerEnd="url(#edgeArrow)" />;
          })}
          {positioned.map((card, index) => {
            const isFocused = card.id === focused.id;
            const isMuted = hovered && !related.has(card.id);
            const lines = titleLines(card.title);
            return <g key={card.id} className={`graph-node ${isFocused ? 'focused' : ''} ${isMuted ? 'muted' : ''}`}
              transform={`translate(${card.x - 79} ${card.y - 34})`} role="button" tabIndex={0}
              aria-label={`${card.title}. ${card.links.length} outgoing links`}
              onMouseEnter={() => setHovered(card.id)} onMouseLeave={() => setHovered(null)}
              onClick={() => onFocus(card.id)} onDoubleClick={() => onOpen(card.id)}
              onKeyDown={(event) => { if (event.key === 'Enter') onOpen(card.id); }}>
              <rect width="158" height="68" rx="8" className={`node-card ${card.accent}`} filter="url(#nodeShadow)" />
              <path d="M9 0h140a9 9 0 0 1 9 9v4H0V9a9 9 0 0 1 9-9Z" className={`node-strip ${card.accent}`} />
              <circle cx="14" cy="7" r="2.5" className="node-dot" />
              <text x="13" y="31" className="node-number">{String(index + 1).padStart(2, '0')} / CARD</text>
              {lines.map((line, lineIndex) => <text key={lineIndex} x="13" y={47 + lineIndex * 13} className="node-title">{line}</text>)}
              {isFocused && <g transform="translate(134 49)"><circle r="12" className="focus-badge"/><path d="m-4 0 3 3 6-7" className="focus-check" /></g>}
            </g>;
          })}
        </g>
      </svg>
      <div className="graph-controls">
        <button onClick={() => setZoom((value) => Math.max(0.65, value - 0.15))} aria-label="Zoom out"><Icon name="minus" size={17} /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((value) => Math.min(1.45, value + 0.15))} aria-label="Zoom in"><Icon name="plus" size={17} /></button>
        <button onClick={() => setZoom(1)} aria-label="Reset zoom"><Icon name="reset" size={15} /></button>
      </div>
      <div className="graph-focus-card">
        <span className={`focus-color ${focused.accent}`} />
        <div><span className="mono">IN FOCUS</span><strong>{focused.title || 'Untitled card'}</strong></div>
        <button onClick={() => onOpen(focused.id)}>Open card <Icon name="arrow" size={15} /></button>
      </div>
      {workspace.cards.length > positioned.length && <div className="graph-limit">Showing the 25 most recently edited cards.</div>}
    </div>
  );
}
