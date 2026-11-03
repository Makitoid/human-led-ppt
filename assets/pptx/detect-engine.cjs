#!/usr/bin/env node
'use strict';
// Compatibility filename: this checks officecli availability only.
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const HOME = os.homedir();
const INSTALL_HINT = 'Install the officecli BINARY only (never run `officecli install`): Windows `irm https://d.ai.officecli.ai/install.ps1 | iex`; macOS/Linux `curl -fsSL https://d.ai.officecli.ai/install.sh | bash`; or `npm i -g @officecli/officecli`. Reopen your shell and run `officecli --version`.';

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
  const office = officecliInfo();
  const out = {
    route: 'officecli',
    reason: 'officecli is the generation engine in every environment',
    officecli: office,
    installHint: office.found ? null : INSTALL_HINT,
  };
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  } else {
    process.stdout.write('engine: officecli\n');
    process.stdout.write(`officecli: ${office.found ? office.version + ' @ ' + office.path : 'not found'}\n`);
    if (out.installHint) process.stdout.write(out.installHint + '\n');
  }
  if (!office.found) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { officecliInfo, INSTALL_HINT };
