import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { Card, Workspace } from '../src/lib/model';
import {
  addCard, createCard, createSeedWorkspace, deleteCard, filterCards, getAllTags,
  getBacklinks, normalizeTags, parseWorkspace, serializeWorkspace, toggleLink, updateCard,
} from '../src/lib/model';

const NOW = '2026-02-03T04:05:06.000Z';

function workspaceOf(cards: Card[]): Workspace {
  return { version: 1, cards };
}

function card(id: string, links: string[] = [], tags: string[] = []): Card {
  return { ...createCard({ title: `Title ${id}`, body: `Body ${id}`, links, tags }, NOW, id) };
}

describe('card model', () => {
  it('creates a useful blank card and normalizes tags', () => {
    const result = createCard({ title: '', tags: [' Ideas ', 'ideas', '  ', 'Two   words'] }, NOW, 'one');
    expect(result).toMatchObject({ id: 'one', title: 'Untitled card', tags: ['Ideas', 'Two words'], createdAt: NOW, updatedAt: NOW });
  });

  it('adds cards at the front and drops links to unknown cards', () => {
    const original = workspaceOf([card('existing')]);
    const { workspace, card: created } = addCard(original, { title: 'New', links: ['existing', 'missing'] }, NOW, 'new');
    expect(created.links).toEqual(['existing']);
    expect(workspace.cards.map((item) => item.id)).toEqual(['new', 'existing']);
    expect(original.cards).toHaveLength(1);
  });

  it('updates only the requested card and prevents self-links', () => {
    const original = workspaceOf([card('a', ['b']), card('b')]);
    const updated = updateCard(original, 'a', { title: 'Changed', links: ['a', 'b', 'missing'], tags: ['One', 'one', 'Two'] }, '2026-03-01T00:00:00.000Z');
    expect(updated.cards[0]).toMatchObject({ title: 'Changed', links: ['b'], tags: ['One', 'Two'], updatedAt: '2026-03-01T00:00:00.000Z' });
    expect(updated.cards[1]).toEqual(original.cards[1]);
    expect(original.cards[0].title).toBe('Title a');
  });

  it('deletes a card and removes every dangling inbound link', () => {
    const original = workspaceOf([card('a', ['b']), card('b', ['a']), card('c', ['b', 'a'])]);
    const result = deleteCard(original, 'b');
    expect(result.cards.map((item) => item.id)).toEqual(['a', 'c']);
    expect(result.cards.every((item) => !item.links.includes('b'))).toBe(true);
  });

  it('toggles links in both directions and computes backlinks', () => {
    let workspace = workspaceOf([card('a'), card('b')]);
    workspace = toggleLink(workspace, 'a', 'b', NOW);
    expect(workspace.cards[0].links).toEqual(['b']);
    expect(getBacklinks(workspace, 'b').map((item) => item.id)).toEqual(['a']);
    workspace = toggleLink(workspace, 'a', 'b', NOW);
    expect(workspace.cards[0].links).toEqual([]);
    expect(toggleLink(workspace, 'a', 'a')).toBe(workspace);
    expect(toggleLink(workspace, 'a', 'missing')).toBe(workspace);
  });

  it('filters content, tags, and linked titles with deterministic sorting', () => {
    const a = { ...card('a', ['b'], ['Research']), title: 'Alpha', updatedAt: '2026-01-01T00:00:00.000Z' };
    const b = { ...card('b'), title: 'HyperCard history', body: 'A stack from 1987' };
    const c = { ...card('c', [], ['research']), title: 'Beta' };
    const workspace = workspaceOf([a, b, c]);
    expect(filterCards(workspace, '1987').map((item) => item.id)).toEqual(['b']);
    expect(filterCards(workspace, 'hypercard').map((item) => item.id)).toEqual(['b', 'a']);
    expect(filterCards(workspace, '', 'RESEARCH').map((item) => item.id)).toEqual(['c', 'a']);
    expect(filterCards(workspace, '', '', 'title').map((item) => item.id)).toEqual(['a', 'c', 'b']);
    expect(getAllTags(workspace)).toEqual([{ name: 'Research', count: 2 }]);
  });
});

describe('portable JSON workspace', () => {
  it('round-trips a seeded workspace without data loss', () => {
    const seed = createSeedWorkspace();
    expect(parseWorkspace(serializeWorkspace(seed))).toEqual(seed);
  });

  it('removes orphan and self-links on import', () => {
    const parsed = parseWorkspace(JSON.stringify({ version: 1, cards: [{ id: 'a', title: 'A', links: ['a', 'ghost'] }] }));
    expect(parsed.cards[0].links).toEqual([]);
  });

  it.each([
    ['{bad', 'not valid JSON'],
    ['null', 'Choose a RE:STACK'],
    ['{"version":2,"cards":[]}', 'Unsupported workspace version'],
    ['{"version":1}', 'missing its cards'],
    ['{"version":1,"cards":[{"id":"same"},{"id":"same"}]}', 'duplicate card ids'],
    ['{"version":1,"cards":[{"id":"bad id"}]}', 'invalid id'],
    ['{"version":1,"cards":[{"id":"ok","tags":"not-array"}]}', 'invalid tags'],
  ])('rejects malformed input with an actionable error', (input, message) => {
    expect(() => parseWorkspace(input)).toThrow(message);
  });

  it('supplies safe defaults for optional card fields', () => {
    const result = parseWorkspace('{"version":1,"cards":[{"id":"minimal"}]}');
    expect(result.cards[0]).toMatchObject({ id: 'minimal', title: 'Untitled card', body: '', tags: [], links: [], accent: 'lime' });
  });
});

describe('property-based invariants', () => {
  it('normalizes arbitrary tag lists idempotently', () => {
    fc.assert(fc.property(fc.array(fc.string(), { maxLength: 30 }), (tags) => {
      const once = normalizeTags(tags);
      expect(normalizeTags(once)).toEqual(once);
      expect(once.length).toBeLessThanOrEqual(8);
      expect(new Set(once.map((tag) => tag.toLocaleLowerCase())).size).toBe(once.length);
      expect(once.every((tag) => tag.length > 0 && tag.length <= 32 && tag.trim() === tag)).toBe(true);
    }), { numRuns: 150 });
  });

  const idArbitrary = fc.stringMatching(/^[a-z][a-z0-9_-]{0,15}$/);
  it('never leaves dangling or duplicate links after arbitrary deletions', () => {
    fc.assert(fc.property(fc.uniqueArray(idArbitrary, { minLength: 1, maxLength: 15 }), fc.nat(), (ids, rawIndex) => {
      const cards = ids.map((id, index) => card(id, ids.filter((_, target) => target !== index && (target + index) % 3 === 0)));
      const workspace = workspaceOf(cards);
      const removed = ids[rawIndex % ids.length];
      const result = deleteCard(workspace, removed);
      const remaining = new Set(result.cards.map((item) => item.id));
      expect(result.cards).toHaveLength(ids.length - 1);
      expect(remaining.has(removed)).toBe(false);
      for (const item of result.cards) {
        expect(new Set(item.links).size).toBe(item.links.length);
        expect(item.links.every((target) => remaining.has(target) && target !== item.id)).toBe(true);
      }
    }), { numRuns: 150 });
  });

  it('keeps JSON round-trips stable for arbitrary valid workspaces', () => {
    const cardArbitrary = idArbitrary.map((id) => card(id));
    fc.assert(fc.property(fc.uniqueArray(cardArbitrary, { selector: (item) => item.id, maxLength: 12 }), (cards) => {
      const withLinks = cards.map((item, index) => ({ ...item, links: cards.filter((_, target) => target !== index && target % 2 === index % 2).map((target) => target.id) }));
      const workspace = workspaceOf(withLinks);
      const first = parseWorkspace(serializeWorkspace(workspace));
      const second = parseWorkspace(serializeWorkspace(first));
      expect(second).toEqual(first);
      expect(first.cards.map((item) => item.id)).toEqual(cards.map((item) => item.id));
    }), { numRuns: 100 });
  });
});
