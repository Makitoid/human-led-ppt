#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const L = require('./lib.cjs');
const { compile } = require('./build.cjs');

function fail(msg) { process.stdout.write('pptx-lint: FAIL — ' + msg + '\n'); process.exit(1); }
function run(args) {
  const exe = process.env.OFFICECLI_BIN || 'officecli';
  return spawnSync(exe, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}
function runJson(args) {
  const r = run(args);
  if (r.error) return { error: r.error.message };
  if (r.status !== 0) return { error: (r.stderr || r.stdout).trim() };
  try { return { json: JSON.parse(r.stdout) }; } catch { return { error: 'bad JSON from ' + args.join(' ') }; }
}
function parsePt(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const m = String(v).trim().match(/^(-?[\d.]+)\s*(pt|cm|in|emu|mm)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = (m[2] || 'pt').toLowerCase();
  if (u === 'cm') return n * 28.3464567;
  if (u === 'mm') return n * 2.83464567;
  if (u === 'in') return n * 72;
  if (u === 'emu') return n / 12700;
  return n;
}
function norm(s) { return String(s || '').replace(/\s+/g, ''); }
function skeletonCheck(spec, skeletonFile) {
  const warnings = [];
  const errors = [];
  if (!skeletonFile) return { errors, warnings };
  if (!fs.existsSync(skeletonFile)) { warnings.push('skeleton not found: ' + skeletonFile); return { errors, warnings }; }
  const md = fs.readFileSync(skeletonFile, 'utf8');
  const sec4 = md.split(/##\s*§4/)[1]?.split(/##\s*§5/)[0] || md;
  const parts = sec4.split(/^###\s+/m).slice(1);
  const blocks = parts.map(p => {
    const id = p.match(/^(s\d+)/);
    return id ? { id: id[1], body: p } : null;
  }).filter(Boolean);
  if (!blocks.length) { warnings.push('no "### sN" headings found in skeleton §4'); return { errors, warnings }; }
  const types = blocks.map(m => {
    const t = m.body.match(/-\s*type:\s*([^\s#\n]+)/);
    return { id: m.id, type: t ? t[1] : null };
  });
  if (types.length !== spec.slides.length) {
    errors.push(`skeleton has ${types.length} pages, spec has ${spec.slides.length}`);
  }
  const n = Math.min(types.length, spec.slides.length);
  for (let i = 0; i < n; i++) {
    if (types[i].type && spec.slides[i].type !== types[i].type) {
      errors.push(`page ${i + 1}: skeleton type ${types[i].type} vs spec type ${spec.slides[i].type}`);
    }
  }
  return { errors, warnings };
}

function numberAudit(spec, sourcesFile) {
  const errors = [];
  if (!sourcesFile) return { errors, notes: ['number audit skipped (no sources file)'] };
  if (!fs.existsSync(sourcesFile)) return { errors, notes: ['sources file not found: ' + sourcesFile] };
  const sources = norm(fs.readFileSync(sourcesFile, 'utf8'));
  const whitelist = new Set((spec.meta.numberWhitelist || []).map(String));
  for (const slide of spec.slides) {
    const texts = [];
    for (const b of slide.blocks || []) {
      if (!L.DATA_KINDS.includes(b.kind)) continue;
      if (b.kind === 'kpi') (b.items || []).forEach(it => texts.push(String(it.value)));
      if (b.kind === 'table') (b.rows || []).forEach(r => r.forEach(c => texts.push(String(c))));
      if (b.kind === 'chart') (b.series || []).forEach(s => (s.values || []).forEach(v => texts.push(String(v))));
      if (b.kind === 'compare') ['left', 'right'].forEach(k => (b[k]?.items || []).forEach(v => texts.push(String(v))));
      if (b.kind === 'quote') texts.push(String(b.text || ''));
    }
    for (const t of texts) {
      for (const m of String(t).matchAll(/(?<![A-Za-z0-9])-?\d+(?:\.\d+)?(?![A-Za-z0-9])/g)) {
        const tok = m[0];
        if (whitelist.has(tok)) continue;
        if (/^(19|20)\d\d$/.test(tok)) continue;
        if (!sources.includes(norm(tok))) errors.push(`${slide.id}: number ${tok} not found in sources`);
      }
    }
  }
  return { errors, notes: [] };
}

function lintFile(spec, pptx) {
  const errors = [];
  const warnings = [];
  const info = {};
  if (!fs.existsSync(pptx)) return { errors: ['file not found: ' + pptx], warnings, info };
  const v = run(['--version']);
  if (v.error || v.status !== 0) return { errors: ['officecli not available (install binary only; do not run officecli install)'], warnings, info };
  info.officecli = (v.stdout || v.stderr).trim();
  if (!L.versionAtLeast(info.officecli, '1.0.159')) warnings.push('officecli ' + info.officecli + ' < 1.0.159');

  run(['close', pptx]);
  const slides = runJson(['query', pptx, 'slide', '--json']);
  if (slides.error) return { errors: ['query slide failed: ' + slides.error], warnings, info };
  const slideResults = slides.json.data.results || [];
  info.slides = slideResults.length;
  if (slideResults.length !== spec.slides.length) errors.push(`file has ${slideResults.length} slides, spec has ${spec.slides.length}`);

  const notes = runJson(['query', pptx, 'notes', '--json']);
  const notePaths = new Set((notes.json?.data?.results || []).map(r => r.path.split('/notes')[0]));

  slideResults.forEach((r, i) => {
    const f = r.format || {};
    if (f.transition === 'fade' && String(f.transitionDuration) === '400') return;
    if (!f.transition) warnings.push(`slide ${i + 1}: no transition (tell the user to add it in PowerPoint)`);
    else errors.push(`slide ${i + 1}: transition ${f.transition}/${f.transitionDuration}, expected fade/400`);
  });
  spec.slides.forEach((s, i) => {
    if (s.notes && !notePaths.has(`/slide[${i + 1}]`)) errors.push(`${s.id}: notes missing`);
  });

  const ids = new Map();
  for (const type of ['shape', 'picture', 'table', 'chart']) {
    const q = runJson(['query', pptx, type, '--json']);
    if (q.error) { warnings.push(`query ${type} failed: ${q.error}`); continue; }
    for (const r of q.json.data.results || []) {
      const f = r.format || {};
      if (f.id != null) {
        if (ids.has(f.id)) errors.push(`duplicate shape id ${f.id} (${ids.get(f.id)} / ${r.path})`);
        ids.set(f.id, r.path);
      }
      const x = parsePt(f.x), y = parsePt(f.y), w = parsePt(f.width), h = parsePt(f.height);
      if ([x, y, w, h].every(n => n != null)) {
        if (x < -1 || y < -1 || x + w > 961 || y + h > 541) {
          errors.push(`${r.path}: outside slide canvas (${x.toFixed(1)},${y.toFixed(1)},${w.toFixed(1)},${h.toFixed(1)}pt)`);
        }
      }
    }
  }

  const val = run(['validate', pptx]);
  info.validate = (val.stdout || '').trim().split('\n').pop();
  if (val.status !== 0 && val.status !== 2) errors.push('validate failed: ' + info.validate);
  else if (val.status === 2) warnings.push('validate returned warnings (exit 2): ' + info.validate);

  const issues = runJson(['view', pptx, 'issues', '--json']);
  if (issues.error) warnings.push('issues failed: ' + issues.error);
  else {
    const list = issues.json.data.issues || [];
    info.issues = list.length;
    for (const it of list) errors.push(`${it.path}: ${it.subtype} — ${it.message}`);
  }
  run(['close', pptx]);
  return { errors, warnings, info };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help') || !args.length) {
    process.stdout.write('usage: node lint.cjs <spec.json> <out.pptx> [--spec-only] [--skeleton <md>] [--sources <md>] [--report <md>] [--no-number-audit]\n');
    process.exit(args.length ? 0 : 1);
  }
  const specPath = args[0];
  const pptx = args[1];
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const dir = path.dirname(path.resolve(specPath));
  const opt = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : null;
  const skeleton = opt('--skeleton') || (spec.meta.skeleton ? path.resolve(dir, spec.meta.skeleton) : null);
  const sources = opt('--sources') || (() => {
    const cands = fs.readdirSync(dir).filter(f => /(sources|资料总结|資料まとめ)\.md$/.test(f));
    return cands.length ? path.join(dir, cands[0]) : null;
  })();

  const errors = [];
  const warnings = [];
  const notes = [];
  const compiled = compile(spec, dir);
  if (compiled.errors) errors.push(...compiled.errors);
  else notes.push(`spec compiled to ${compiled.batch.length} officecli commands`);

  const sk = skeletonCheck(spec, skeleton);
  errors.push(...sk.errors);
  warnings.push(...sk.warnings);
  if (!args.includes('--no-number-audit')) {
    const na = numberAudit(spec, sources);
    errors.push(...na.errors);
    notes.push(...na.notes);
  }

  let info = {};
  if (!args.includes('--spec-only')) {
    if (!pptx) fail('need <out.pptx> unless --spec-only');
    const f = lintFile(spec, pptx);
    errors.push(...f.errors);
    warnings.push(...f.warnings);
    Object.assign(info, f.info);
  }

  const reportPath = opt('--report');
  if (reportPath) {
    const lines = [
      `# PPTX QA · ${spec.meta.title}`, '',
      `- spec: ${spec.slides.length} slides`,
      `- engine: ${info.officecli || 'spec-only'}`,
      `- file: ${pptx || 'n/a'}`,
      `- validate: ${info.validate || 'n/a'}`,
      `- issues: ${info.issues == null ? 'n/a' : info.issues}`,
      '', '## Checks', '',
      `- [${errors.length ? ' ' : 'x'}] spec + file lint`,
      `- [${errors.some(e => /number/.test(e)) ? ' ' : 'x'}] number audit (${sources ? path.basename(sources) : 'skipped'})`,
      `- [${info.issues === 0 ? 'x' : ' '}] officecli issues = 0`,
      '', '## Warnings', '',
      ...(warnings.length ? warnings.map(w => '- ' + w) : ['- none']),
      '', '## Errors', '',
      ...(errors.length ? errors.map(e => '- ' + e) : ['- none']),
      '', '## Notes', '',
      ...(notes.length ? notes.map(n => '- ' + n) : ['- none']),
      '', '## Unverified', '',
      '- PowerPoint pixel fidelity (officecli renders through its HTML path on this machine)',
      '- per-element animations (none by design; transitions are fade 0.4s)',
    ];
    fs.writeFileSync(reportPath, lines.join('\n') + '\n');
  }

  if (errors.length) {
    process.stdout.write('pptx-lint: FAIL\n  - ' + errors.join('\n  - ') + '\n');
    if (warnings.length) process.stdout.write('  warnings:\n  - ' + warnings.join('\n  - ') + '\n');
    process.exit(1);
  }
  process.stdout.write(`pptx-lint: OK — ${spec.slides.length} slides${info.slides ? `, ${info.slides} in file` : ''}`
    + `${info.validate ? `, validate: ${info.validate}` : ''}${info.issues != null ? `, issues: ${info.issues}` : ''}`
    + (warnings.length ? ` (${warnings.length} warnings)` : '') + '\n');
  if (warnings.length) process.stdout.write('  warnings:\n  - ' + warnings.join('\n  - ') + '\n');
}

if (require.main === module) main();
module.exports = { lintFile, skeletonCheck, numberAudit };
