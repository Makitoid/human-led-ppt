'use strict';
const L = require('./lib.cjs');

function ctx(slide, theme, slideIdx, evidenceChain) {
  let slot = 0;
  const elements = [];
  const T = theme.scale;
  const add = (el) => {
    el.id = L.idFor(slideIdx, ++slot);
    el.layer = el.layer || 'content';
    el.role = el.role || 'support';
    elements.push(el);
    return el;
  };
  const text = (o) => add({ kind: 'text', size: T.body, color: theme.ink, margin: 0, ...o });
  const rect = (o) => add({ kind: 'rect', fill: theme.panel, line: 'none', ...o });
  const kicker = () => slide.topic && text({
    layer: 'chrome', role: 'detail', x: 56, y: 40, w: 900, h: 24,
    text: slide.topic, size: T.meta, color: theme.muted, bold: true, spacing: 1,
  });
  const title = (primary = false) => slide.title && text({
    layer: 'chrome', role: primary ? 'primary' : 'title', x: 56, y: 70, w: 1168, h: 46,
    text: slide.title, size: T.title, bold: true, tight: true,
  });
  const key = (primary = true) => {
    if (!slide.key) return null;
    const em = slide.emphasis || {};
    const accent = em.tone === 'accent' && (em.role === 'key' || !em.role);
    const warn = em.tone === 'warn' && (em.role === 'key' || !em.role);
    const y = slide.title ? 128 : 76;
    if (accent) rect({ layer: 'card', tone: 'accent', x: 56, y: y - 8, w: 1168, h: 76, fill: theme.accent, radius: 12 });
    if (warn) rect({ layer: 'card', tone: 'warn', x: 56, y: y - 8, w: 8, h: 76, fill: theme.warn });
    return text({
      role: primary ? 'primary' : 'support', x: 72, y, w: 1136, h: 60,
      text: slide.key, size: T.claim, bold: true, tight: true,
      color: accent ? theme.accentInk : warn ? theme.warn : theme.ink,
    });
  };
  const footer = () => evidenceChain === 'on' && slide.source && text({
    layer: 'chrome', role: 'detail', x: 360, y: 642, w: 864, h: 38,
    text: slide.source, size: T.meta, color: theme.muted, align: 'right',
  });
  const bodyTop = () => (slide.key ? (slide.title ? 224 : 172) : (slide.title ? 140 : 76));
  const bodyHeight = () => 636 - bodyTop();
  return { slide, theme, elements, T, add, text, rect, kicker, title, key, footer, bodyTop, bodyHeight };
}

function standard(c, primaryFromTitle = false) {
  c.kicker();
  const hasKey = !!c.slide.key;
  c.title(!hasKey && primaryFromTitle);
  if (hasKey) c.key(true);
  c.footer();
}

function pointsText(items) { return (items || []).join('\n'); }

const RECIPES = {
  cover(c) {
    const { slide, theme, T } = c;
    if (slide.topic) c.text({ layer: 'chrome', role: 'detail', x: 72, y: 168, w: 1000, h: 30, text: slide.topic, size: T.meta, color: theme.muted, bold: true, spacing: 2 });
    c.rect({ layer: 'card', x: 72, y: 214, w: 96, h: 6, fill: theme.accent, tone: 'accent', radius: 3 });
    c.text({ role: 'primary', x: 72, y: 246, w: 1136, h: 96, text: slide.title || slide.key, size: T.claim, bold: true, tight: true });
    if (slide.key && slide.title) c.text({ x: 72, y: 360, w: 1100, h: 44, text: slide.key, size: T.title, color: theme.ink, tight: true });
    const sub = (slide.blocks || []).find(b => b.kind === 'prose' || b.kind === 'points');
    if (sub) c.text({ x: 72, y: 428, w: 1000, h: 60, text: sub.text || pointsText(sub.items), size: T.body, color: theme.muted });
    if (slide.author || slide.credits) c.text({ layer: 'chrome', role: 'detail', x: 72, y: 640, w: 1000, h: 30, text: slide.author || slide.credits, size: T.meta, color: theme.muted });
    c.footer();
  },

  section(c) {
    const { slide, theme, T } = c;
    if (slide.topic) c.text({ layer: 'chrome', role: 'detail', x: 72, y: 200, w: 1000, h: 30, text: slide.topic, size: T.meta, color: theme.muted, bold: true, spacing: 2 });
    c.text({ role: 'primary', x: 72, y: 250, w: 1136, h: 90, text: slide.title || slide.key, size: T.claim, bold: true, tight: true });
    const sub = (slide.blocks || []).find(b => b.kind === 'prose' || b.kind === 'points');
    if (sub) c.text({ x: 72, y: 360, w: 1000, h: 80, text: sub.text || pointsText(sub.items), size: T.body, color: theme.muted });
    c.rect({ layer: 'card', x: 72, y: 470, w: 72, h: 4, fill: theme.accent, tone: 'accent' });
    c.footer();
  },

  statement(c) {
    const { slide, theme, T } = c;
    c.kicker();
    if (slide.title) c.text({ layer: 'chrome', role: 'title', x: 72, y: 120, w: 1136, h: 40, text: slide.title, size: T.title, bold: true, align: 'center', tight: true });
    const pull = (slide.blocks || []).find(b => b.kind === 'pull' || b.kind === 'quote');
    const main = (pull && (pull.text || pull.quote)) || slide.key;
    c.text({ role: 'primary', x: 96, y: 240, w: 1088, h: 140, text: main, size: T.claim, bold: true, align: 'center', tight: true });
    if (pull && pull.attribution) c.text({ role: 'detail', x: 96, y: 400, w: 1088, h: 30, text: pull.attribution, size: T.meta, color: theme.muted, align: 'center' });
    const rest = (slide.blocks || []).filter(b => b.kind === 'points' || b.kind === 'prose');
    if (rest.length) c.text({ x: 160, y: 460, w: 960, h: 120, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: T.body, color: theme.muted, align: 'center' });
    c.footer();
  },

  points(c) {
    standard(c, true);
    const { slide, T, theme } = c;
    const top = c.bodyTop();
    const blocks = (slide.blocks || []).filter(b => ['points', 'prose', 'steps'].includes(b.kind));
    const texts = blocks.map(b => ({ text: b.text || pointsText(b.items), bullet: b.kind !== 'prose' }));
    if (!texts.length && slide.key) return;
    let y = top;
    texts.forEach((t) => {
      const est = L.estimateText(t.text, T.body, 1136, { spaceAfter: 10 });
      const h = Math.max(80, est.height + 12);
      c.text({
        x: 72, y, w: 1136, h,
        text: t.text, size: T.body, color: theme.ink, list: t.bullet ? 'bullet' : undefined,
        spaceAfter: 10,
      });
      y += h + 24;
    });
    if (y - 24 > 636) throw new Error('points stack exceeds slide body');
  },

  'kpi-hero'(c) {
    const { slide, theme, T } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'kpi');
    if (!block) { standard(c, true); return; }
    c.kicker();
    if (slide.title) c.text({ layer: 'chrome', role: 'title', x: 56, y: 70, w: 1168, h: 46, text: slide.title, size: T.title, bold: true, tight: true });
    if (slide.key) c.text({ role: 'support', x: 56, y: 122, w: 1168, h: 42, text: slide.key, size: T.title, bold: true, tight: true });
    const items = block.items.slice(0, 4);
    const n = items.length;
    const gap = 24;
    const w = (1168 - gap * (n - 1)) / n;
    const top = slide.key ? 196 : slide.title ? 150 : 100;
    const cardH = Math.min(300, 656 - top);
    const em = slide.emphasis || {};
    const mainIndex = em.role === 'kpi' ? (em.index || 0) : 0;
    items.forEach((it, i) => {
      const main = i === mainIndex;
      const accent = em.tone === 'accent' && main;
      const x = 56 + i * (w + gap);
      c.rect({ layer: 'card', x, y: top, w, h: cardH, fill: accent ? theme.accent : theme.panel, tone: accent ? 'accent' : undefined, radius: theme.radius || 16 });
      c.text({
        role: main ? 'primary' : 'support', x: x + 24, y: top + 40, w: w - 48, h: 110,
        text: String(it.value) + (it.unit ? ' ' + it.unit : ''), size: main ? 84 : 72, bold: true,
        color: accent ? theme.accentInk : theme.ink, tight: true,
      });
      c.text({ x: x + 24, y: top + 170, w: w - 48, h: Math.max(60, cardH - 190), text: it.label, size: T.body, color: accent ? theme.accentInk : theme.muted });
    });
    const rest = (slide.blocks || []).filter(b => b.kind === 'points' || b.kind === 'prose');
    if (rest.length) c.text({ x: 56, y: top + cardH + 24, w: 1168, h: 100, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: T.body, color: theme.ink });
    c.footer();
  },

  'table-showdown'(c) {
    standard(c, true);
    const { slide } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'table');
    if (!block) return;
    const top = c.bodyTop();
    c.add({
      kind: 'table', x: 72, y: top, w: 1136, h: Math.min(c.bodyHeight(), 400),
      cols: block.cols, rows: block.rows, colWidths: block.colWidths,
    });
    const rest = (slide.blocks || []).filter(b => b.kind === 'points' || b.kind === 'prose');
    if (rest.length) c.text({ x: 72, y: top + 420, w: 1136, h: 80, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: c.T.body, color: c.theme.ink });
  },

  chart(c) {
    standard(c, true);
    const { slide, theme } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'chart');
    if (!block) return;
    c.add({
      kind: 'chart', x: 72, y: c.bodyTop(), w: 1136, h: Math.min(c.bodyHeight(), 420),
      chartType: block.chartType || 'column', categories: block.categories, series: block.series,
      xTitle: block.xTitle, yTitle: block.yTitle, colors: block.colors,
    });
    const rest = (slide.blocks || []).filter(b => b.kind === 'points' || b.kind === 'prose');
    if (rest.length) c.text({ x: 72, y: c.bodyTop() + 440, w: 1136, h: 80, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: c.T.body, color: theme.ink });
  },

  'split-compare'(c) {
    standard(c, true);
    const { slide, theme, T } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'compare');
    if (!block) return;
    const top = c.bodyTop();
    const w = 560, gap = 48;
    [['left', 56], ['right', 56 + w + gap]].forEach(([side, x]) => {
      const data = block[side] || {};
      const warn = side === 'right' && (slide.emphasis || {}).tone === 'warn';
      c.rect({ layer: 'card', x, y: top, w, h: 400, fill: theme.panel, radius: theme.radius || 16 });
      if (warn) c.rect({ layer: 'card', tone: 'warn', x, y: top, w: 6, h: 400, fill: theme.warn });
      c.text({ x: x + 28, y: top + 24, w: w - 56, h: 40, text: data.title || (side === 'left' ? 'A' : 'B'), size: T.title, bold: true, color: warn ? theme.warn : theme.ink, tight: true });
      c.text({ x: x + 28, y: top + 88, w: w - 56, h: 280, text: pointsText(data.items) || data.text || '', size: T.body, color: theme.ink, list: 'bullet', spaceAfter: 10, valign: 'middle' });
    });
  },

  diagram(c) {
    standard(c, true);
    const { slide, theme, T } = c;
    const block = (slide.blocks || []).find(b => ['diagram', 'steps', 'timeline'].includes(b.kind));
    if (!block) return;
    const pattern = block.pattern || (block.kind === 'timeline' ? 'timeline' : 'steps');
    const nodes = block.nodes || [];
    const top = c.bodyTop() + 40;
    if (pattern === 'steps') {
      const n = Math.min(nodes.length, 5);
      const gap = 24, w = (1168 - gap * (n - 1)) / n;
      nodes.slice(0, n).forEach((node, i) => {
        const x = 56 + i * (w + gap);
        const label = typeof node === 'string' ? node : node.text;
        c.rect({ layer: 'card', x, y: top, w, h: 220, fill: theme.panel, radius: theme.radius || 16 });
        c.text({ x: x + 20, y: top + 20, w: w - 40, h: 40, text: String(i + 1).padStart(2, '0'), size: T.title, bold: true, color: theme.accent });
        c.text({ x: x + 20, y: top + 80, w: w - 40, h: 120, text: label, size: T.body, color: theme.ink });
        if (i < n - 1) c.add({ kind: 'connector', layer: 'chrome', x: x + w + 4, y: top + 104, w: gap - 8, h: 8, to: 'right' });
      });
    } else if (pattern === 'timeline') {
      const n = Math.min(nodes.length, 6);
      const step = 1168 / n;
      c.rect({ layer: 'card', x: 56, y: top + 110, w: 1168, h: 3, fill: theme.rule });
      nodes.slice(0, n).forEach((node, i) => {
        const x = 56 + i * step + step / 2;
        c.rect({ layer: 'card', x: x - 8, y: top + 103, w: 16, h: 16, fill: theme.accent, tone: i === 0 ? 'accent' : undefined, radius: 8 });
        c.text({ x: x - step / 2 + 8, y: top + 40, w: step - 16, h: 40, text: node.year || node.label || '', size: T.title, bold: true, align: 'center', tight: true });
        c.text({ x: x - step / 2 + 8, y: top + 150, w: step - 16, h: 140, text: node.text || '', size: T.body, color: theme.ink, align: 'center' });
      });
    } else if (pattern === 'quadrant') {
      const w = 560, h = 200, gap = 48;
      nodes.slice(0, 4).forEach((node, i) => {
        const x = 56 + (i % 2) * (w + gap);
        const y = top + Math.floor(i / 2) * (h + 24);
        c.rect({ layer: 'card', x, y, w, h, fill: theme.panel, radius: theme.radius || 16 });
        c.text({ x: x + 24, y: y + 20, w: w - 48, h: 36, text: node.title || '', size: T.title, bold: true, tight: true });
        c.text({ x: x + 24, y: y + 72, w: w - 48, h: h - 92, text: node.text || '', size: T.body, color: theme.ink });
      });
    } else if (pattern === 'hub') {
      const cx = 640, cy = top + 160;
      c.rect({ layer: 'card', x: cx - 140, y: cy - 60, w: 280, h: 120, fill: theme.accent, tone: 'accent', radius: theme.radius || 16 });
      c.text({ role: 'support', x: cx - 120, y: cy - 30, w: 240, h: 60, text: block.center || slide.key || '', size: T.title, bold: true, color: theme.accentInk, align: 'center', tight: true });
      const n = Math.min(nodes.length, 4);
      nodes.slice(0, n).forEach((node, i) => {
        const x = i % 2 === 0 ? 96 : 944;
        const y = top + Math.floor(i / 2) * 220;
        c.rect({ layer: 'card', x, y, w: 240, h: 140, fill: theme.panel, radius: theme.radius || 16 });
        c.text({ x: x + 20, y: y + 20, w: 200, h: 100, text: typeof node === 'string' ? node : node.text, size: T.body, color: theme.ink, align: 'center' });
      });
    }
  },

  image(c) {
    standard(c, true);
    const { slide, theme, T } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'image' || b.kind === 'media');
    if (!block) return;
    const top = c.bodyTop();
    if (block.bleed) {
      c.add({ kind: block.kind === 'media' ? 'media' : 'picture', layer: 'ground', bleed: true, x: 0, y: 0, w: 1280, h: 720, src: block.src, fit: 'cover', alt: block.alt || slide.title, mediaType: block.mediaType, poster: block.poster });
      c.rect({ layer: 'ground', bleed: true, x: 0, y: 0, w: 1280, h: 720, fill: '#000000', opacity: block.scrim == null ? 0.55 : block.scrim });
      c.elements.forEach(el => { if (el.kind === 'text') el.color = '#FFFFFF'; });
      return;
    }
    const hasText = (slide.blocks || []).some(b => ['points', 'prose'].includes(b.kind));
    const w = hasText ? 640 : 1136;
    const x = hasText ? 584 : 72;
    c.add({ kind: block.kind === 'media' ? 'media' : 'picture', x, y: top, w, h: 400, src: block.src, fit: block.fit || 'cover', alt: block.alt || slide.title, mediaType: block.mediaType, poster: block.poster });
    if (block.caption) c.text({ role: 'detail', x, y: top + 412, w, h: 28, text: block.caption, size: T.meta, color: theme.muted });
    if (hasText) {
      const rest = (slide.blocks || []).filter(b => ['points', 'prose'].includes(b.kind));
      c.text({ x: 72, y: top, w: 480, h: 400, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: T.body, color: theme.ink, list: 'bullet', spaceAfter: 10 });
    }
  },

  code(c) {
    standard(c, true);
    const { slide, theme, T } = c;
    const block = (slide.blocks || []).find(b => b.kind === 'code');
    if (!block) return;
    const top = c.bodyTop();
    c.rect({ layer: 'card', x: 72, y: top, w: 1136, h: 400, fill: '#1F2328', radius: theme.radius || 12 });
    c.text({ x: 100, y: top + 24, w: 1080, h: 352, text: block.text || (block.lines || []).join('\n'), size: 22, color: '#F2F4F7', mono: true, spaceAfter: 4 });
    const rest = (slide.blocks || []).filter(b => ['points', 'prose', 'steps'].includes(b.kind));
    if (rest.length) c.text({ x: 72, y: top + 420, w: 1136, h: 90, text: rest.map(b => b.text || pointsText(b.items)).join('\n'), size: T.body, color: theme.ink });
  },

  closing(c) {
    const { slide, theme, T } = c;
    c.kicker();
    if (slide.title && slide.key) c.text({ layer: 'chrome', role: 'title', x: 72, y: 116, w: 1136, h: 44, text: slide.title, size: T.title, bold: true, tight: true });
    c.text({ role: 'primary', x: 72, y: slide.title && slide.key ? 176 : 160, w: 1136, h: 80, text: slide.key || slide.title, size: T.claim, bold: true, tight: true });
    const blocks = (slide.blocks || []).filter(b => ['points', 'prose'].includes(b.kind));
    if (blocks.length) c.text({ x: 72, y: 280, w: 1136, h: 320, text: blocks.map(b => b.text || pointsText(b.items)).join('\n'), size: T.body, color: theme.ink, spaceAfter: 10 });
    c.footer();
  },

  custom(c) {
    const { slide, theme, T } = c;
    (slide.blocks || []).forEach(b => {
      const r = b.rect;
      if (!r) return;
      const [x, y, w, h] = r;
      if (b.kind === 'image' || b.kind === 'media') c.add({ kind: b.kind === 'media' ? 'media' : 'picture', x, y, w, h, src: b.src, fit: b.fit || 'cover', alt: b.alt, mediaType: b.mediaType, poster: b.poster });
      else if (b.kind === 'rect') c.rect({ x, y, w, h, fill: b.fill || theme.panel, radius: b.radius });
      else c.text({ x, y, w, h, text: b.text || pointsText(b.items), size: b.size || T.body, color: b.color || theme.ink, bold: b.bold, align: b.align, role: b.primary ? 'primary' : 'support' });
    });
    c.footer();
  },
};

RECIPE_TYPES_ALIAS();

function RECIPE_TYPES_ALIAS() {
  RECIPES.references = RECIPES.closing;
  RECIPES['kpi-row'] = RECIPES['kpi-hero'];
  RECIPES.table = RECIPES['table-showdown'];
  RECIPES.compare = RECIPES['split-compare'];
}

const TYPE_MAP = {
  cover: 'cover', team: 'cover',
  toc: 'section', agenda: 'section', 'act-divider': 'section', section: 'section',
  concept: 'statement', verdict: 'statement', problem: 'statement', solution: 'statement',
  statement: 'statement',
  points: 'points', definition: 'points', recap: 'points', caveat: 'points', 'next-steps': 'points',
  'kpi-hero': 'kpi-hero', 'data-cards': 'kpi-hero', 'data-contrast': 'kpi-hero', traction: 'kpi-hero',
  'table-showdown': 'table-showdown', cast: 'table-showdown', action: 'table-showdown', table: 'table-showdown',
  'chart-line': 'chart', 'chart-bars': 'chart', 'chart-stack': 'chart', results: 'chart', experiment: 'chart',
  breakdown: 'chart', 'rank-list': 'chart', chart: 'chart',
  'split-compare': 'split-compare', 'before-after': 'split-compare', 'counter-argument': 'split-compare',
  competition: 'split-compare', compare: 'split-compare',
  steps: 'diagram', timeline: 'diagram', 'arch-diagram': 'diagram', 'root-cause': 'diagram',
  framework: 'diagram', 'lifecycle-strip': 'diagram', 'diagram-explain': 'diagram',
  'policy-timeline': 'diagram', diagram: 'diagram',
  image: 'image',
  'code-walkthrough': 'code', 'terminal-log': 'code', demo: 'code', code: 'code',
  closing: 'closing', references: 'closing', thanks: 'closing', 'the-ask': 'closing',
  custom: 'custom',
};

function recipeFor(slide) {
  if (TYPE_MAP[slide.type]) return TYPE_MAP[slide.type];
  if (RECIPES[slide.type]) return slide.type;
  const kinds = (slide.blocks || []).map(b => b.kind);
  if (kinds.includes('kpi')) return 'kpi-hero';
  if (kinds.includes('table')) return 'table-showdown';
  if (kinds.includes('chart')) return 'chart';
  if (kinds.includes('compare')) return 'split-compare';
  if (kinds.some(k => ['diagram', 'steps', 'timeline'].includes(k))) return 'diagram';
  if (kinds.includes('image') || kinds.includes('media')) return 'image';
  if (kinds.includes('code')) return 'code';
  return 'points';
}

const SUPPORTED_BLOCKS = {
  cover: ['prose', 'points'],
  section: ['prose', 'points'],
  statement: ['pull', 'quote', 'points', 'prose'],
  points: ['points', 'prose', 'steps'],
  'kpi-hero': ['kpi', 'points', 'prose'],
  'table-showdown': ['table', 'points', 'prose'],
  chart: ['chart', 'points', 'prose'],
  'split-compare': ['compare', 'points', 'prose'],
  diagram: ['diagram', 'steps', 'timeline'],
  image: ['image', 'media', 'points', 'prose'],
  code: ['code', 'points', 'prose', 'steps'],
  closing: ['points', 'prose'],
  custom: L.BLOCK_KINDS,
};

function buildSlide(slide, theme, slideIdx, evidenceChain = 'off') {
  const recipeName = recipeFor(slide);
  const recipe = RECIPES[recipeName];
  if (!recipe) throw new Error('no recipe for type ' + slide.type);
  const allowed = SUPPORTED_BLOCKS[recipeName] || [];
  for (const b of slide.blocks || []) {
    if (!allowed.includes(b.kind)) throw new Error(`type ${slide.type} (${recipeName}) does not support block ${b.kind}`);
  }
  const c = ctx(slide, theme, slideIdx, evidenceChain);
  recipe(c);
  if (!c.elements.some(e => e.role === 'primary')) {
    const t = c.elements.find(e => e.kind === 'text' && e.text);
    if (t) t.role = 'primary';
  }
  return c.elements;
}

module.exports = { buildSlide, recipeFor, RECIPES, SUPPORTED_BLOCKS };
