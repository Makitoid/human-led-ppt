#!/usr/bin/env node
'use strict';
const fs = require('fs');

const CANVAS = { w: 1280, h: 720 };
const SAFE = { x: 56, y: 40, w: 1168, h: 640 };
const SLIDE_PT = { w: 960, h: 540 };
const PX_PER_PT = 0.75;
const BLOCK_KINDS = ['points', 'prose', 'kpi', 'table', 'chart', 'compare', 'steps', 'timeline', 'diagram', 'image', 'media', 'pull', 'quote', 'code'];
const DATA_KINDS = ['kpi', 'table', 'chart', 'compare', 'quote'];
const RECIPE_TYPES = ['cover', 'section', 'statement', 'points', 'kpi-hero', 'table-showdown', 'chart', 'split-compare', 'diagram', 'image', 'code', 'closing', 'references', 'custom'];

// Whitelists copied verbatim from officecli 1.0.160: the transition list is the validValues array its
// invalid_value error returns, the effect lists are its unknown-animation-effect error text.
const TRANSITION_TYPES = ['none', 'fade', 'cut', 'dissolve', 'circle', 'diamond', 'newsflash', 'plus', 'random', 'wedge', 'wipe', 'push', 'cover', 'pull', 'wheel', 'zoom', 'split', 'blinds', 'checker', 'comb', 'bars', 'strips', 'flash', 'honeycomb', 'vortex', 'switch', 'flip', 'ripple', 'glitter', 'prism', 'cube', 'rotate', 'orbit', 'clock', 'doors', 'window', 'shred', 'ferris', 'flythrough', 'warp', 'gallery', 'conveyor', 'pan', 'reveal', 'morph', 'box', 'fallOver', 'drape', 'curtains', 'wind', 'prestige', 'fracture', 'crush', 'peelOff', 'pageCurlDouble', 'pageCurlSingle', 'airplane', 'origami'];
// `venetian` is accepted but round-trips as `blinds`; the other four are help-only names the engine rejects.
const TRANSITION_ALIASES = { venetian: 'blinds', checkerboard: 'checker', randombar: 'bars', diagonal: 'strips' };
const TRANSITION_SPEEDS = ['fast', 'med', 'slow'];
const TRANSITION_DIRS = ['in', 'out', 'left', 'right', 'up', 'down', 'clockwise', 'counter-clockwise', 'inverted', 'horizontal', 'vertical', 'downleft', 'upright', 'upleft', 'bottomleft', 'topright', 'center', 'random'];
const DEFAULT_TRANSITION = 'fade-400';
const MOTION_KEYS = ['transition', 'discipline', 'why'];
const ANIM_KEYS = ['on', 'effect', 'class', 'trigger', 'duration', 'delay', 'direction', 'path', 'd', 'repeat', 'why'];
const ANIM_CLASSES = ['entrance', 'exit', 'emphasis', 'motion'];
const EFFECTS_ENTRANCE = ['appear', 'fade', 'fly', 'zoom', 'wipe', 'bounce', 'float', 'split', 'wheel', 'swivel', 'checkerboard', 'blinds', 'dissolve', 'flash', 'box', 'circle', 'diamond', 'plus', 'strips', 'wedge', 'random'];
// Verbatim PowerPoint OOXML templates: exit only, and they ignore `duration`.
const EFFECTS_TEMPLATE_EXIT = ['contract', 'centerRevolve', 'collapse', 'floatOut', 'shrinkTurn', 'sinkDown', 'spinner', 'basicZoom', 'stretchy', 'boomerang', 'credits', 'curveDown', 'pinwheel', 'spiralOut', 'basicSwivel'];
const EFFECTS_EMPHASIS = ['spin', 'grow', 'growShrink', 'shrink', 'bold', 'wave', 'fade', 'fillColor', 'lineColor', 'transparency', 'complementaryColor', 'complementaryColor2', 'contrastingColor', 'darken', 'desaturate', 'lighten', 'objectColor', 'pulse', 'colorPulse', 'teeter'];
const ANIM_TRIGGERS = ['onClick', 'withPrevious', 'afterPrevious'];
const MOTION_PATHS = ['line', 'arc', 'circle', 'diamond', 'triangle', 'square', 'custom'];
const ANIM_DIRECTIONS = ['in', 'out', 'left', 'right', 'up', 'down'];
const ANIM_ON = ['primary', 'title', 'content', 'cards', 'all'];
// officecli 1.0.160 attaches animations only to top-level shape/chart nodes; pictures, tables and
// media are rejected with "Animations must be added to a top-level shape or chart".
const ANIMATABLE_KINDS = ['text', 'rect', 'connector', 'chart'];
const ANIM_MAX_PER_SLIDE = 6;
const ANIM_SEGMENT = { text: 'shape', rect: 'shape', connector: 'shape', chart: 'chart' };

// ppt-master's motion doctrine, enforced on top of the engine whitelist: a page turn is chosen
// from the relationship to the preceding page, never for variety; in-page motion is off unless it
// carries a communication task. The default is fade-400 + no animation.
const MOTION_DISCIPLINES = ['calm', 'story'];
const MOTION_TIER = {
  none: 'base', fade: 'base', cut: 'base',
  push: 'directional', wipe: 'directional', cover: 'directional', pull: 'directional',
  split: 'directional', reveal: 'directional',
  morph: 'identity',
};
const MOTION_CALM_ANIM = ['entrance', 'emphasis'];

function transitionTier(type) { return MOTION_TIER[type] || 'expressive'; }
function nonEmpty(v) { return typeof v === 'string' && v.trim().length > 0; }

function pt(px) { return (Math.round(px * PX_PER_PT * 100) / 100) + 'pt'; }
function ptNum(px) { return Math.round(px * PX_PER_PT * 100) / 100; }
function round(n, d = 2) { const f = Math.pow(10, d); return Math.round(n * f) / f; }

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('bad hex color: ' + hex);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum(rgb) {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [lum(hexToRgb(a)), lum(hexToRgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function charEm(ch) {
  const c = ch.codePointAt(0);
  if ((c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf) || (c >= 0xac00 && c <= 0xd7a3)
    || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xfe30 && c <= 0xfe4f) || (c >= 0xff00 && c <= 0xff60)
    || (c >= 0xffe0 && c <= 0xffe6) || (c >= 0x3000 && c <= 0x303f)) return 1.0;
  if (ch >= '0' && ch <= '9') return 0.56;
  if (ch >= 'A' && ch <= 'Z') return 0.62;
  if (ch === '—' || ch === '–') return 0.8;
  if (ch === ' ') return 0.30;
  return 0.55;
}
function tokenize(text) {
  const tokens = [];
  let buf = '';
  let latin = false;
  for (const ch of text) {
    const isLatin = /[A-Za-z0-9]/.test(ch);
    if (isLatin) { buf += ch; latin = true; continue; }
    if (buf) { tokens.push(buf); buf = ''; }
    latin = false;
    tokens.push(ch);
  }
  if (buf) tokens.push(buf);
  return tokens;
}
function wrapLines(text, fontSizePx, widthPx) {
  const tokens = tokenize(text);
  const lines = [];
  let line = '';
  let w = 0;
  for (const tok of tokens) {
    let tw = 0;
    for (const ch of tok) tw += charEm(ch) * fontSizePx;
    if (w + tw > widthPx && line) { lines.push(line); line = ''; w = 0; }
    if (tw > widthPx) {
      for (const ch of tok) {
        const cw = charEm(ch) * fontSizePx;
        if (w + cw > widthPx && line) { lines.push(line); line = ''; w = 0; }
        line += ch; w += cw;
      }
    } else { line += tok; w += tw; }
  }
  if (line) lines.push(line);
  return lines.length || 1;
}
function estimateText(text, fontSizePx, widthPx, opts = {}) {
  const lineHeight = fontSizePx * (opts.tight ? 1.15 : 1.30);
  const paras = String(text || '').split('\n');
  let lines = 0;
  for (const p of paras) lines += wrapLines(p, fontSizePx, widthPx);
  return { lines, height: lines * lineHeight + (paras.length - 1) * (opts.spaceAfter || 0), lineHeight };
}
function textCapacity(el) {
  const size = el.size || 24;
  const margin = el.margin == null ? 0 : el.margin;
  const w = el.w - margin * 2 - (el.list ? 24 : 0);
  const h = el.h - margin * 2;
  const est = estimateText(el.text, size, w, { tight: el.tight, spaceAfter: el.spaceAfter || 0 });
  return { ok: est.height <= h * 0.98 + 0.01, need: est.height, hold: h, lines: est.lines, lineHeight: est.lineHeight };
}
function versionAtLeast(v, min) {
  const a = String(v).split('.').map(Number);
  const b = String(min).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return true;
}

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  if (b.length > 10 && b.toString('ascii', 0, 6).startsWith('GIF')) {
    return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  }
  throw new Error('unsupported image (need PNG/JPEG/GIF): ' + file);
}
function coverCrop(sw, sh, bw, bh) {
  const as = sw / sh, ab = bw / bh;
  if (Math.abs(as - ab) < 0.001) return '0,0,0,0';
  if (as > ab) {
    const c = round((1 - ab / as) / 2 * 100, 3);
    return `${c},0,${c},0`;
  }
  const c = round((1 - as / ab) / 2 * 100, 3);
  return `0,${c},0,${c}`;
}
function containFit(sw, sh, bw, bh) {
  const s = Math.min(bw / sw, bh / sh);
  const w = sw * s, h = sh * s;
  return { x: (bw - w) / 2, y: (bh - h) / 2, w, h };
}

function stripTags(s) {
  return String(s || '').replace(/<\/?(strong|em|code|b|i)>/g, '').replace(/<[^>]+>/g, '');
}
function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function tableData(cols, rows) {
  return [cols, ...rows].map(r => r.map(csvCell).join(',')).join(';');
}
function idFor(slideIdx, slot) { return 10000 + slideIdx * 100 + slot; }

// officecli's transition shorthand is the only way to reach duration/speed: TYPE[-MOD...][-SPEED|MS].
function parseMotionToken(token, at) {
  const errors = [];
  const parts = String(token).split('-');
  const type = parts[0];
  const out = { type: TRANSITION_ALIASES[type] || type, rawType: type, speed: null, ms: null, modifiers: [] };
  if (!TRANSITION_TYPES.includes(type) && !TRANSITION_ALIASES[type]) {
    errors.push(`${at}: unknown transition "${type}" (officecli rejects it and rolls the whole batch back)`);
    return { errors, out };
  }
  for (const p of parts.slice(1)) {
    if (/^\d+$/.test(p) && Number(p) >= 100) {
      if (out.ms != null) errors.push(`${at}: transition "${token}" has more than one duration`);
      out.ms = parseInt(p, 10);
      if (out.ms > 10000) errors.push(`${at}: transition duration ${out.ms}ms above 10000`);
    } else if (TRANSITION_SPEEDS.includes(p)) {
      if (out.speed) errors.push(`${at}: transition "${token}" has more than one speed`);
      out.speed = p;
    } else if (TRANSITION_DIRS.includes(p) || /^\d+$/.test(p)) {
      // bare digits after the type are variant/subtype slots (venetian-4, split-vertical-in); the
      // engine owns that matrix and rejects a wrong one, so pass them through.
      out.modifiers.push(p);
    } else {
      errors.push(`${at}: unknown transition modifier "${p}" in "${token}" (type-specific; officecli rejects it)`);
    }
  }
  if (out.speed != null && out.ms != null) errors.push(`${at}: transition "${token}" sets both speed and duration — pick one`);
  return { errors, out };
}

function validateMotion(motion, at) {
  const errors = [];
  if (motion == null) return errors;
  if (typeof motion !== 'object') return [`${at} must be an object`];
  for (const k of Object.keys(motion)) {
    if (MOTION_KEYS.includes(k)) continue;
    if (k === 'duration') errors.push(`${at}.duration is gone — pack it into the token, e.g. "transition": "fade-${motion.duration}"`);
    else errors.push(`${at}.${k} is not a motion key (only ${MOTION_KEYS.join(', ')})`);
  }
  if (motion.discipline != null && !MOTION_DISCIPLINES.includes(motion.discipline)) {
    errors.push(`${at}.discipline must be one of ${MOTION_DISCIPLINES.join(', ')}`);
  }
  if (motion.why != null && !nonEmpty(motion.why)) errors.push(`${at}.why must be one sentence naming the relationship the transition serves`);
  if (motion.transition != null) errors.push(...parseMotionToken(motion.transition, `${at}.transition`).errors);
  return errors;
}

function validateAnimation(anim, at) {
  const errors = [];
  if (anim == null) return errors;
  if (typeof anim !== 'object') return [`${at} must be an object`];
  for (const k of Object.keys(anim)) {
    if (!ANIM_KEYS.includes(k)) errors.push(`${at}.${k} is not an animation key (${ANIM_KEYS.join(', ')})`);
  }
  const cls = anim.class;
  if (!ANIM_ON.includes(anim.on)) errors.push(`${at}.on must be one of ${ANIM_ON.join(', ')}`);
  if (!ANIM_CLASSES.includes(cls)) errors.push(`${at}.class must be one of ${ANIM_CLASSES.join(', ')}`);
  const effect = String(anim.effect || '');
  if (cls === 'motion') {
    if (effect && effect !== 'motion') errors.push(`${at}: class=motion takes a path, not an effect ("${effect}")`);
    if (!MOTION_PATHS.includes(anim.path)) errors.push(`${at}.path must be one of ${MOTION_PATHS.join(', ')} when class=motion`);
    if (anim.path === 'custom' && !/^M[\s\S]*E?$/.test(String(anim.d || '').trim())) errors.push(`${at}.d must be SVG-like path data starting with M when path=custom`);
    if (anim.path !== 'custom' && anim.d) errors.push(`${at}.d is only valid with path=custom`);
  } else if (!effect) {
    errors.push(`${at}.effect required`);
  } else if (cls === 'emphasis') {
    if (!EFFECTS_EMPHASIS.includes(effect)) errors.push(`${at}: "${effect}" is not an emphasis effect (supported: ${EFFECTS_EMPHASIS.join(', ')})`);
  } else if (cls === 'entrance' || cls === 'exit') {
    const template = EFFECTS_TEMPLATE_EXIT.includes(effect);
    if (template && cls === 'entrance') errors.push(`${at}: "${effect}" is a template exit effect — it needs class=exit`);
    else if (!EFFECTS_ENTRANCE.includes(effect) && !template) errors.push(`${at}: "${effect}" is not available for class=${cls}`);
  }
  if (anim.trigger != null && !ANIM_TRIGGERS.includes(anim.trigger)) errors.push(`${at}.trigger must be one of ${ANIM_TRIGGERS.join(', ')}`);
  if (anim.direction != null && !ANIM_DIRECTIONS.includes(anim.direction)) errors.push(`${at}.direction must be one of ${ANIM_DIRECTIONS.join(', ')}`);
  if (EFFECTS_TEMPLATE_EXIT.includes(effect) && anim.duration != null) errors.push(`${at}: template exit effect "${effect}" keeps PowerPoint's own timing — drop duration`);
  for (const key of ['duration', 'delay']) {
    if (anim[key] != null && (!Number.isInteger(anim[key]) || anim[key] < 0 || anim[key] > 60000)) errors.push(`${at}.${key} must be an integer 0..60000 ms`);
  }
  if (anim.repeat != null && !/^(indefinite|[1-9]\d*)$/.test(String(anim.repeat))) errors.push(`${at}.repeat must be a positive integer or "indefinite"`);
  if (cls !== 'motion' && anim.path) errors.push(`${at}.path is only valid with class=motion`);
  if (anim.why != null && !nonEmpty(anim.why)) errors.push(`${at}.why must be one sentence naming the communication task`);
  return errors;
}

// `on` picks which laid-out elements carry the effect. The pool drops the full-bleed ground layer
// (backdrop + scrim) and detail-role chrome (kicker, source footer), so a page's furniture never
// animates; titles are chrome but carry role=title, so they stay reachable through "title"/"all".
function animationTargets(slide, elements, anim) {
  const pool = elements.filter(el =>
    ANIMATABLE_KINDS.includes(el.kind) && el.layer !== 'ground' && el.role !== 'detail');
  if (anim.on === 'primary') return pool.filter(el => el.role === 'primary');
  if (anim.on === 'title') return pool.filter(el => el.role === 'title' || el.role === 'primary');
  if (anim.on === 'cards') return pool.filter(el => el.layer === 'card');
  if (anim.on === 'content') return pool.filter(el => el.layer === 'content');
  return pool;
}

// The design gate the engine cannot provide: officecli accepts 58 transitions, but a deck that
// uses them for variety reads as decoration. This mirrors ppt-master's doctrine — fade/cut by
// default, directional effects for real movement, morph for one object across pages, and the
// remaining "expressive" library rationed to a few deliberate payoff moments that say why.
function motionPolicyErrors(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return errors;
  const m = spec.motion || {};
  const discipline = m.discipline || 'calm';
  const slides = Array.isArray(spec.slides) ? spec.slides : [];
  const N = slides.length;
  const typeOf = s => {
    const t = s && s.transition != null ? s.transition : m.transition;
    return t ? parseMotionToken(t, '').out.type : 'fade';
  };

  const deckTier = m.transition ? transitionTier(parseMotionToken(m.transition, '').out.type) : 'base';
  if (deckTier !== 'base') {
    if (!nonEmpty(m.why)) errors.push(`motion.why required: name the relationship to the preceding page that "${m.transition}" serves (fade/cut/none need none)`);
    if (deckTier === 'expressive' && discipline !== 'story') {
      errors.push(`motion.transition "${m.transition}" is expressive — calm decks stay on base/directional effects; set motion.discipline="story" for a deliberate payoff`);
    }
  }

  const expressive = [];
  slides.forEach((s, i) => {
    if (!s || s.transition == null) return;
    const tier = transitionTier(typeOf(s));
    const at = `slide ${i + 1} (${s.id || 'no id'})`;
    if (tier === 'base') return;
    if (!nonEmpty(s.transition_why)) errors.push(`${at}.transition_why required: name the relationship between this page and the one before it`);
    if (tier === 'expressive') {
      expressive.push(i);
      if (discipline !== 'story') errors.push(`${at}.transition "${s.transition}" is expressive — calm decks keep base/directional effects`);
    }
  });
  if (expressive.length) {
    const cap = Math.max(2, Math.ceil(N * 0.2));
    if (discipline === 'story' && expressive.length > cap) {
      errors.push(`${expressive.length} expressive transitions on a ${N}-slide deck — at most ${cap}; expressive page turns are punctuation, not variety`);
    }
    for (let k = 1; k < expressive.length; k++) {
      if (expressive[k] === expressive[k - 1] + 1) errors.push(`slides ${expressive[k] + 1} and ${expressive[k] + 2} both use an expressive transition — never two in a row`);
    }
  }

  const animated = [];
  slides.forEach((s, i) => {
    if (!s || !s.animation) return;
    const a = s.animation;
    const at = `slide ${i + 1} (${s.id || 'no id'})`;
    animated.push(i);
    if (!MOTION_CALM_ANIM.includes(a.class) && discipline !== 'story') {
      errors.push(`${at}.animation class=${a.class} — calm decks only reveal (entrance) or re-focus (emphasis); enter/move/exit choreography needs motion.discipline="story"`);
    }
    if (a.class !== 'entrance' && !nonEmpty(a.why)) {
      errors.push(`${at}.animation.why required for class=${a.class}: one sentence on the task it performs (what attention is re-earned, what is removed, what the movement means)`);
    }
    if (a.repeat != null) {
      if (discipline !== 'story') errors.push(`${at}.animation.repeat — endless motion is decoration; it needs motion.discipline="story"`);
      if (!nonEmpty(a.why)) errors.push(`${at}.animation.repeat needs a why — say what repeating communicates`);
    }
    if (a.effect === 'random' && !nonEmpty(a.why)) errors.push(`${at}.animation.effect="random" needs a why — uncertainty has to be the point`);
    if (a.duration != null && a.duration > 800) {
      errors.push(`${at}.animation.duration ${a.duration}ms > 800ms — a reveal that outlasts the sentence explaining it is drag, not emphasis`);
    }
  });
  if (animated.length) {
    const cap = discipline === 'story' ? Math.max(2, Math.ceil(N / 2)) : Math.max(1, Math.ceil(N / 3));
    if (animated.length > cap) {
      errors.push(`${animated.length} animated slides on a ${N}-slide deck — at most ${cap} in ${discipline} mode; every page animating is the "AI deck" tell`);
    }
    if (discipline !== 'story') {
      for (let k = 1; k < animated.length; k++) {
        if (animated[k] === animated[k - 1] + 1) errors.push(`slides ${animated[k] + 1} and ${animated[k] + 2} both animate — leave a still page between reveals`);
      }
    }
  }
  return errors;
}

function motionWarnings(spec) {
  const warnings = [];
  const m = spec.motion || {};
  const defaultToken = m.transition || DEFAULT_TRANSITION;
  if (m.transition && parseMotionToken(m.transition, 'motion.transition').out.type === 'morph') {
    warnings.push('morph relies on shape names matching between pages; the builder ids shapes, so the morph may fall back to a plain page turn');
  }
  for (const s of spec.slides || []) {
    if (s.animation) {
      if (s.transition && parseMotionToken(s.transition, `${s.id}.transition`).out.type === 'morph') {
        warnings.push(`${s.id}: morph set at slide level — same shape-name caveat as above`);
      }
      if (s.type === 'cover' || s.type === 'references' || s.type === 'closing' || s.type === 'thanks') {
        warnings.push(`${s.id}: ${s.type} pages usually stay static — check the animation is earning its click`);
      }
    } else if (s.transition && s.transition === defaultToken) {
      warnings.push(`${s.id}: slide transition repeats the deck default — drop it so the spec says only what differs`);
    }
  }
  return warnings;
}

function themeErrors(theme) {
  const errors = [];
  const required = ['bg', 'panel', 'ink', 'muted', 'accent', 'accentInk', 'warn', 'rule'];
  for (const k of required) {
    try { hexToRgb(theme[k]); } catch { errors.push('theme.' + k + ' must be #RRGGBB'); }
  }
  if (errors.length) return errors;
  const pairs = [
    ['ink', 'bg', 4.5], ['muted', 'bg', 4.5], ['ink', 'panel', 4.5], ['muted', 'panel', 4.5],
    ['accentInk', 'accent', 4.5], ['warn', 'bg', 4.5], ['accent', 'bg', 4.5],
  ];
  for (const [a, b, min] of pairs) {
    const r = contrast(theme[a], theme[b]);
    if (r < min) errors.push(`contrast ${a} on ${b} = ${r.toFixed(2)} < ${min}`);
  }
  const s = theme.scale || {};
  const scale = [s.claim, s.title, s.body, s.meta];
  if (scale.some(v => typeof v !== 'number' || v <= 0)) errors.push('theme.scale must be positive numbers');
  else {
    if (s.claim / s.title < 1.4) errors.push('type scale claim/title < 1.4');
    if (s.title / s.body < 1.4) errors.push('type scale title/body < 1.4');
    if (s.body / s.meta < 1.4) errors.push('type scale body/meta < 1.4');
    if (s.body < 22) errors.push('body font < 22px');
    if (s.meta < 14) errors.push('meta font < 14px (PPTX floor 10.5pt)');
  }
  return errors;
}

function validateSpec(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') return ['spec is not an object'];
  if (!spec.meta || !spec.meta.title) errors.push('meta.title required');
  if (spec.meta && spec.meta.evidence_chain != null && !['on', 'off'].includes(spec.meta.evidence_chain)) {
    errors.push('meta.evidence_chain must be on or off (default off; on requires author approval)');
  }
  if (!spec.theme) errors.push('theme required');
  else errors.push(...themeErrors(spec.theme));
  if (!Array.isArray(spec.slides) || !spec.slides.length) errors.push('slides must be a non-empty array');
  if (spec.meta && spec.meta.slides && spec.slides && spec.meta.slides !== spec.slides.length) {
    errors.push(`meta.slides=${spec.meta.slides} but slides.length=${spec.slides.length}`);
  }
  errors.push(...validateMotion(spec.motion, 'motion'));
  const types = new Set();
  const custom = [];
  (spec.slides || []).forEach((s, i) => {
    const at = `slide ${i + 1} (${s.id || 'no id'})`;
    if (!s.id) errors.push(at + ': id required');
    if (!s.type) errors.push(at + ': type required');
    else if (typeof s.type !== 'string') errors.push(at + ': type must be a string');
    else types.add(s.type);
    if (s.type === 'custom') custom.push(at);
    if (s.transition != null) errors.push(...parseMotionToken(s.transition, `${at}.transition`).errors);
    if (s.animation != null) errors.push(...validateAnimation(s.animation, `${at}.animation`));
    (s.blocks || []).forEach((b, j) => {
      if (!BLOCK_KINDS.includes(b.kind)) errors.push(`${at}/block${j + 1}: unsupported kind ${b.kind}`);
      if (DATA_KINDS.includes(b.kind) && !s.source) errors.push(`${at}: ${b.kind} requires slide.source`);
      if (b.kind === 'kpi' && (!Array.isArray(b.items) || !b.items.length || b.items.length > 4)) errors.push(`${at}: kpi needs 1-4 items`);
      if (b.kind === 'table') {
        if (!Array.isArray(b.cols) || !b.cols.length) errors.push(`${at}: table.cols required`);
        if (!Array.isArray(b.rows) || !b.rows.length) errors.push(`${at}: table.rows required`);
        if (b.rows && b.rows.length > 6) errors.push(`${at}: table rows > 6`);
        if (b.cols && b.cols.length > 5) errors.push(`${at}: table cols > 5`);
        (b.rows || []).forEach((r, k) => { if (r.length !== b.cols.length) errors.push(`${at}: table row ${k + 1} width mismatch`); });
      }
      if (b.kind === 'chart') {
        if (!Array.isArray(b.categories) || b.categories.length < 2 || b.categories.length > 12) errors.push(`${at}: chart needs 2-12 categories`);
        if (!Array.isArray(b.series) || !b.series.length || b.series.length > 3) errors.push(`${at}: chart needs 1-3 series`);
        (b.series || []).forEach((sr, k) => {
          if (!Array.isArray(sr.values) || sr.values.length !== b.categories.length) errors.push(`${at}: chart series ${k + 1} values length mismatch`);
          if (String(sr.name).includes(',') || String(sr.name).includes(';')) errors.push(`${at}: chart series name cannot contain , or ;`);
        });
        (b.categories || []).forEach(c => { if (String(c).includes(',') || String(c).includes(';')) errors.push(`${at}: chart category cannot contain , or ;`); });
      }
      if (b.kind === 'image') {
        if (!b.src) errors.push(`${at}: image.src required`);
        else if (/^https?:/i.test(b.src)) errors.push(`${at}: image.src must be local`);
      }
      if (b.kind === 'media') {
        if (!b.src || /^https?:/i.test(b.src)) errors.push(`${at}: media.src must be local`);
        if (b.mediaType === 'video' && !b.poster) errors.push(`${at}: video requires poster`);
      }
    });
  });
  if (custom.length > 2) errors.push('custom slides > 2: ' + custom.join(', '));
  if (types.size > 8) errors.push('page types > 8: ' + [...types].join(', '));
  errors.push(...motionPolicyErrors(spec));
  return errors;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function elementErrors(elements, slideId) {
  const errors = [];
  const ids = new Set();
  let primary = 0, accent = 0, warn = 0;
  const byLayer = {};
  for (const el of elements) {
    if (ids.has(el.id)) errors.push(`${slideId}: duplicate id ${el.id}`);
    ids.add(el.id);
    if (el.role === 'primary') primary++;
    if (el.tone === 'accent' && el.fill) accent++;
    if (el.tone === 'warn') warn++;
    if (!el.bleed) {
      if (el.x < SAFE.x || el.y < SAFE.y || el.x + el.w > SAFE.x + SAFE.w || el.y + el.h > CANVAS.h) {
        errors.push(`${slideId}/${el.id}: outside safe area (${el.x},${el.y},${el.w},${el.h})`);
      }
    }
    (byLayer[el.layer] = byLayer[el.layer] || []).push(el);
    if (el.kind === 'text' && el.text) {
      const cap = textCapacity(el);
      if (!cap.ok) errors.push(`${slideId}/${el.id}: text overflow need ${cap.need.toFixed(1)}px, box ${cap.hold.toFixed(1)}px (${cap.lines} lines)`);
    }
  }
  if (primary !== 1) errors.push(`${slideId}: exactly one primary expected, got ${primary}`);
  if (accent > 1) errors.push(`${slideId}: accent fills > 1`);
  if (warn > 1) errors.push(`${slideId}: warn marks > 1`);
  for (const [layer, arr] of Object.entries(byLayer)) {
    if (layer === 'ground') continue;
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      if (!arr[i].allowOverlap && !arr[j].allowOverlap && rectsOverlap(arr[i], arr[j])) {
        errors.push(`${slideId}: overlap in ${layer} between ${arr[i].id} and ${arr[j].id}`);
      }
    }
  }
  return errors;
}

function selfTest() {
  const assert = require('assert');
  assert.strictEqual(pt(1280), '960pt');
  assert.strictEqual(pt(720), '540pt');
  assert.strictEqual(pt(56), '42pt');
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 0.01);
  const est = estimateText('这是一段中文正文，用来测试容量估算是否稳定。', 24, 468);
  assert.ok(est.lines >= 1 && est.height > 0);
  const el = { text: '测试文本', size: 24, w: 200, h: 100, margin: 0 };
  assert.strictEqual(textCapacity(el).ok, true);
  const over = { text: '很长的文本'.repeat(100), size: 24, w: 200, h: 40, margin: 0 };
  assert.strictEqual(textCapacity(over).ok, false);
  assert.strictEqual(coverCrop(2559, 1593, 400, 200), '0,9.84,0,9.84');
  const fit = containFit(1000, 500, 400, 400);
  assert.deepStrictEqual(fit, { x: 0, y: 100, w: 400, h: 200 });
  assert.strictEqual(tableData(['A', 'B'], [['1', 'x,y'], ['2', 'z']]), 'A,B;1,"x,y";2,z');
  assert.strictEqual(stripTags('a<strong>b</strong>c<em>d</em>'), 'abcd');
  const bad = validateSpec({ meta: { title: 'x' }, theme: { bg: '#fff' }, slides: [] });
  assert.ok(bad.length > 0);
  // motion: token form, aliases, and the old fade/duration object form
  assert.deepStrictEqual(parseMotionToken('push-right-1500', 't').out, { type: 'push', rawType: 'push', speed: null, ms: 1500, modifiers: ['right'] });
  assert.strictEqual(parseMotionToken('venetian-4', 't').errors.length, 0);
  assert.strictEqual(parseMotionToken('blinds', 't').out.type, 'blinds');
  assert.ok(parseMotionToken('bogus', 't').errors.length);
  assert.ok(parseMotionToken('fade-fast-400', 't').errors.some(e => /both speed and duration/.test(e)));
  assert.ok(parseMotionToken('split-upside-down', 't').errors.some(e => /unknown transition modifier/.test(e)));
  assert.ok(validateMotion({ transition: 'fade', duration: 400 }, 'motion').some(e => /is gone/.test(e)));
  assert.strictEqual(validateMotion({ transition: 'fade-400' }, 'motion').length, 0);
  // animation: class × effect matrix, motion paths, template-exit timing
  assert.strictEqual(validateAnimation({ on: 'content', effect: 'fade', class: 'entrance' }, 'a').length, 0);
  assert.ok(validateAnimation({ on: 'image', effect: 'fade', class: 'entrance' }, 'a').some(e => /\.on must be/.test(e)));
  assert.ok(validateAnimation({ on: 'content', effect: 'spin', class: 'entrance' }, 'a').length);
  assert.ok(validateAnimation({ on: 'content', effect: 'floatOut', class: 'emphasis' }, 'a').length);
  assert.strictEqual(validateAnimation({ on: 'content', effect: 'floatOut', class: 'exit' }, 'a').length, 0);
  assert.ok(validateAnimation({ on: 'content', effect: 'contract', class: 'exit', duration: 300 }, 'a').some(e => /keeps PowerPoint/.test(e)));
  assert.ok(validateAnimation({ on: 'content', class: 'motion' }, 'a').some(e => /\.path must be/.test(e)));
  assert.ok(validateAnimation({ on: 'content', class: 'motion', path: 'line' }, 'a').length === 0);
  assert.ok(validateAnimation({ on: 'content', class: 'motion', path: 'custom', d: 'M 0 0 L 0.5 0 E' }, 'a').length === 0);
  assert.ok(validateAnimation({ on: 'content', class: 'motion', path: 'custom' }, 'a').some(e => /\.d must be/.test(e)));
  const animEls = [
    { kind: 'rect', layer: 'ground', id: 1 },
    { kind: 'text', layer: 'chrome', role: 'detail', id: 2 },
    { kind: 'text', layer: 'chrome', role: 'title', id: 3 },
    { kind: 'picture', layer: 'content', id: 4 },
    { kind: 'table', layer: 'content', id: 5 },
    { kind: 'text', layer: 'content', role: 'primary', id: 6 },
    { kind: 'chart', layer: 'content', id: 7 },
    { kind: 'rect', layer: 'card', id: 8 },
  ];
  assert.deepStrictEqual(animationTargets({}, animEls, { on: 'content' }).map(e => e.id), [6, 7]);
  assert.deepStrictEqual(animationTargets({}, animEls, { on: 'primary' }).map(e => e.id), [6]);
  assert.deepStrictEqual(animationTargets({}, animEls, { on: 'title' }).map(e => e.id), [3, 6]);
  assert.deepStrictEqual(animationTargets({}, animEls, { on: 'cards' }).map(e => e.id), [8]);
  assert.deepStrictEqual(animationTargets({}, animEls, { on: 'all' }).map(e => e.id), [3, 6, 7, 8]);
  // motion discipline: calm is the default; expressive turns and choreography must justify themselves
  assert.strictEqual(transitionTier('fade'), 'base');
  assert.strictEqual(transitionTier('push'), 'directional');
  assert.strictEqual(transitionTier('morph'), 'identity');
  assert.strictEqual(transitionTier('vortex'), 'expressive');
  const pol = (motion, slides) => motionPolicyErrors({ motion, slides });
  assert.strictEqual(pol({ transition: 'fade-400' }, [{ id: 'a' }, { id: 'b' }]).length, 0);
  assert.ok(pol({ transition: 'honeycomb-400' }, [{ id: 'a' }]).some(e => /expressive/.test(e)));
  assert.ok(pol({ transition: 'push-right-600' }, [{ id: 'a' }]).some(e => /motion\.why required/.test(e)));
  assert.strictEqual(pol({ transition: 'push-right-600', why: 'direction of the argument' }, [{ id: 'a' }]).length, 0);
  assert.ok(pol({}, [{ id: 'a', transition: 'push-up' }]).some(e => /transition_why/.test(e)));
  assert.strictEqual(pol({}, [{ id: 'a', transition: 'push-up', transition_why: 'steps move forward' }]).length, 0);
  assert.ok(pol({}, [{ id: 'a', animation: { on: 'content', class: 'exit', effect: 'fade', why: 'removed for space' } }]).some(e => /calm decks only reveal/.test(e)));
  assert.ok(pol({ discipline: 'story' }, [{ id: 'a', animation: { on: 'content', class: 'exit', effect: 'fade' } }]).some(e => /animation\.why required/.test(e)));
  assert.strictEqual(pol({ discipline: 'story' }, [{ id: 'a', animation: { on: 'content', class: 'exit', effect: 'fade', why: 'the old model leaves the page' } }]).length, 0);
  assert.ok(pol({}, [0, 1, 2, 3].map(i => ({ id: 's' + i, animation: { on: 'content', class: 'entrance', effect: 'fade' } }))).some(e => /at most 2/.test(e)));
  assert.ok(pol({}, [{ id: 'a', animation: { on: 'content', class: 'entrance', effect: 'fade', duration: 1200 } }]).some(e => /800ms/.test(e)));
  assert.ok(validateMotion({ transition: 'fade-400', why: '  ' }, 'motion').some(e => /why must be one sentence/.test(e)));
  process.stdout.write('lib: self-test OK\n');
}

module.exports = {
  CANVAS, SAFE, SLIDE_PT, BLOCK_KINDS, RECIPE_TYPES, DATA_KINDS,
  TRANSITION_TYPES, TRANSITION_ALIASES, DEFAULT_TRANSITION,
  MOTION_DISCIPLINES, MOTION_TIER, transitionTier, motionPolicyErrors,
  ANIM_CLASSES, ANIM_ON, ANIM_TRIGGERS, ANIMATABLE_KINDS, ANIM_SEGMENT, ANIM_MAX_PER_SLIDE,
  pt, ptNum, round, hexToRgb, contrast, estimateText, textCapacity,
  imageSize, coverCrop, containFit, stripTags, csvCell, tableData, idFor,
  parseMotionToken, validateMotion, validateAnimation, animationTargets, motionWarnings,
  themeErrors, validateSpec, elementErrors, rectsOverlap, versionAtLeast,
};

if (require.main === module) {
  if (process.argv.includes('--self-test')) selfTest();
  else process.stdout.write('usage: node lib.cjs --self-test\n');
}
