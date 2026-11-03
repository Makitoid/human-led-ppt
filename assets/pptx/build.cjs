#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const L = require('./lib.cjs');
const { buildSlide } = require('./recipes.cjs');
const { INSTALL_HINT } = require('./detect-engine.cjs');

const LAYER_ORDER = { ground: 0, card: 1, content: 2, chrome: 3 };

function fail(msg) { process.stdout.write('pptx-build: FAIL — ' + msg + '\n'); process.exit(1); }
function officecli(args, opts = {}) {
  const exe = process.env.OFFICECLI_BIN || 'officecli';
  const r = spawnSync(exe, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...opts });
  if (r.error) fail('cannot run officecli: ' + r.error.message + '\n' + INSTALL_HINT);
  return r;
}
function officecliJson(args) {
  const r = officecli(args);
  if (r.status !== 0) fail(`officecli ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  try { return JSON.parse(r.stdout); } catch { fail('bad JSON from officecli ' + args.join(' ')); }
}

function textProps(el, theme) {
  const sizePt = L.ptNum(el.size || theme.scale.body);
  const lineHeight = (el.size || theme.scale.body) * (el.tight ? 1.15 : 1.30);
  const props = {
    id: el.id,
    text: L.stripTags(el.text),
    x: L.pt(el.x), y: L.pt(el.y), width: L.pt(el.w), height: L.pt(el.h),
    size: sizePt,
    color: el.color || theme.ink,
    autoFit: 'none',
    margin: L.pt(el.margin || 0),
    lineSpacing: L.pt(lineHeight),
  };
  if (el.bold) props.bold = true;
  if (el.italic) props.italic = true;
  if (el.align) props.align = el.align;
  if (el.valign) props.valign = el.valign;
  if (el.list) props.list = el.list;
  if (el.spaceAfter) props.spaceAfter = L.pt(el.spaceAfter);
  if (el.spacing) props.spacing = el.spacing;
  if (el.mono) { props.font = 'Consolas'; props['font.ea'] = theme.font.ea; }
  else { props['font.latin'] = theme.font.latin; props['font.ea'] = theme.font.ea; }
  return props;
}

function rectProps(el) {
  const props = {
    id: el.id,
    geometry: el.radius ? 'roundRect' : 'rect',
    fill: el.fill || '#FFFFFF',
    line: el.line || 'none',
    x: L.pt(el.x), y: L.pt(el.y), width: L.pt(el.w), height: L.pt(el.h),
  };
  if (el.radius) props.adj = 'adj:val ' + Math.max(0, Math.min(50000, Math.round(el.radius / Math.min(el.w, el.h) * 100000)));
  if (el.opacity != null) props.opacity = el.opacity;
  return props;
}

function pictureProps(el, specDir) {
  const src = path.resolve(specDir, el.src);
  if (!fs.existsSync(src)) throw new Error('image not found: ' + el.src);
  const props = {
    id: el.id, src,
    x: L.pt(el.x), y: L.pt(el.y), width: L.pt(el.w), height: L.pt(el.h),
    alt: el.alt || '',
  };
  const dim = L.imageSize(src);
  if (el.fit === 'contain') {
    const f = L.containFit(dim.w, dim.h, el.w, el.h);
    props.x = L.pt(el.x + f.x); props.y = L.pt(el.y + f.y);
    props.width = L.pt(f.w); props.height = L.pt(f.h);
  } else {
    props.crop = L.coverCrop(dim.w, dim.h, el.w, el.h);
  }
  return props;
}

function tableCommands(el, theme, slidePath) {
  const size = theme.scale.body;
  const nCols = el.cols.length;
  const colW = el.colWidths || Array(nCols).fill(el.w / nCols);
  const padX = 12, padY = 8;
  const rowHeights = [el.cols, ...el.rows].map(row => {
    let lines = 1;
    row.forEach((cell, i) => {
      const est = L.estimateText(String(cell), size, colW[i] - padX * 2);
      lines = Math.max(lines, est.lines);
    });
    return lines * size * 1.3 + padY * 2;
  });
  const total = rowHeights.reduce((a, b) => a + b, 0);
  if (total > el.h * 1.02) {
    throw new Error(`table needs ${total.toFixed(0)}px but box is ${el.h.toFixed(0)}px`);
  }
  const idPath = `${slidePath}/table[@id=${el.id}]`;
  const y = el.y + Math.max(0, (el.h - total) / 2);
  const cmds = [{
    command: 'add', parent: slidePath, type: 'table', props: {
      id: el.id,
      data: L.tableData(el.cols, el.rows),
      x: L.pt(el.x), y: L.pt(y), width: L.pt(el.w), height: L.pt(total),
      colWidths: colW.map(L.pt).join(','),
      style: 'none', firstRow: false, bandedRows: false,
      'border.all': '0.75pt solid ' + theme.rule,
    },
  }];
  rowHeights.forEach((h, i) => {
    cmds.push({ command: 'set', path: `${idPath}/tr[${i + 1}]`, props: { height: L.pt(h) } });
  });
  [el.cols, ...el.rows].forEach((row, r) => {
    row.forEach((cell, c) => {
      const props = {
        text: String(cell),
        size: L.ptNum(size),
        color: theme.ink,
        'font.latin': theme.font.latin,
        'font.ea': theme.font.ea,
        valign: 'center',
      };
      if (r === 0) { props.bold = true; props.fill = theme.panel; }
      cmds.push({ command: 'set', path: `${idPath}/tr[${r + 1}]/tc[${c + 1}]`, props });
    });
  });
  return cmds;
}

function chartProps(el, theme) {
  const props = {
    id: el.id,
    chartType: el.chartType || 'column',
    categories: el.categories.join(','),
    data: el.series.map(s => `${s.name}:${s.values.join(',')}`).join(';'),
    colors: (el.colors && el.colors.length ? el.colors : el.series.map((s, i) => i === 0 ? theme.accent : theme.muted)).join(','),
    autotitledeleted: true,
    chartareafill: 'none',
    legend: el.series.length > 1 ? 'bottom' : 'none',
    gridlines: false,
    axisfont: `${L.ptNum(theme.scale.meta)}:${theme.muted}:${theme.font.latin}`,
    x: L.pt(el.x), y: L.pt(el.y), width: L.pt(el.w), height: L.pt(el.h),
  };
  if (el.xTitle) props.cattitle = el.xTitle;
  if (el.yTitle) props.axistitle = el.yTitle;
  return props;
}

function elementCommands(el, theme, slidePath, specDir) {
  if (el.kind === 'text') return [{ command: 'add', parent: slidePath, type: 'textbox', props: textProps(el, theme) }];
  if (el.kind === 'rect') return [{ command: 'add', parent: slidePath, type: 'shape', props: rectProps(el) }];
  if (el.kind === 'picture') return [{ command: 'add', parent: slidePath, type: 'picture', props: pictureProps(el, specDir) }];
  if (el.kind === 'media') {
    let x = el.x, y = el.y, w = el.w, h = el.h;
    if (el.mediaType === 'audio') {
      const side = Math.min(w, h, 160);
      x += (w - side) / 2; y += (h - side) / 2; w = side; h = side;
    } else if (el.poster && fs.existsSync(path.resolve(specDir, el.poster))) {
      const dim = L.imageSize(path.resolve(specDir, el.poster));
      const f = L.containFit(dim.w, dim.h, w, h);
      x += f.x; y += f.y; w = f.w; h = f.h;
    }
    return [{ command: 'add', parent: slidePath, type: 'media', props: {
      id: el.id, src: path.resolve(specDir, el.src), poster: el.poster ? path.resolve(specDir, el.poster) : undefined,
      x: L.pt(x), y: L.pt(y), width: L.pt(w), height: L.pt(h), autoPlay: false,
    } }];
  }
  if (el.kind === 'table') return tableCommands(el, theme, slidePath);
  if (el.kind === 'chart') return [{ command: 'add', parent: slidePath, type: 'chart', props: chartProps(el, theme) }];
  if (el.kind === 'connector') {
    return [{ command: 'add', parent: slidePath, type: 'shape', props: {
      id: el.id, geometry: 'rightArrow', fill: theme.muted, line: 'none',
      x: L.pt(el.x), y: L.pt(el.y), width: L.pt(el.w), height: L.pt(el.h),
    } }];
  }
  throw new Error('unknown element kind ' + el.kind);
}

function animProps(anim) {
  const props = { class: anim.class, trigger: anim.trigger || 'onClick' };
  if (anim.class === 'motion') {
    props.path = anim.path;
    if (anim.d) props.d = anim.d;
  } else props.effect = anim.effect;
  if (anim.direction) props.direction = anim.direction;
  if (anim.duration != null) props.duration = anim.duration;
  if (anim.delay != null) props.delay = anim.delay;
  if (anim.repeat != null) props.repeat = anim.repeat;
  return props;
}

// Click order is the order the commands run in, so targets go in reading order (top-to-bottom, left-to-right).
function animationCommands(slide, elements, slidePath, at, errors) {
  const anim = slide.animation;
  if (!anim) return [];
  const targets = L.animationTargets(slide, elements, anim)
    .slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
  if (!targets.length) {
    errors.push(`${at}: animation.on="${anim.on}" matched no animatable element — pictures, tables and media cannot carry animations in officecli`);
    return [];
  }
  if (targets.length > L.ANIM_MAX_PER_SLIDE) {
    errors.push(`${at}: animation on ${targets.length} elements > ${L.ANIM_MAX_PER_SLIDE} clicks — shorten the block or drop the animation`);
    return [];
  }
  return targets.map(el => ({
    command: 'add', parent: `${slidePath}/${L.ANIM_SEGMENT[el.kind]}[@id=${el.id}]`, type: 'animation', props: animProps(anim),
  }));
}

function motionToken(spec, slide) { return slide.transition || (spec.motion || {}).transition || L.DEFAULT_TRANSITION; }

function compile(spec, specDir) {
  const errors = L.validateSpec(spec);
  if (errors.length) return { errors };
  const theme = spec.theme;
  const slides = spec.slides.map((s, i) => {
    let elements;
    try { elements = buildSlide(s, theme, i + 1, spec.meta.evidence_chain); }
    catch (e) { errors.push(`${s.id}: ${e.message}`); return null; }
    for (const b of s.blocks || []) {
      if (!['image', 'media'].includes(b.kind)) continue;
      if (b.src && !fs.existsSync(path.resolve(specDir, b.src))) errors.push(`${s.id}: asset not found: ${b.src}`);
      if (b.poster && !fs.existsSync(path.resolve(specDir, b.poster))) errors.push(`${s.id}: poster not found: ${b.poster}`);
    }
    elements.sort((a, b) => LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer]);
    errors.push(...L.elementErrors(elements, s.id));
    return { slide: s, elements };
  });
  if (errors.length) return { errors };

  const batch = [
    { command: 'set', path: '/', props: { title: spec.meta.title, author: spec.meta.author || '', slideWidth: '960pt', slideHeight: '540pt' } },
    { command: 'set', path: '/theme', props: {
      headingFont: theme.font.latin, bodyFont: theme.font.latin,
      'headingFont.ea': theme.font.ea, 'bodyFont.ea': theme.font.ea,
      dk1: theme.ink, lt1: theme.bg, dk2: theme.muted, lt2: theme.panel,
      accent1: theme.accent, accent2: theme.warn, accent3: theme.rule,
      hlink: theme.accent, folHlink: theme.muted,
    } },
  ];
  spec.slides.forEach(s => {
    batch.push({ command: 'add', parent: '/', type: 'slide', props: { layout: 'Blank', background: theme.bg, transition: motionToken(spec, s) } });
  });
  slides.forEach(({ slide, elements }, i) => {
    const slidePath = `/slide[${i + 1}]`;
    for (const el of elements) {
      try { batch.push(...elementCommands(el, theme, slidePath, specDir)); }
      catch (e) { errors.push(`${slide.id}/${el.id}: ${e.message}`); }
    }
    batch.push(...animationCommands(slide, elements, slidePath, slide.id, errors));
    const notes = [slide.notes, slide.source && 'Source: ' + slide.source].filter(Boolean).join('\n\n');
    if (notes) batch.push({ command: 'add', parent: slidePath, type: 'notes', props: { text: L.stripTags(notes) } });
  });
  if (errors.length) return { errors };
  return { batch, slides };
}

function applyBatch(out, batch, locale) {
  officecli(['close', out]);
  try { fs.rmSync(out, { force: true, maxRetries: 8, retryDelay: 250 }); }
  catch (e) { fail('cannot remove ' + out + ' (still locked? close PowerPoint/officecli): ' + e.message); }
  let r = officecli(['create', out, '--force', '--locale', locale || 'zh-CN']);
  if (r.status !== 0) fail('create failed: ' + (r.stderr || r.stdout));
  officecli(['close', out]);
  // A rejected item rolls the whole batch back; report the per-command reason instead of dumping the JSON.
  const r2 = officecli(['batch', out, '--input', '-', '--json'], { input: JSON.stringify(batch) });
  let parsed = null;
  try { parsed = JSON.parse(r2.stdout); } catch { /* older officecli without --json support */ }
  if (r2.status !== 0 || (parsed && parsed.success === false)) {
    if (!parsed) fail('batch failed: ' + (r2.stderr || r2.stdout));
    const s = (parsed.data || {}).summary || {};
    const first = ((parsed.data || {}).results || []).filter(x => !x.success).slice(0, 5).map(x => {
      const item = x.item || {};
      return `    #${x.index} ${item.command} ${item.type || ''} ${item.path || item.parent || ''} — ${x.error}`;
    });
    fail(`${s.failed || '?'} of ${s.total} batch commands rejected${s.atomicRolledBack ? ' and the batch rolled back' : ''} — nothing was written:\n${first.join('\n')}`);
  }
  officecli(['close', out]);
  return r2.stdout;
}

// Type mismatch removes every transition (never ship a different effect than the spec names);
// duration/direction drift is reported, because officecli drops some modifiers silently.
function verifyTransitions(out, spec) {
  const count = spec.slides.length;
  const bad = [];
  const drift = [];
  spec.slides.forEach((s, i) => {
    const token = motionToken(spec, s);
    const exp = L.parseMotionToken(token, token).out;
    const r = officecli(['get', out, `/slide[${i + 1}]`, '--json']);
    if (r.status !== 0) { bad.push(i + 1); return; }
    let f;
    try { f = JSON.parse(r.stdout).data.results[0].format; } catch { bad.push(i + 1); return; }
    const got = String(f.transition || '');
    const gotType = got.split('-')[0];
    if (exp.type === 'none') { if (got) drift.push(`slide ${i + 1}: spec says no transition, file has ${got}`); return; }
    if (!got || gotType !== exp.type) { bad.push(i + 1); return; }
    const gotParts = got.split('-').slice(1);
    const lost = exp.modifiers.filter(m => !gotParts.includes(m));
    if (exp.ms != null && String(f.transitionDuration) !== String(exp.ms)) {
      drift.push(`slide ${i + 1}: ${gotType} duration reads back ${f.transitionDuration || 'unset'}, spec says ${exp.ms}ms`);
    } else if (exp.speed && f.transitionSpeed !== exp.speed) {
      drift.push(`slide ${i + 1}: ${gotType} speed reads back ${f.transitionSpeed || 'unset'}, spec says ${exp.speed}`);
    }
    if (lost.length) drift.push(`slide ${i + 1}: ${gotType} dropped modifier ${lost.join('/')} on readback`);
  });
  if (!bad.length) return { ok: true, drift };
  const batch = [];
  for (let i = 1; i <= count; i++) batch.push({ command: 'set', path: `/slide[${i}]`, props: { transition: 'none' } });
  officecli(['batch', out, '--input', '-'], { input: JSON.stringify(batch) });
  officecli(['close', out]);
  return { ok: false, drift, slides: bad };
}

// Transitions beyond fade, and every in-page animation, are verified only on officecli 1.0.160.
function motionGateError(version, spec) {
  if (L.versionAtLeast(version, '1.0.160')) return null;
  const beyondFade = (spec.slides || []).some(s => s.animation)
    || [spec.motion && spec.motion.transition].concat((spec.slides || []).map(s => s.transition))
      .filter(Boolean).some(t => String(t).split('-')[0] !== 'fade');
  if (!beyondFade) return null;
  return `officecli ${version}: transitions beyond fade and in-page animations are only verified on 1.0.160+. Upgrade the binary, or set motion to "fade-400" and drop every slide.animation.`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help') || args.length < 2) {
    process.stdout.write('usage: node build.cjs <spec.json> <out.pptx> [--emit-only] [--batch <file>]\n');
    process.exit(args.length < 2 ? 1 : 0);
  }
  const [specPath, out] = args.filter(a => !a.startsWith('--'));
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const specDir = path.dirname(path.resolve(specPath));
  const vr = officecli(['--version']);
  if (vr.status !== 0) fail('officecli not available. ' + INSTALL_HINT);
  const version = (vr.stdout || '').trim();
  if (!L.versionAtLeast(version, '1.0.159')) fail(`officecli ${version} is older than 1.0.159; upgrade before building.`);
  const gate = motionGateError(version, spec);
  if (gate) fail(gate);
  const result = compile(spec, specDir);
  if (result.errors) fail('\n  - ' + result.errors.join('\n  - '));
  const batchPath = args.includes('--batch') ? args[args.indexOf('--batch') + 1] : out + '.batch.json';
  fs.writeFileSync(batchPath, JSON.stringify(result.batch, null, 2));
  if (args.includes('--emit-only')) {
    process.stdout.write(`pptx-build: OK — emitted ${result.batch.length} commands to ${batchPath}\n`);
    return;
  }
  applyBatch(out, result.batch, spec.meta.locale);
  const motion = verifyTransitions(out, spec);
  officecli(['close', out]);
  const bytes = fs.statSync(out).size;
  process.stdout.write(`pptx-build: OK — ${path.basename(out)} (${spec.slides.length} slides, ${result.batch.length} commands, ${bytes} bytes)\n`);
  if (!motion.ok) process.stdout.write(`pptx-build: WARN — transition type did not read back on slide ${motion.slides.join('/')}; all transitions removed, add them in PowerPoint\n`);
  for (const w of motion.drift) process.stdout.write(`pptx-build: WARN — ${w}\n`);
  const animated = (spec.slides || []).filter(s => s.animation).length;
  if (animated) process.stdout.write(`pptx-build: ${animated} slide(s) carry in-page animations — check them in PowerPoint, officecli screenshots do not show motion\n`);
}

if (require.main === module) main();
module.exports = { compile, applyBatch, verifyTransitions, motionGateError };
