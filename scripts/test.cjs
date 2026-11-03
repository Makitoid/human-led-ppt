#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { compile } = require('../assets/pptx/build.cjs');
const root = path.resolve(__dirname, '..');
const spec = require('../assets/pptx/fixtures/demo.json');
const dir = path.join(root, 'assets/pptx/fixtures');

for (const setting of [undefined, 'off', 'on']) {
  const input = structuredClone(spec);
  input.meta.evidence_chain = setting;
  const result = compile(input, dir);
  assert(!result.errors, JSON.stringify(result.errors));
  for (let i = 0; i < input.slides.length; i++) {
    const source = input.slides[i].source;
    if (!source) continue;
    const footer = result.batch.find(c => c.type === 'textbox' && c.parent === `/slide[${i + 1}]` && c.props.text === source);
    assert.equal(!!footer, setting === 'on', `footer display with evidence_chain=${setting}`);
    const notes = result.batch.find(c => c.type === 'notes' && c.parent === `/slide[${i + 1}]`);
    assert(notes?.props.text.includes(source), 'source retained in notes');
    if (input.slides[i].notes) assert(notes.props.text.includes(input.slides[i].notes));
  }
}
const invalid = structuredClone(spec);
invalid.meta.evidence_chain = 'yes';
assert(compile(invalid, dir).errors.some(e => e.includes('meta.evidence_chain')));

// Execute the CLI with a mocked binary probe. Any filesystem/plugin scan fails this test.
for (const installed of [true, false]) {
  let output = '';
  const proc = { argv: ['node', 'detect-engine.cjs', '--json'], platform: 'win32',
    env: { CLAUDECODE: '1', CODEX_HOME: '/host/codex', DSH_HOME: '/host/dsh', LOCALAPPDATA: '/local' },
    stdout: { write: s => { output += s; } } };
  const mod = { exports: {} };
  const req = name => {
    if (name === 'fs') throw Error('plugin scanning is forbidden');
    if (name === 'os') return { homedir: () => '/home' };
    if (name === 'child_process') return { spawnSync: (exe, args) => {
      assert.deepEqual(Array.from(args), ['--version']);
      return installed ? { status: 0, stdout: '1.0.160' } : { status: null, error: Error('missing') };
    } };
    return require(name);
  };
  req.main = mod;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/pptx/detect-engine.cjs'), 'utf8'), {
    require: req, module: mod, process: proc,
  });
  const info = JSON.parse(output);
  assert.equal(info.route, 'officecli');
  assert.equal(info.officecli.found, installed);
  assert(!('harness' in info) && !('pptPlugins' in info));
  assert.equal(proc.exitCode || 0, installed ? 0 : 1);
  assert.equal(!!info.installHint, !installed);
}
console.log('PASS: evidence defaults/opt-in/notes, invalid setting, officecli availability and missing-binary guidance');
