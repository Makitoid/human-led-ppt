#!/usr/bin/env node
/* human-led-ppt skill · assembler
 * Inlines deck-shell.css / deck-shell.js into a template that still holds the two
 * shell placeholders (the SHELL_CSS and SHELL_JS tokens, wrapped in comment
 * delimiters), then writes the final deck file.
 *
 * Usage:
 *   node assemble.cjs <in.html> <out.html> [--css <file>] [--js <file>]
 *                                  [--ink [file]] [--presenter [file]]
 *
 * Defaults for --css/--js/--ink/--presenter are this script's own directory, so
 *   node assets/assemble.cjs deck.src.html deck.html --presenter
 * works without extra flags. Replacement is global, so a token may appear more
 * than once. Output is one short line; failures exit non-zero.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const CSS_TOKEN = '/*__SHELL_CSS__*/';
const JS_TOKEN = '/*__SHELL_JS__*/';

function fail(msg) { process.stdout.write('assemble: FAIL — ' + msg + '\n'); process.exit(1); }

const argv = process.argv.slice(2);
const flags = {};
const args = [];
/* --ink / --presenter may be written bare; the bundled overlay in this script's own
   directory is then used, instead of silently swallowing the next flag and building
   a deck with no overlay at all. */
const OVERLAY_DEFAULT = {
  ink: 'ink-overlay.html',
  presenter: 'presenter-overlay.html',
};
const FLAGGED = ['--css', '--js', '--ink', '--presenter'];
for (let i = 0; i < argv.length; i++) {
  const token = argv[i];
  if (token === '-h' || token === '--help') {
    process.stdout.write('usage: node assemble.cjs <in.html> <out.html> [--css <file>] [--js <file>]\n'
      + '                       [--ink [file]] [--presenter [file]]\n'
      + '       --ink        appends the screen-annotation overlay (assets/ink-overlay.html) before </body>\n'
      + '       --presenter  appends the presenter-mode overlay (assets/presenter-overlay.html) before </body>\n'
      + '       both may be combined; --ink lands first, so the presenter block runs last\n'
      + '       each flag may be written bare — the bundled file next to this script is used\n');
    process.exit(0);
  }
  if (FLAGGED.includes(token)) {
    const name = token.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { flags[name] = next; i++; }
    else if (OVERLAY_DEFAULT[name] !== undefined) flags[name] = path.join(__dirname, OVERLAY_DEFAULT[name]);
    continue;
  }
  args.push(token);
}

const ORDER = ['ink', 'presenter'];
const [inPath, outPath] = args;
if (!inPath || !outPath) fail('need <in.html> and <out.html> (see --help)');

const here = __dirname;
const cssPath = flags.css || path.join(here, 'deck-shell.css');
const jsPath = flags.js || path.join(here, 'deck-shell.js');

let html, css, js;
try { html = fs.readFileSync(inPath, 'utf8'); } catch (e) { fail('cannot read ' + inPath); }
try { css = fs.readFileSync(cssPath, 'utf8'); } catch (e) { fail('cannot read ' + cssPath); }
try { js = fs.readFileSync(jsPath, 'utf8'); } catch (e) { fail('cannot read ' + jsPath); }

const hadCss = html.includes(CSS_TOKEN);
const hadJs = html.includes(JS_TOKEN);
if (!hadCss && !hadJs) fail('no shell placeholders found in ' + inPath + ' — already assembled?');

html = html.split(CSS_TOKEN).join(css).split(JS_TOKEN).join(js);

/* Optional overlays: appended verbatim before </body> so the deck's own markup, CSS
   and shell stay untouched. slice/join, never replace() — an overlay contains $
   sequences that replace() would reinterpret. Order is fixed: --ink, then --presenter. */
for (const name of ORDER) {
  if (!flags[name]) continue;
  let block;
  try { block = fs.readFileSync(flags[name], 'utf8'); } catch (e) { fail('cannot read --' + name + ' file ' + flags[name]); }
  const at = html.lastIndexOf('</body>');
  if (at < 0) fail('no </body> found — cannot append --' + name + ' overlay');
  html = html.slice(0, at) + '\n' + block + '\n' + html.slice(at);
}

const left = (html.match(/__SHELL_(CSS|JS)__/g) || []).length;
if (left) fail(left + ' placeholder(s) still present after replacement');

fs.writeFileSync(outPath, html);
process.stdout.write('assemble: OK — ' + path.basename(outPath) + ' (' + html.length + ' bytes)'
  + (hadCss ? '' : ' [css token absent]') + (hadJs ? '' : ' [js token absent]') + '\n');
