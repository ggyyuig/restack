import { useEffect, useRef, useState } from 'react';
import type { Workspace } from '../lib/model';
import { filterCards } from '../lib/model';
import { Icon } from './Icon';

interface SearchDialogProps {
  workspace: Workspace;
  onClose: () => void;
  onOpen: (id: string) => void;
}

export function SearchDialog({ workspace, onClose, onOpen }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = filterCards(workspace, query);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => setActive(0), [query]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      onOpen(results[active].id);
    }
  }

  return (
    <div className="modal-backdrop search-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search your stack">
        <div className="search-input-row">
          <Icon name="search" size={23} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown} placeholder="Find a thought, tag, or connection…" aria-label="Search cards" />
          <button className="key-button" onClick={onClose}>ESC</button>
        </div>
        <div className="search-meta">
          <span>{query ? `${results.length} MATCHING CARDS` : 'JUMP BACK INTO YOUR STACK'}</span>
          <span className="mono">LOCAL SEARCH · NO CLOUD</span>
        </div>
        <div className="search-results" role="listbox">
          {results.map((card, index) => (
            <button key={card.id} className={`search-result ${index === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(index)} onClick={() => onOpen(card.id)} role="option" aria-selected={index === active}>
              <span className={`result-swatch ${card.accent}`}><Icon name="stack" size={18} /></span>
              <span className="result-copy">
                <strong>{card.title || 'Untitled card'}</strong>
                <span>{card.body || 'A blank card, ready for an idea.'}</span>
              </span>
              <span className="result-tags">{card.tags[0] ?? 'note'}</span>
              <Icon name="arrow" size={17} />
            </button>
          ))}
          {results.length === 0 && (
            <div className="search-empty"><Icon name="sparkle" size={28} /><strong>No cards found</strong><span>Try a broader word or create a new card.</span></div>
          )}
        </div>
        <footer className="search-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span>
          <span className="search-footer-right">Your ideas stay yours.</span>
        </footer>
      </section>
    </div>
  );
}
