import { useEffect, useRef, useState } from 'react';
import type { Card, CardDraft, Workspace } from '../lib/model';
import { ACCENTS, getBacklinks } from '../lib/model';
import { Icon } from './Icon';

interface CardEditorProps {
  card: Card;
  workspace: Workspace;
  onChange: (id: string, draft: CardDraft) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onOpenCard: (id: string) => void;
}

export function CardEditor({ card, workspace, onChange, onDelete, onClose, onOpenCard }: CardEditorProps) {
  const [tagText, setTagText] = useState(card.tags.join(', '));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkQuery, setLinkQuery] = useState('');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const backlinks = getBacklinks(workspace, card.id);
  const candidates = workspace.cards.filter((item) => item.id !== card.id &&
    `${item.title} ${item.tags.join(' ')}`.toLocaleLowerCase().includes(linkQuery.toLocaleLowerCase()));

  useEffect(() => {
    setTagText(card.tags.join(', '));
    setConfirmDelete(false);
    setLinkQuery('');
    titleRef.current?.focus();
  }, [card.id]);

  function saveTags() {
    onChange(card.id, { tags: tagText.split(',') });
  }

  function toggleLink(target: string) {
    const links = card.links.includes(target)
      ? card.links.filter((id) => id !== target)
      : [...card.links, target];
    onChange(card.id, { links });
  }

  return (
    <div className="editor-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className={`editor-panel accent-${card.accent}`} role="dialog" aria-modal="true" aria-label="Edit card">
        <div className="editor-accent-line" />
        <header className="editor-header">
          <div className="editor-breadcrumb"><span className={`tiny-dot ${card.accent}`} /> CARD / {card.id.slice(0, 12).toUpperCase()}</div>
          <div className="editor-header-actions">
            <span className="save-state"><span className="status-dot" /> Saved locally</span>
            <button className="icon-button" onClick={onClose} aria-label="Close editor"><Icon name="close" size={21} /></button>
          </div>
        </header>

        <div className="editor-scroll">
          <section className="editor-main">
            <div className="field-label"><span>01</span> THE IDEA</div>
            <textarea ref={titleRef} className="title-input" value={card.title} rows={2}
              onChange={(event) => onChange(card.id, { title: event.target.value })}
              placeholder="Give this thought a name…" aria-label="Card title" />
            <textarea className="body-input" value={card.body}
              onChange={(event) => onChange(card.id, { body: event.target.value })}
              placeholder="Write what matters. Plain text, no distractions…" aria-label="Card content" />
            <div className="editor-hint">PLAIN TEXT · {card.body.length} CHARACTERS</div>
          </section>

          <section className="editor-section">
            <div className="field-label"><span>02</span> FILE UNDER</div>
            <div className="tag-input-wrap">
              <span className="tag-hash">#</span>
              <input value={tagText} onChange={(event) => setTagText(event.target.value)}
                onBlur={saveTags} onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                placeholder="research, inspiration, someday" aria-label="Tags separated by commas" />
            </div>
            <p className="field-help">Separate tags with commas. Press Enter to file them.</p>
            <div className="accent-picker" aria-label="Card color">
              <span>CARD COLOR</span>
              <div>{ACCENTS.map((accent) => (
                <button key={accent} className={`accent-option ${accent} ${card.accent === accent ? 'selected' : ''}`}
                  onClick={() => onChange(card.id, { accent })} aria-label={`${accent} card`} aria-pressed={card.accent === accent}>
                  {card.accent === accent && <Icon name="check" size={13} />}
                </button>
              ))}</div>
            </div>
          </section>

          <section className="editor-section">
            <div className="field-label connection-label"><div><span>03</span> CONNECTIONS</div><b>{card.links.length}</b></div>
            <p className="field-help">Good ideas rarely live alone. Link this card to its neighbors.</p>
            {card.links.length > 0 && <div className="linked-cards">
              {card.links.map((id) => {
                const linked = workspace.cards.find((item) => item.id === id);
                if (!linked) return null;
                return <button key={id} className="linked-card" onClick={() => onOpenCard(id)}>
                  <span className={`tiny-dot ${linked.accent}`} /><span>{linked.title || 'Untitled card'}</span><Icon name="arrow" size={14} />
                </button>;
              })}
            </div>}
            <div className="link-picker">
              <div className="link-search"><Icon name="link" size={16} /><input value={linkQuery}
                onChange={(event) => setLinkQuery(event.target.value)} placeholder="Find a card to connect…" aria-label="Find card to connect" /></div>
              <div className="link-candidates">
                {candidates.map((candidate) => {
                  const linked = card.links.includes(candidate.id);
                  return <button key={candidate.id} className={linked ? 'linked' : ''} onClick={() => toggleLink(candidate.id)}>
                    <span className={`candidate-check ${linked ? 'checked' : ''}`}>{linked && <Icon name="check" size={12} />}</span>
                    <span>{candidate.title || 'Untitled card'}</span>
                    <small>{linked ? 'CONNECTED' : 'CONNECT'}</small>
                  </button>;
                })}
                {candidates.length === 0 && <div className="no-candidates">No other cards match.</div>}
              </div>
            </div>
            {backlinks.length > 0 && <div className="backlinks">
              <div className="backlinks-title">REFERENCED BY <span>{backlinks.length}</span></div>
              {backlinks.map((linked) => <button key={linked.id} onClick={() => onOpenCard(linked.id)}>
                <Icon name="arrow" size={13} /> {linked.title || 'Untitled card'}
              </button>)}
            </div>}
          </section>
        </div>

        <footer className="editor-footer">
          <span className="editor-date"><Icon name="clock" size={14} /> Edited {new Date(card.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          {confirmDelete ? <div className="delete-confirm"><span>Delete forever?</span><button onClick={() => onDelete(card.id)}>Yes, delete</button><button onClick={() => setConfirmDelete(false)}>Keep it</button></div>
            : <button className="delete-button" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={15} /> Delete card</button>}
        </footer>
      </aside>
    </div>
  );
}
