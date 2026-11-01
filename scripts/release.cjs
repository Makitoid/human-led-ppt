#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, '..');
const PACKAGE_DIR = 'human-led-ppt';
const SKIP_AT_ROOT = new Set(['.git', '.gitignore', '.probe', 'pic', 'promo', 'scripts']);

const SKILL_LANGUAGE_LINE =
  'Language: `references/zh/` is the Chinese original (中文母本), `references/en/` and `references/ja/` are its English and Japanese mirrors — same content, so a revision touches all three. Work entirely inside the folder matching the user\'s language.';
const SKILL_RESOURCES_LINE =
  '`references/zh/`, `references/en/` and `references/ja/` mirror each other, one document per step.';

const LANGS = [
  {
    id: 'zh-cn',
    refs: 'zh',
    changelog: 'CHANGELOG_zh-cn.md',
    skillLanguage:
      'this package ships the Chinese original only — read every step document from `references/zh/`.',
    changelogNav: ['[English](CHANGELOG.md) · **中文** · [日本語](CHANGELOG_ja.md)', '**中文**'],
  },
  {
    id: 'en',
    refs: 'en',
    changelog: 'CHANGELOG.md',
    skillLanguage:
      'this package ships the English version only — read every step document from `references/en/`.',
    changelogNav: ['**English** · [中文](CHANGELOG_zh-cn.md) · [日本語](CHANGELOG_ja.md)', '**English**'],
  },
  {
    id: 'ja',
    refs: 'ja',
    changelog: 'CHANGELOG_ja.md',
    skillLanguage:
      'this package ships the Japanese version only — read every step document from `references/ja/`.',
    changelogNav: ['[English](CHANGELOG.md) · [中文](CHANGELOG_zh-cn.md) · **日本語**', '**日本語**'],
  },
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function replaceOnce(text, from, to, label) {
  const parts = text.split(from);
  if (parts.length !== 2) {
    throw new Error(`${label}: expected exactly one match, found ${parts.length - 1}`);
  }
  return parts.join(to);
}

function readVersion() {
  const match = read('SKILL.md').match(/^Version (\d+\.\d+(?:\.\d+)?) \((\d{4}-\d{2}-\d{2})\)/m);
  if (!match) {
    throw new Error('SKILL.md is missing a "Version X.Y (YYYY-MM-DD)" line');
  }
  const version = match[1];
  const date = match[2];
  const problems = [];

  for (const file of ['README.md', 'README_zh-cn.md', 'README_ja.md']) {
    const badge = read(file).match(/!\[Version ([^\]]*)\]/);
    if (!badge) problems.push(`${file}: no version badge`);
    else if (badge[1] !== version) problems.push(`${file}: badge says ${badge[1]}`);
  }
  for (const file of ['CHANGELOG.md', 'CHANGELOG_zh-cn.md', 'CHANGELOG_ja.md']) {
    const heading = read(file).match(/^## v([^\s]+) /m);
    if (!heading) problems.push(`${file}: no "## vX.Y" heading`);
    else if (heading[1] !== version) problems.push(`${file}: latest entry is v${heading[1]}`);
  }
  if (problems.length) {
    throw new Error(`version mismatch (SKILL.md says ${version}):\n  - ${problems.join('\n  - ')}`);
  }
  return { version, date };
}

function walk(absDir, relDir, out) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (!relDir && SKIP_AT_ROOT.has(entry.name)) continue;
    const abs = path.join(absDir, entry.name);
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(abs, rel, out);
    else if (entry.isFile()) out.push(rel);
  }
}

function includedFor(lang, rel) {
  if (rel.startsWith('README')) return false;
  if (rel.startsWith('CHANGELOG')) return !lang || rel === lang.changelog;
  if (!lang) return true;
  if (rel.startsWith('references/')) return rel.startsWith(`references/${lang.refs}/`);
  return true;
}

function contentFor(lang, rel, data) {
  if (!lang) return data;
  let text = data.toString('utf8');

  if (rel === 'SKILL.md') {
    text = replaceOnce(text, SKILL_LANGUAGE_LINE, `Language: ${lang.skillLanguage}`, 'SKILL.md language line');
    text = replaceOnce(
      text,
      SKILL_RESOURCES_LINE,
      `\`references/${lang.refs}/\` holds one document per step.`,
      'SKILL.md resources line'
    );
    return Buffer.from(text, 'utf8');
  }
  if (rel === lang.changelog) {
    text = replaceOnce(text, lang.changelogNav[0], lang.changelogNav[1], `${lang.changelog} language nav`);
    return Buffer.from(text, 'utf8');
  }
  return data;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function dosDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return ((year - 1980) << 9) | (month << 5) | day;
}

function buildZip(entries, date) {
  const zipDate = dosDate(date);
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuffer = Buffer.from(name, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const method = useDeflate ? 8 : 0;
    const checksum = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(zipDate, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuffer, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(zipDate, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuffer);

    offset += local.length + nameBuffer.length + body.length;
    if (offset > 0xffffffff) throw new Error('archive exceeds the 4 GiB zip limit');
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

function zipNames(file) {
  const buffer = fs.readFileSync(file);
  const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error(`not a zip archive: ${file}`);

  const total = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);
  const names = [];
  for (let i = 0; i < total; i += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`corrupt central directory in ${file}`);
    }
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    names.push(buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return names;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function main() {
  const { version, date } = readVersion();
  const files = [];
  walk(ROOT, '', files);
  files.sort();

  const variants = [{ id: 'full', lang: null }, ...LANGS.map((lang) => ({ id: lang.id, lang }))];
  const written = [];

  for (const variant of variants) {
    const entries = files
      .filter((rel) => includedFor(variant.lang, rel))
      .map((rel) => ({
        name: `${PACKAGE_DIR}/${rel}`,
        data: contentFor(variant.lang, rel, fs.readFileSync(path.join(ROOT, rel))),
      }));

    const zipPath = path.join(OUT_DIR, `${PACKAGE_DIR}-v${version}-${variant.id}.zip`);
    const archive = buildZip(entries, date);
    fs.writeFileSync(zipPath, archive);

    const expected = entries.map((entry) => entry.name).sort();
    const actual = zipNames(zipPath).sort();
    if (actual.length !== expected.length || actual.some((name, i) => name !== expected[i])) {
      throw new Error(`read-back verification failed for ${path.basename(zipPath)}`);
    }
    written.push({ zipPath, count: entries.length, bytes: archive.length });
  }

  console.log(`${PACKAGE_DIR} v${version} — verified against SKILL.md, 3 README badges and 3 CHANGELOGs`);
  console.log(`output: ${OUT_DIR}`);
  for (const item of written) {
    console.log(`  ${path.basename(item.zipPath)}  ${item.count} files  ${formatBytes(item.bytes)}`);
  }
  console.log(`Each archive extracts to ${PACKAGE_DIR}/.`);
}

try {
  main();
} catch (error) {
  console.error(`release failed: ${error.message}`);
  process.exitCode = 1;
}
