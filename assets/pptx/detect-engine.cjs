#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const HOME = os.homedir();
const HOSTS = [
  { id: 'claude', dirs: ['.claude/skills'], env: ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_PROJECT_DIR'] },
  { id: 'codex', dirs: ['.codex/skills', '.agents/skills'], env: ['CODEX_HOME', 'CODEX_SANDBOX', 'CODEX_MANAGED_BY_NPM'] },
  { id: 'zcode', dirs: ['.zcode/skills'], env: ['ZCODE_HOME'] },
  { id: 'dsh', dirs: ['skills'], env: ['DSH_HOME', 'DSH_PERMISSION_MODE'], dsh: true },
  { id: 'qoder', dirs: ['.qoder-cn/skills', '.qoder/skills'], env: ['QODER_CONFIG_DIR'] },
  { id: 'cursor', dirs: ['.cursor/skills'], env: ['CURSOR_TRACE_ID'] },
  { id: 'windsurf', dirs: ['.codeium/windsurf/skills'], env: [] },
];
const HOST_PLUGIN_HOSTS = new Set(['claude', 'codex', 'zcode', 'dsh']);
const PPT_RE = /(ppt|pptx|powerpoint|slide|presentation|deck|演示|幻灯片|汇报)/i;

function skillRoot() {
  const arg = process.argv.indexOf('--root');
  if (arg > -1 && process.argv[arg + 1]) return path.resolve(process.argv[arg + 1]);
  let p = path.resolve(__dirname);
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(p, 'SKILL.md'))) return p;
    p = path.dirname(p);
  }
  return path.resolve(__dirname, '..', '..');
}

function readText(file, limit = 4000) {
  try { return fs.readFileSync(file, 'utf8').slice(0, limit); } catch { return ''; }
}

function isSelf(dir, selfRoot) {
  return path.resolve(dir) === path.resolve(selfRoot) || /human-led-ppt$/i.test(dir);
}

function scanSkills(root, selfRoot) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  let entries = [];
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(root, e.name);
    if (isSelf(dir, selfRoot)) continue;
    const sk = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(sk)) continue;
    const txt = readText(sk);
    const name = (txt.match(/^name:\s*(.+)$/m) || [])[1] || e.name;
    const desc = (txt.match(/^description:\s*([\s\S]*?)(?=^[a-z_]+:|\n---)/m) || [])[1] || '';
    const hay = e.name + ' ' + name + ' ' + desc;
    if (PPT_RE.test(hay)) out.push({ name: e.name, path: dir, evidence: sk, pptxCapable: !/html/i.test(hay) || /(pptx|powerpoint)/i.test(hay) });
  }
  return out;
}

function scanPlugins(root, selfRoot) {
  const out = [];
  const base = path.join(root, 'plugins');
  if (!fs.existsSync(base)) return out;
  const walk = (dir, depth) => {
    if (depth > 3) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.name === 'SKILL.md' && !isSelf(dir, selfRoot)) {
        const txt = readText(p);
        const name = (txt.match(/^name:\s*(.+)$/m) || [])[1] || path.basename(dir);
        const desc = (txt.match(/^description:\s*([\s\S]*?)(?=^[a-z_]+:|\n---)/m) || [])[1] || '';
        const hay = path.basename(dir) + ' ' + name + ' ' + desc;
        if (PPT_RE.test(hay)) out.push({ name: path.basename(dir), path: dir, evidence: p, pptxCapable: !/html/i.test(hay) || /(pptx|powerpoint)/i.test(hay) });
      }
    }
  };
  walk(base, 0);
  return out;
}

function detectHost(root) {
  const evidence = [];
  for (const h of HOSTS) {
    const dirs = h.dsh && process.env.DSH_HOME ? [path.join(process.env.DSH_HOME, 'skills'), ...h.dirs] : h.dirs;
    for (const d of dirs) {
      const abs = path.isAbsolute(d) ? d : path.join(HOME, d);
      if (!fs.existsSync(abs)) continue;
      const rel = path.relative(abs, root);
      if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
        evidence.push(`skill path under ${abs}`);
        return { id: h.id, evidence };
      }
    }
    for (const k of h.env) {
      if (process.env[k]) { evidence.push(`env ${k}`); return { id: h.id, evidence }; }
    }
  }
  if (process.env.QODER_CONFIG_DIR) return { id: 'qoder', evidence: ['env QODER_CONFIG_DIR'] };
  return { id: 'other', evidence: ['no harness marker'] };
}

function officecliInfo() {
  const candidates = [process.env.OFFICECLI_BIN, 'officecli'];
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    candidates.push(path.join(process.env.LOCALAPPDATA, 'OfficeCli', 'officecli.exe'));
  }
  candidates.push(path.join(HOME, '.local', 'bin', process.platform === 'win32' ? 'officecli.exe' : 'officecli'));
  for (const c of candidates.filter(Boolean)) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return { found: true, path: c, version: (r.stdout || r.stderr).trim() };
  }
  return { found: false, path: null, version: null };
}

function main() {
  const root = skillRoot();
  const host = detectHost(root);
  const scanDirs = new Set();
  for (const h of HOSTS) if (h.id === host.id) {
    for (const d of h.dirs) scanDirs.add(path.isAbsolute(d) ? d : path.join(HOME, d));
    if (h.dsh && process.env.DSH_HOME) scanDirs.add(path.join(process.env.DSH_HOME, 'skills'));
  }
  for (const d of scanDirs) scanDirs.add(path.join(d, '..'));
  const plugins = [];
  for (const d of scanDirs) {
    plugins.push(...scanSkills(path.basename(d) === 'skills' ? d : path.join(d, 'skills'), root));
    plugins.push(...scanPlugins(path.basename(d) === 'skills' ? path.dirname(d) : d, root));
  }
  const unique = [];
  const seen = new Set();
  for (const p of plugins) if (!seen.has(p.path)) { seen.add(p.path); unique.push(p); }

  const office = officecliInfo();
  let route = 'officecli';
  let reason = 'officecli is mandatory in this host';
  if (HOST_PLUGIN_HOSTS.has(host.id)) {
    const capable = unique.filter(p => p.pptxCapable);
    if (capable.length) { route = 'host-plugin'; reason = `host ${host.id} has a PPTX-capable plugin (${capable[0].name})`; }
    else { route = 'officecli'; reason = `host ${host.id} has no PPTX-capable plugin; falling back to officecli`; }
  }
  const out = {
    harness: host.id,
    evidence: host.evidence,
    skillRoot: root,
    pptPlugins: unique,
    officecli: office,
    route,
    reason,
    installHint: route === 'officecli' && !office.found
      ? 'Install the officecli BINARY only (do not run `officecli install`): Windows `irm https://d.ai.officecli.ai/install.ps1 | iex`; macOS/Linux `curl -fsSL https://d.ai.officecli.ai/install.sh | bash`; or `npm i -g @officecli/officecli`.'
      : null,
  };
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } else {
    process.stdout.write(`harness: ${out.harness} (${out.evidence.join('; ')})\n`);
    process.stdout.write(`route: ${out.route} — ${out.reason}\n`);
    process.stdout.write(`officecli: ${out.officecli.found ? out.officecli.version + ' @ ' + out.officecli.path : 'not found'}\n`);
    if (unique.length) process.stdout.write('ppt plugins:\n  - ' + unique.map(p => p.name + ' @ ' + p.path).join('\n  - ') + '\n');
  }
}

main();
