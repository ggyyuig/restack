import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardEditor } from './components/CardEditor';
import { Graph } from './components/Graph';
import { Icon } from './components/Icon';
import { SearchDialog } from './components/SearchDialog';
import type { CardDraft, SortMode, Workspace } from './lib/model';
import {
  ACCENTS, addCard, createSeedWorkspace, deleteCard, filterCards, getAllTags,
  parseWorkspace, serializeWorkspace, updateCard,
} from './lib/model';
import type { StorageLike } from './lib/storage';
import { loadWorkspace, saveWorkspace } from './lib/storage';

type View = 'deck' | 'graph';

function browserStorage(): StorageLike | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
}

export default function App() {
  const storage = useRef<StorageLike | undefined>(browserStorage());
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace(storage.current));
  const [view, setView] = useState<View>('deck');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [sort, setSort] = useState<SortMode>('updated');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [graphFocus, setGraphFocus] = useState(workspace.cards[0]?.id ?? '');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [saved, setSaved] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedCard = workspace.cards.find((card) => card.id === selectedId);
  const visibleCards = useMemo(() => filterCards(workspace, query, activeTag, sort), [workspace, query, activeTag, sort]);
  const tags = useMemo(() => getAllTags(workspace), [workspace]);
  const totalLinks = useMemo(() => workspace.cards.reduce((sum, card) => sum + card.links.length, 0), [workspace.cards]);

  useEffect(() => setSaved(saveWorkspace(storage.current, workspace)), [workspace]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleNew = useCallback(() => {
    const result = addCard(workspace, {
      title: '', body: '', tags: activeTag ? [activeTag] : [],
      accent: ACCENTS[workspace.cards.length % ACCENTS.length],
    });
    setWorkspace(result.workspace);
    setSelectedId(result.card.id);
    setGraphFocus(result.card.id);
    setSearchOpen(false);
    setMobileNav(false);
  }, [workspace, activeTag]);

  const handleOpen = useCallback((id: string) => {
    setSelectedId(id);
    setGraphFocus(id);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
        return;
      }
      if (event.key === 'Escape') {
        setSelectedId(null);
        setSearchOpen(false);
        setMobileNav(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLocaleLowerCase() === 'n') {
        event.preventDefault();
        handleNew();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNew]);

  function handleChange(id: string, draft: CardDraft) {
    setWorkspace((current) => updateCard(current, id, draft));
  }

  function handleDelete(id: string) {
    setWorkspace((current) => deleteCard(current, id));
    setSelectedId(null);
    setToast('Card returned to the ether.');
  }

  function handleExport() {
    const blob = new Blob([serializeWorkspace(workspace)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `restack-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast(`Stack exported · ${workspace.cards.length} cards, safely yours.`);
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setToast('That file is too large. Choose a workspace under 2 MB.');
      return;
    }
    try {
      const imported = parseWorkspace(await file.text());
      if (!window.confirm(`Replace this stack with ${imported.cards.length} imported cards? Export your current stack first if you need a copy.`)) return;
      setWorkspace(imported);
      setSelectedId(null);
      setGraphFocus(imported.cards[0]?.id ?? '');
      setQuery('');
      setActiveTag('');
      setToast(`Welcome home, ${imported.cards.length} cards. Import complete.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not import this workspace.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function changeView(next: View) {
    setView(next);
    setMobileNav(false);
  }

  function chooseTag(tag: string) {
    setActiveTag((current) => current === tag ? '' : tag);
    setView('deck');
    setMobileNav(false);
  }

  function resetDemo() {
    if (!window.confirm('Replace your current stack with the original demo? Export first if you want to keep your work.')) return;
    const seed = createSeedWorkspace();
    setWorkspace(seed);
    setSelectedId(null);
    setGraphFocus(seed.cards[0].id);
    setQuery('');
    setActiveTag('');
    setToast('The original stack is back. A fresh 1987.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileNav((open) => !open)} aria-label="Toggle navigation"><Icon name="menu" /></button>
        <button className="brand" onClick={() => changeView('deck')} aria-label="RE:STACK home">
          <span className="brand-mark"><i /><i /><i><span /></i></span>
          <span className="brand-word">RE:STACK<span className="brand-dot">®</span></span>
        </button>
        <div className="topbar-crumb"><span>WORKSPACE</span><Icon name="chevron" size={12} /><strong>MY IDEA STACK</strong></div>
        <div className="topbar-actions">
          <span className={`sync-status ${saved ? '' : 'warning'}`}><span className="status-dot" />{saved ? 'SAVED ON THIS DEVICE' : 'STORAGE UNAVAILABLE'}</span>
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><Icon name="search" size={17} /><span>Find anything…</span><kbd>⌘ K</kbd></button>
          <button className="button secondary export-top" onClick={handleExport}><Icon name="download" size={16} />Export</button>
          <button className="button primary" onClick={handleNew}><Icon name="plus" size={18} />New card<span className="button-key">N</span></button>
        </div>
      </header>

      <div className="workspace-layout">
        {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
        <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
          <div className="sidebar-heading"><span>YOUR WORKSPACE</span><span>01</span></div>
          <div className="stack-identity">
            <div className="stack-identity-icon"><Icon name="stack" size={22} /></div>
            <div><strong>My idea stack</strong><span>A WORK IN PROGRESS</span></div>
            <span className="local-pill">LOCAL</span>
          </div>

          <nav className="main-nav" aria-label="Workspace views">
            <button className={view === 'deck' ? 'active' : ''} onClick={() => changeView('deck')}>
              <Icon name="grid" size={18} /><span>Card deck</span><b>{workspace.cards.length}</b>
            </button>
            <button className={view === 'graph' ? 'active' : ''} onClick={() => changeView('graph')}>
              <Icon name="graph" size={18} /><span>Constellation</span><b>{totalLinks}</b>
            </button>
          </nav>

          <div className="sidebar-rule" />
          <div className="sidebar-heading tags-heading"><span>COLLECTIONS</span><span>{String(tags.length).padStart(2, '0')}</span></div>
          <div className="tag-nav">
            {tags.map((tag) => <button key={tag.name.toLocaleLowerCase()} className={activeTag.toLocaleLowerCase() === tag.name.toLocaleLowerCase() ? 'active' : ''}
              onClick={() => chooseTag(tag.name)}><span className="tag-prefix">#</span><span>{tag.name}</span><b>{tag.count}</b></button>)}
            {tags.length === 0 && <p className="no-tags">Tags you create will gather here.</p>}
          </div>

          <div className="sidebar-spacer" />
          <div className="retro-note">
            <div className="retro-note-top"><span>FROM THE ARCHIVE</span><Icon name="sparkle" size={15} /></div>
            <div className="retro-art" aria-hidden="true"><div className="retro-card-back" /><div className="retro-card-front"><span>Hello,</span><strong>ideas.</strong><i>↗</i></div></div>
            <p>“The best ideas<br/>are connected.”</p>
            <span className="retro-caption">HYPERCARD SPIRIT · 1987—FOREVER</span>
          </div>

          <div className="data-controls">
            <button onClick={handleExport}><Icon name="download" size={16} /><span>Export stack</span></button>
            <button onClick={() => fileInput.current?.click()}><Icon name="upload" size={16} /><span>Import JSON</span></button>
            <button onClick={resetDemo} title="Restore demo workspace"><Icon name="reset" size={16} /><span>Restore demo</span></button>
          </div>
          <div className="sidebar-footer"><span className="human-avatar">Y</span><div><strong>Your private corner</strong><span>NO ACCOUNT · NO TRACKING</span></div><span className="status-dot" /></div>
        </aside>

        <main className="main-stage">
          {view === 'deck' ? <>
            <section className="deck-hero">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> HYPERCARD, REWIRED <span className="year-chip">1987 → NOW</span></div>
                <h1>A place for ideas<br/>to <em>find each other.</em></h1>
                <p>One thought per card. A few good connections. <br/>A stack that becomes more yours over time.</p>
              </div>
              <div className="hero-aside" aria-hidden="true">
                <span className="hero-spark">✳</span>
                <div className="hero-note"><span>NOT A FEED.</span><strong>A garden.</strong><i>↗</i></div>
                <span className="hero-note-caption">TEND TO YOUR CURIOSITY</span>
              </div>
            </section>

            <section className="deck-section">
              <div className="deck-toolbar">
                <div className="deck-title"><h2>{activeTag ? `#${activeTag}` : 'All cards'}</h2><span>{visibleCards.length.toString().padStart(2, '0')}</span></div>
                <div className="deck-tools">
                  <label className="inline-search"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this stack…" aria-label="Filter cards" />{query && <button onClick={() => setQuery('')} aria-label="Clear filter"><Icon name="close" size={13} /></button>}</label>
                  <label className="sort-select"><span>SORT:</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort cards"><option value="updated">RECENT</option><option value="created">CREATED</option><option value="title">A—Z</option></select></label>
                </div>
              </div>

              {visibleCards.length > 0 ? <div className="card-grid">
                {visibleCards.map((card, index) => <button key={card.id} className={`idea-card accent-${card.accent}`} onClick={() => handleOpen(card.id)}>
                  <div className="idea-card-top"><span>NO. {String(index + 1).padStart(3, '0')}</span><span className="card-open-icon"><Icon name="arrow" size={18} /></span></div>
                  <div className="idea-card-content"><h3>{card.title || 'Untitled card'}</h3><p>{card.body || 'A blank card, ready for an idea.'}</p></div>
                  <div className="idea-tags">{card.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}{card.tags.length === 0 && <span>#unfiled</span>}</div>
                  <div className="idea-card-footer"><span><Icon name="clock" size={12} />{shortDate(card.updatedAt)}</span><span><Icon name="link" size={13} />{card.links.length} {card.links.length === 1 ? 'LINK' : 'LINKS'}</span></div>
                </button>)}
                {!query && !activeTag && <button className="new-card-tile" onClick={handleNew}><span className="new-card-plus"><Icon name="plus" size={25} /></span><strong>Make room for a new thought.</strong><span>CREATE A BLANK CARD <Icon name="arrow" size={13} /></span></button>}
              </div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" size={28} /></div><span className="mono">ZERO MATCHES · INFINITE POSSIBILITIES</span><h2>No cards on this wavelength.</h2><p>Try another search, or turn this thought into a new card.</p><div><button className="button secondary" onClick={() => { setQuery(''); setActiveTag(''); }}>Clear filters</button><button className="button primary" onClick={handleNew}><Icon name="plus" size={16} />New card</button></div></div>}
            </section>
            <footer className="main-footer"><span>RE:STACK / A LOVE LETTER TO PERSONAL SOFTWARE</span><span><i className="status-dot" /> YOUR DATA NEVER LEAVES THIS BROWSER</span></footer>
          </> : <>
            <section className="graph-hero">
              <div><div className="eyebrow"><span className="eyebrow-line" /> THE CONSTELLATION VIEW</div><h1>See what your ideas<br/>are <em>up to.</em></h1><p>Follow the lines. Find the outliers. Every connection is a little act of thinking.</p></div>
              <div className="graph-stat"><strong>{totalLinks}</strong><span>CONNECTIONS<br/>AND COUNTING</span></div>
            </section>
            <Graph workspace={workspace} focusId={graphFocus} onFocus={setGraphFocus} onOpen={handleOpen} />
            <footer className="main-footer"><span>TIP: HOVER TO TRACE A THOUGHT</span><span><i className="status-dot" /> YOUR DATA NEVER LEAVES THIS BROWSER</span></footer>
          </>}
        </main>
      </div>

      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(event) => handleImport(event.target.files?.[0])} />
      {selectedCard && <CardEditor key={selectedCard.id} card={selectedCard} workspace={workspace} onChange={handleChange}
        onDelete={handleDelete} onClose={() => setSelectedId(null)} onOpenCard={handleOpen} />}
      {searchOpen && <SearchDialog workspace={workspace} onClose={() => setSearchOpen(false)} onOpen={handleOpen} />}
      {toast && <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><Icon name="close" size={14} /></button></div>}
    </div>
  );
}
