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
  if (!spec.theme) errors.push('theme required');
  else errors.push(...themeErrors(spec.theme));
  if (!Array.isArray(spec.slides) || !spec.slides.length) errors.push('slides must be a non-empty array');
  if (spec.meta && spec.meta.slides && spec.slides && spec.meta.slides !== spec.slides.length) {
    errors.push(`meta.slides=${spec.meta.slides} but slides.length=${spec.slides.length}`);
  }
  const motion = spec.motion || {};
  if (motion.transition !== 'fade' || motion.duration !== 400) errors.push('motion must be {transition:"fade", duration:400}');
  const types = new Set();
  const custom = [];
  (spec.slides || []).forEach((s, i) => {
    const at = `slide ${i + 1} (${s.id || 'no id'})`;
    if (!s.id) errors.push(at + ': id required');
    if (!s.type) errors.push(at + ': type required');
    else if (typeof s.type !== 'string') errors.push(at + ': type must be a string');
    else types.add(s.type);
    if (s.type === 'custom') custom.push(at);
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
  process.stdout.write('lib: self-test OK\n');
}

module.exports = {
  CANVAS, SAFE, SLIDE_PT, BLOCK_KINDS, RECIPE_TYPES, DATA_KINDS,
  pt, ptNum, round, hexToRgb, contrast, estimateText, textCapacity,
  imageSize, coverCrop, containFit, stripTags, csvCell, tableData, idFor,
  themeErrors, validateSpec, elementErrors, rectsOverlap, versionAtLeast,
};

if (require.main === module) {
  if (process.argv.includes('--self-test')) selfTest();
  else process.stdout.write('usage: node lib.cjs --self-test\n');
}
