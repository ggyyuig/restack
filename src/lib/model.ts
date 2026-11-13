export const ACCENTS = ['lime', 'violet', 'peach', 'sky', 'butter'] as const;
export type Accent = (typeof ACCENTS)[number];

export interface Card {
  id: string;
  title: string;
  body: string;
  tags: string[];
  links: string[];
  accent: Accent;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  version: 1;
  cards: Card[];
}

export type CardDraft = Partial<Pick<Card, 'title' | 'body' | 'tags' | 'links' | 'accent'>>;
export type SortMode = 'updated' | 'created' | 'title';

const MAX_CARDS = 1000;
const MAX_TITLE = 180;
const MAX_BODY = 30_000;

export function createId(): string {
  const random = globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `card-${random}`;
}

export function normalizeTags(tags: readonly string[] = []): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of tags) {
    if (typeof value !== 'string') continue;
    const tag = value.trim().replace(/\s+/g, ' ').slice(0, 32);
    const key = tag.toLocaleLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      result.push(tag);
    }
    if (result.length === 8) break;
  }
  return result;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').slice(0, max) : '';
}

function isAccent(value: unknown): value is Accent {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value);
}

function validDate(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback;
}

export function createCard(
  draft: CardDraft = {},
  now = new Date().toISOString(),
  id = createId(),
): Card {
  return {
    id,
    title: cleanText(draft.title, MAX_TITLE) || 'Untitled card',
    body: cleanText(draft.body, MAX_BODY),
    tags: normalizeTags(draft.tags),
    links: [...new Set(draft.links?.filter((link) => typeof link === 'string' && link !== id) ?? [])],
    accent: isAccent(draft.accent) ? draft.accent : 'lime',
    createdAt: now,
    updatedAt: now,
  };
}

export function addCard(
  workspace: Workspace,
  draft: CardDraft = {},
  now = new Date().toISOString(),
  id = createId(),
): { workspace: Workspace; card: Card } {
  const card = createCard(draft, now, id);
  card.links = card.links.filter((target) => workspace.cards.some((item) => item.id === target));
  return { workspace: { version: 1, cards: [card, ...workspace.cards] }, card };
}

export function updateCard(
  workspace: Workspace,
  id: string,
  draft: CardDraft,
  now = new Date().toISOString(),
): Workspace {
  return {
    version: 1,
    cards: workspace.cards.map((card) => {
      if (card.id !== id) return card;
      return {
        ...card,
        title: draft.title === undefined ? card.title : cleanText(draft.title, MAX_TITLE),
        body: draft.body === undefined ? card.body : cleanText(draft.body, MAX_BODY),
        tags: draft.tags === undefined ? card.tags : normalizeTags(draft.tags),
        links: draft.links === undefined ? card.links : [...new Set(draft.links)].filter(
          (target) => target !== id && workspace.cards.some((item) => item.id === target),
        ),
        accent: draft.accent === undefined || !isAccent(draft.accent) ? card.accent : draft.accent,
        updatedAt: now,
      };
    }),
  };
}

export function deleteCard(workspace: Workspace, id: string): Workspace {
  return {
    version: 1,
    cards: workspace.cards
      .filter((card) => card.id !== id)
      .map((card) => card.links.includes(id)
        ? { ...card, links: card.links.filter((target) => target !== id) }
        : card),
  };
}

export function toggleLink(
  workspace: Workspace,
  sourceId: string,
  targetId: string,
  now = new Date().toISOString(),
): Workspace {
  if (sourceId === targetId || !workspace.cards.some((card) => card.id === targetId)) return workspace;
  const source = workspace.cards.find((card) => card.id === sourceId);
  if (!source) return workspace;
  const links = source.links.includes(targetId)
    ? source.links.filter((id) => id !== targetId)
    : [...source.links, targetId];
  return updateCard(workspace, sourceId, { links }, now);
}

export function getBacklinks(workspace: Workspace, id: string): Card[] {
  return workspace.cards.filter((card) => card.links.includes(id));
}

export function getAllTags(workspace: Workspace): { name: string; count: number }[] {
  const tags = new Map<string, { name: string; count: number }>();
  for (const card of workspace.cards) {
    for (const tag of card.tags) {
      const key = tag.toLocaleLowerCase();
      const current = tags.get(key);
      tags.set(key, { name: current?.name ?? tag, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function filterCards(
  workspace: Workspace,
  query = '',
  tag = '',
  sort: SortMode = 'updated',
): Card[] {
  const needle = query.trim().toLocaleLowerCase();
  const tagNeedle = tag.trim().toLocaleLowerCase();
  return workspace.cards
    .filter((card) => !tagNeedle || card.tags.some((item) => item.toLocaleLowerCase() === tagNeedle))
    .filter((card) => {
      if (!needle) return true;
      const linkedTitles = card.links
        .map((id) => workspace.cards.find((item) => item.id === id)?.title ?? '')
        .join(' ');
      return `${card.title}\n${card.body}\n${card.tags.join(' ')}\n${linkedTitles}`
        .toLocaleLowerCase()
        .includes(needle);
    })
    .sort((a, b) => {
      if (sort === 'title') return (a.title || 'Untitled card').localeCompare(b.title || 'Untitled card');
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function serializeWorkspace(workspace: Workspace): string {
  return JSON.stringify({ version: 1, cards: workspace.cards }, null, 2);
}

function parseCard(value: unknown, index: number): Card {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Card ${index + 1} must be an object.`);
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(raw.id)) {
    throw new Error(`Card ${index + 1} has an invalid id.`);
  }
  if (raw.title !== undefined && typeof raw.title !== 'string') {
    throw new Error(`Card ${index + 1} has an invalid title.`);
  }
  if (raw.body !== undefined && typeof raw.body !== 'string') {
    throw new Error(`Card ${index + 1} has invalid content.`);
  }
  if (raw.tags !== undefined && (!Array.isArray(raw.tags) || raw.tags.some((tag) => typeof tag !== 'string'))) {
    throw new Error(`Card ${index + 1} has invalid tags.`);
  }
  if (raw.links !== undefined && (!Array.isArray(raw.links) || raw.links.some((link) => typeof link !== 'string'))) {
    throw new Error(`Card ${index + 1} has invalid links.`);
  }
  const now = new Date().toISOString();
  return {
    ...createCard({
      title: typeof raw.title === 'string' ? raw.title : 'Untitled card',
      body: raw.body as string | undefined,
      tags: raw.tags as string[] | undefined,
      links: raw.links as string[] | undefined,
      accent: raw.accent as Accent | undefined,
    }, now, raw.id),
    title: raw.title === undefined ? 'Untitled card' : cleanText(raw.title, MAX_TITLE),
    createdAt: validDate(raw.createdAt, now),
    updatedAt: validDate(raw.updatedAt, now),
  };
}

export function parseWorkspace(text: string): Workspace {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Choose a RE:STACK workspace file.');
  }
  const data = raw as Record<string, unknown>;
  if (data.version !== 1) throw new Error('Unsupported workspace version. Expected version 1.');
  if (!Array.isArray(data.cards)) throw new Error('The workspace is missing its cards.');
  if (data.cards.length > MAX_CARDS) throw new Error(`Workspaces are limited to ${MAX_CARDS} cards.`);
  const cards = data.cards.map(parseCard);
  if (new Set(cards.map((card) => card.id)).size !== cards.length) {
    throw new Error('The workspace contains duplicate card ids.');
  }
  const ids = new Set(cards.map((card) => card.id));
  return {
    version: 1,
    cards: cards.map((card) => ({
      ...card,
      links: card.links.filter((target) => ids.has(target) && target !== card.id),
    })),
  };
}

export function createSeedWorkspace(): Workspace {
  const stamp = '2026-01-01T12:00:00.000Z';
  const cards: Card[] = [
    {
      id: 'welcome', title: 'A small studio for big ideas.',
      body: 'Welcome to your thinking space.\n\nEvery thought gets a card. Give it a title, write what matters, and connect it to another card. There is no right way to begin.\n\nTry me: open this card, add a tag, or press N for a fresh start.',
      tags: ['start here'], links: ['hypercard', 'connections'], accent: 'lime', createdAt: stamp, updatedAt: '2026-01-06T12:00:00.000Z',
    },
    {
      id: 'hypercard', title: 'HyperCard, reincarnated.',
      body: 'In 1987, HyperCard made software feel personal: a stack of cards, a little text, and links between ideas.\n\nRE:STACK keeps that generous spirit and adds full-text search, portable JSON, and a living constellation view. No account. No cloud. Just you and your stack.',
      tags: ['history', 'start here'], links: ['offline'], accent: 'violet', createdAt: stamp, updatedAt: '2026-01-05T12:00:00.000Z',
    },
    {
      id: 'connections', title: 'Your ideas are a network.',
      body: 'A list tells you what comes next. A network shows you what belongs together.\n\nLink this card to an unexpected neighbor. Open the Constellation view to see the shape of your thinking, then follow a thread somewhere new.',
      tags: ['method'], links: ['field-notes', 'offline'], accent: 'sky', createdAt: stamp, updatedAt: '2026-01-04T12:00:00.000Z',
    },
    {
      id: 'field-notes', title: 'A field guide to noticing.',
      body: 'Collect the things you usually let disappear:\n\n— a sentence overheard on the train\n— the question behind the question\n— an odd connection between two projects\n— something you want to remember to wonder about',
      tags: ['method', 'inspiration'], links: ['connections'], accent: 'peach', createdAt: stamp, updatedAt: '2026-01-03T12:00:00.000Z',
    },
    {
      id: 'offline', title: 'Offline is a feature.',
      body: 'Your stack lives in this browser. Nothing is sent to a server, and there is no feed competing for your attention.\n\nExport a JSON snapshot whenever you like. It is your data, in a format you can actually read.',
      tags: ['offline', 'method'], links: ['welcome'], accent: 'butter', createdAt: stamp, updatedAt: '2026-01-02T12:00:00.000Z',
    },
  ];
  return { version: 1, cards };
}
