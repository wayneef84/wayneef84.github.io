// Site check: validates js/catalog.js, JS syntax, local links, ES5 rules, absolute paths,
// external CDNs and the 7 required docs per game or project folder.
// Usage (run from the repo root, no dependencies):
//   node scripts/check-site.mjs                    run the check (exit 1 on NEW violations)
//   node scripts/check-site.mjs --update-baseline  regenerate scripts/check-baseline.json (deliberate only)
//   node scripts/check-site.mjs --selftest         prove every rule catches its violation
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const BASELINE_FILE = 'scripts/check-baseline.json';
const DOCS = ['README', 'ARCHITECTURE', 'INFO', 'TODO', 'CHANGELOG', 'CLAUDE', 'AGENT'];
const DOC_PARENTS = ['games', 'projects'];
// JS is skipped in these folders (frozen legacy, history, docs, vendored). HTML scans skip only the first three.
const SKIP_ALL = ['node_modules', '.git', 'archive'];
const SKIP_JS = ['negen', 'docs', 'test-results'];

const RULES = {
  'es5-const': 'const is not allowed, use var',
  'es5-let': 'let is not allowed, use var',
  'es5-arrow': 'arrow function is not allowed, use function(){}',
  'es5-class': 'class is not allowed, use a constructor function and prototype',
  'es5-template': 'template literal is not allowed, use string concatenation',
  'es5-module': 'import/export is not allowed, use classic scripts and window globals',
  'abs-path': 'absolute path is not allowed, use a relative path (./ or ../)',
  'external-cdn': 'external script or stylesheet is not allowed, vendor it locally',
  'missing-doc': 'required doc is missing, copy it from admin/DOC_TEMPLATES/'
};

// ---------- JS lexer: blank out comments, strings, regexes and template bodies ----------
const REGEX_PREV_WORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'instanceof']);
export function stripJs(src) {
  const out = src.split('');
  const templates = [];
  const starts = [0];
  for (let k = 0; k < src.length; k++) if (src.charCodeAt(k) === 10) starts.push(k + 1);
  const line = (i) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= i) lo = mid; else hi = mid - 1; } return lo + 1; };
  const blank = (a, b) => { for (let k = a; k < b; k++) if (src[k] !== '\n') out[k] = ' '; };
  let i = 0, lastSig = '', lastWord = '';
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const end = e < 0 ? n : e; blank(i, end); i = end; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; blank(i, end); i = end; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      blank(i + 1, Math.min(j, n)); i = j + 1; lastSig = '"'; lastWord = ''; continue;
    }
    if (c === '`') {
      templates.push(line(i));
      let j = i + 1, depth = 0;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (depth === 0 && src[j] === '`') break;
        if (src[j] === '$' && src[j + 1] === '{') { depth++; j += 2; continue; }
        if (depth > 0 && src[j] === '{') depth++;
        if (depth > 0 && src[j] === '}') depth--;
        j++;
      }
      blank(i + 1, Math.min(j, n)); i = j + 1; lastSig = '"'; lastWord = ''; continue;
    }
    if (c === '/') {
      const regexOk = lastSig === '' || '(,=:[!&|?{};+-*%<>~^'.includes(lastSig) || (lastWord && REGEX_PREV_WORDS.has(lastWord));
      if (regexOk) {
        let j = i + 1, inClass = false;
        while (j < n && src[j] !== '\n') {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '[') inClass = true;
          else if (src[j] === ']') inClass = false;
          else if (src[j] === '/' && !inClass) break;
          j++;
        }
        blank(i + 1, Math.min(j, n)); i = j + 1; lastSig = '"'; lastWord = ''; continue;
      }
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i; while (j < n && /[\w$]/.test(src[j])) j++;
      lastWord = src.slice(i, j); lastSig = 'a'; i = j; continue;
    }
    if (!/\s/.test(c)) { lastSig = c; lastWord = ''; }
    i++;
  }
  return { code: out.join(''), templates };
}

const ES5_PATTERNS = [
  ['es5-const', /(?<![.\w$])const\s+[A-Za-z_$\[{]/g],
  ['es5-let', /(?<![.\w$])let\s+[A-Za-z_$\[{]/g],
  ['es5-arrow', /=>/g],
  ['es5-class', /(?<![.\w$])class\s+[A-Za-z_$]/g],
  ['es5-module', /^[ \t]*(?:import\s*(?:[\w${*"']|\()|export\s+(?:default|const|let|var|function|class|async|\{|\*))/gm]
];
export function es5Violations(src) {
  const { code, templates } = stripJs(src);
  const res = [];
  const starts = [0];
  for (let k = 0; k < code.length; k++) if (code.charCodeAt(k) === 10) starts.push(k + 1);
  const line = (i) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= i) lo = mid; else hi = mid - 1; } return lo + 1; };
  for (const [rule, re] of ES5_PATTERNS) for (const m of code.matchAll(re)) res.push({ rule, line: line(m.index) });
  for (const l of templates) res.push({ rule: 'es5-template', line: l });
  return res;
}

// ---------- HTML checks ----------
export function htmlViolations(html) {
  // blank comments but keep line numbers
  const clean = html.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
  const starts = [0];
  for (let k = 0; k < clean.length; k++) if (clean.charCodeAt(k) === 10) starts.push(k + 1);
  const line = (i) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= i) lo = mid; else hi = mid - 1; } return lo + 1; };
  const res = [];
  for (const m of clean.matchAll(/\b(?:href|src)\s*=\s*["']\/(?!\/)/gi)) res.push({ rule: 'abs-path', line: line(m.index) });
  const attr = (tag, name) => { const a = tag.match(new RegExp('\\b' + name + '\\s*=\\s*["\']([^"\']*)["\']', 'i')); return a ? a[1] : ''; };
  const external = (u) => /^(?:https?:)?\/\//i.test(u.trim());
  for (const m of clean.matchAll(/<script\b[^>]*>/gi)) if (external(attr(m[0], 'src'))) res.push({ rule: 'external-cdn', line: line(m.index) });
  for (const m of clean.matchAll(/<link\b[^>]*>/gi)) {
    if (/stylesheet/i.test(attr(m[0], 'rel')) && external(attr(m[0], 'href'))) res.push({ rule: 'external-cdn', line: line(m.index) });
  }
  return res;
}

// ---------- tree scan ----------
function walkFiles(rootDir, skip) {
  const files = [];
  const rec = (rel) => {
    for (const e of fs.readdirSync(path.join(rootDir, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { if (!skip.includes(e.name)) rec(r); }
      else if (e.isFile()) files.push(r);
    }
  };
  rec('');
  return files;
}
export function scanTree(rootDir) {
  const found = [];
  for (const f of walkFiles(rootDir, SKIP_ALL.concat(SKIP_JS))) {
    if (!f.endsWith('.js')) continue;
    for (const v of es5Violations(fs.readFileSync(path.join(rootDir, f), 'utf8'))) found.push({ file: f, ...v });
  }
  for (const f of walkFiles(rootDir, SKIP_ALL)) {
    if (!f.endsWith('.html')) continue;
    for (const v of htmlViolations(fs.readFileSync(path.join(rootDir, f), 'utf8'))) found.push({ file: f, ...v });
  }
  for (const parent of DOC_PARENTS) {
    const pdir = path.join(rootDir, parent);
    if (!fs.existsSync(pdir)) continue;
    for (const e of fs.readdirSync(pdir, { withFileTypes: true })) {
      if (!e.isDirectory() || !fs.existsSync(path.join(pdir, e.name, 'index.html'))) continue;
      for (const doc of DOCS) {
        const rel = `${parent}/${e.name}/${doc}.md`;
        if (!fs.existsSync(path.join(rootDir, rel))) found.push({ file: rel, rule: 'missing-doc', line: 0 });
      }
    }
  }
  return found;
}

// ---------- baseline comparison ----------
const keyOf = (f, r) => f + '\u0000' + r;
export function group(found) {
  const g = new Map();
  for (const v of found) { const k = keyOf(v.file, v.rule); if (!g.has(k)) g.set(k, []); g.get(k).push(v); }
  return g;
}
export function compare(found, baselineEntries) {
  const base = new Map(baselineEntries.map((b) => [keyOf(b.file, b.rule), b.count]));
  const fresh = [];
  const covered = {};
  const seen = new Set();
  for (const [k, list] of group(found)) {
    seen.add(k);
    const allowed = base.get(k) || 0;
    const excess = list.length - allowed;
    const ok = Math.min(list.length, allowed);
    if (ok) covered[list[0].rule] = (covered[list[0].rule] || 0) + ok;
    if (excess > 0) for (const v of list.slice(list.length - excess)) fresh.push({ ...v, extra: allowed > 0 ? `${excess} more than baseline (${allowed})` : '' });
  }
  let fixed = 0;
  for (const [k, c] of base) { const now = (group(found).get(k) || []).length; if (now < c) fixed += c - now; }
  return { fresh, covered, fixed };
}
const toBaseline = (found) => {
  const entries = [...group(found)].map(([k, list]) => ({ file: list[0].file, rule: list[0].rule, count: list.length }));
  entries.sort((a, b) => (a.file + a.rule < b.file + b.rule ? -1 : 1));
  return { _note: 'Known old violations. Generated by: node scripts/check-site.mjs --update-baseline. Do not edit by hand and do not regenerate to hide new violations. Fix them instead.', entries };
};

// ---------- self-test ----------
function selftest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-site-fixture-'));
  const w = (rel, txt) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), txt); };
  let failed = 0;
  const assert = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failed++; };
  const allDocs = () => DOCS.forEach((d) => w(`games/okgame/${d}.md`, '# x'));
  allDocs();
  w('games/okgame/index.html', '<html><head><link rel="stylesheet" href="css/a.css"><script src="js/a.js"></script></head><body><a href="https://example.com/page">ok</a></body></html>');
  w('games/okgame/js/clean.js', "var a = 'const x = 1; let y; => class Z `t`';\n// const c = () => 1;\n/* class Q {} */\nvar re = /`|=>/g;\nvar f = function () { return a.class + a.const; };\nvar o = { 'let': 1, 'class': 2 };\nvar n = 4 / 2 / 1;\n");
  w('games/okgame/js/bad_const.js', 'const a = 1;\n');
  w('games/okgame/js/bad_let.js', 'let a = 1;\n');
  w('games/okgame/js/bad_arrow.js', 'var f = (x) => x;\n');
  w('games/okgame/js/bad_class.js', 'class Foo {}\n');
  w('games/okgame/js/bad_template.js', 'var s = `hi ${1}`;\n');
  w('games/okgame/js/bad_import.js', "import x from './x.js';\n");
  w('games/okgame/js/bad_export.js', 'export function f() {}\n');
  w('negen/modern.js', 'const a = () => `x`;\nexport default a;\n');
  w('archive/old.js', 'const a = 1;\n');
  w('docs/old.js', 'const a = 1;\n');
  w('games/okgame/abs.html', '<img src="/img/a.png"><a href="/games/x/">x</a>');
  w('games/okgame/cdn.html', '<script src="https://cdn.example.com/lib.js"></script>\n<script src="//cdn.example.com/lib2.js"></script>\n<link rel="stylesheet" href="https://fonts.example.com/a.css">');
  w('games/newgame/index.html', '<html></html>');
  w('games/newgame/README.md', '# x');
  const found = scanTree(dir);
  const has = (file, rule, n) => found.filter((v) => v.file === file && v.rule === rule).length === (n === undefined ? 1 : n);
  assert(has('games/okgame/js/bad_const.js', 'es5-const'), 'const caught');
  assert(has('games/okgame/js/bad_let.js', 'es5-let'), 'let caught');
  assert(has('games/okgame/js/bad_arrow.js', 'es5-arrow'), 'arrow function caught');
  assert(has('games/okgame/js/bad_class.js', 'es5-class'), 'class caught');
  assert(has('games/okgame/js/bad_template.js', 'es5-template'), 'template literal caught');
  assert(has('games/okgame/js/bad_import.js', 'es5-module'), 'import caught');
  assert(has('games/okgame/js/bad_export.js', 'es5-module'), 'export caught');
  assert(!found.some((v) => v.file === 'games/okgame/js/clean.js'), 'clean ES5 file (with tricky strings and comments) not flagged');
  assert(!found.some((v) => /^(negen|archive|docs)\//.test(v.file)), 'negen, archive and docs exempt from ES5');
  assert(has('games/okgame/abs.html', 'abs-path', 2), 'absolute href and src caught');
  assert(has('games/okgame/cdn.html', 'external-cdn', 3), 'https script, protocol-relative script and https stylesheet caught');
  assert(!found.some((v) => v.file === 'games/okgame/index.html'), 'clean html (https page link, relative css/js) not flagged');
  assert(!found.some((v) => v.file.startsWith('games/okgame/') && v.rule === 'missing-doc'), 'folder with all 7 docs not flagged');
  assert(found.filter((v) => v.rule === 'missing-doc' && v.file.startsWith('games/newgame/')).length === 6, 'missing 6 of 7 docs caught');
  // baseline behaviour
  const base = toBaseline(found).entries;
  assert(compare(found, base).fresh.length === 0, 'tree equal to its own baseline passes');
  w('games/okgame/js/bad_const.js', 'const a = 1;\nconst b = 2;\n');
  let r = compare(scanTree(dir), base);
  assert(r.fresh.length === 1 && r.fresh[0].rule === 'es5-const' && r.fresh[0].line === 2, 'baselined file adding a second const fails');
  w('games/okgame/js/bad_const.js', 'const a = 1;\nlet b = 2;\n');
  r = compare(scanTree(dir), base);
  assert(r.fresh.some((v) => v.rule === 'es5-let'), 'baselined file adding a different rule fails');
  w('games/okgame/js/bad_const.js', 'const a = 1;\n');
  w('games/brandnew/index.html', '<html></html>');
  r = compare(scanTree(dir), base);
  assert(r.fresh.length === 7 && r.fresh.every((v) => v.rule === 'missing-doc'), 'brand-new folder without docs fails (7 errors)');
  w('games/okgame/js/new_bad.js', 'var f = () => 1;\n');
  r = compare(scanTree(dir), base);
  assert(r.fresh.some((v) => v.file === 'games/okgame/js/new_bad.js'), 'new file with violation fails');
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(failed ? `\nSelf-test FAILED (${failed})` : '\nSelf-test passed');
  process.exit(failed ? 1 : 0);
}

const args = process.argv.slice(2);
if (args.includes('--selftest')) selftest();

const root = process.cwd();
let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.log(`::error::${m}`); };
const warn = (m) => { warnings++; console.log(`::warning::${m}`); };
const exists = (p) => fs.existsSync(path.join(root, p));

if (args.includes('--update-baseline')) {
  const found = scanTree(root);
  fs.writeFileSync(path.join(root, BASELINE_FILE), JSON.stringify(toBaseline(found), null, 1) + '\n');
  const c = {}; for (const v of found) c[v.rule] = (c[v.rule] || 0) + 1;
  console.log(`Baseline written to ${BASELINE_FILE}`);
  for (const r of Object.keys(RULES)) console.log(`  ${r}: ${c[r] || 0}`);
  console.log('Only do this on purpose (for example after fixing old code). Never regenerate it to get a new violation past the check.');
  process.exit(0);
}

function legacy() {
  // 1. Catalog
  const catPath = 'js/catalog.js';
  let catalog = [];
  try {
    const src = fs.readFileSync(path.join(root, catPath), 'utf8');
    catalog = vm.runInNewContext(src + '\n;FONG_CATALOG', {}, { filename: catPath });
  } catch (e) {
    err(`${catPath} could not be loaded: ${e.message}`);
  }
  const ids = new Set();
  for (const [i, g] of catalog.entries()) {
    const tag = `catalog entry ${i + 1} (${g.id || 'no id'})`;
    for (const f of ['id', 'category', 'title', 'description', 'href']) {
      if (!g[f]) err(`${tag}: missing "${f}"`);
    }
    if (g.id && ids.has(g.id)) err(`${tag}: duplicate id`);
    ids.add(g.id);
    if (g.href && !/^https?:/.test(g.href)) {
      let t = g.href.split(/[?#]/)[0].replace(/^\.\//, '');
      if (t === '' || t.endsWith('/')) t += 'index.html';
      if (exists(t) && fs.statSync(path.join(root, t)).isDirectory()) t = path.join(t, 'index.html');
      if (!exists(t)) err(`${tag}: href "${g.href}" does not exist`);
    }
  }
  console.log(`Catalog: ${catalog.length} entries checked`);

  // 2. JS syntax for js/*.js and each games/*/js/*.js
  const jsFiles = [];
  const walk = (dir, depth) => {
    if (!exists(dir)) return;
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory() && depth < 3 && !['node_modules', '.git', 'archive'].includes(e.name)) walk(rel, depth + 1);
      else if (e.isFile() && e.name.endsWith('.js')) jsFiles.push(rel);
    }
  };
  walk('js', 0);
  walk('games', 0);
  for (const f of jsFiles) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    if (/^\s*(import|export)\s/m.test(src)) continue; // ES modules: skip classic-script check
    try { new vm.Script(src, { filename: f }); } catch (e) { err(`${f}: syntax error: ${e.message}`); }
  }
  console.log(`JS syntax: ${jsFiles.length} files scanned`);

  // 3. Local links in changed pages: every games/*/index.html and the homepage
  const pages = ['index.html'];
  if (exists('games')) {
    for (const d of fs.readdirSync(path.join(root, 'games'), { withFileTypes: true })) {
      if (d.isDirectory() && exists(`games/${d.name}/index.html`)) pages.push(`games/${d.name}/index.html`);
    }
  }
  const linkRe = /(?:href|src)\s*=\s*["']([^"'#]+?)["']/gi;
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    for (const m of html.matchAll(linkRe)) {
      const url = m[1].split('?')[0];
      if (/^(https?:|\/\/|mailto:|tel:|data:|javascript:|blob:)/i.test(url) || url.includes('${')) continue;
      const target = url.startsWith('/') ? url.slice(1) : path.join(path.dirname(page), url);
      if (!exists(target)) warn(`${page}: link "${url}" not found`);
    }
  }
  console.log(`Links: ${pages.length} pages scanned`);

}
legacy();

// 4. Rules: ES5, absolute paths, CDNs, required docs (new violations fail, baseline ones are counted)
{
  let baselineEntries = [];
  try { baselineEntries = JSON.parse(fs.readFileSync(path.join(root, BASELINE_FILE), 'utf8')).entries || []; }
  catch (e) { err(`${BASELINE_FILE} could not be read: ${e.message}. Restore it from dev.`); }
  const found = scanTree(root);
  const { fresh, covered, fixed } = compare(found, baselineEntries);
  for (const v of fresh) {
    const msg = `${RULES[v.rule]}${v.extra ? ' [' + v.extra + ']' : ''}`;
    errors++;
    console.log(`::error file=${v.file}${v.line ? ',line=' + v.line : ''},title=${v.rule}::${msg}`);
  }
  console.log(`Rules: ${found.length} violations found, ${fresh.length} new`);
  for (const r of Object.keys(RULES)) if (covered[r]) console.log(`  baseline: ${r} ${covered[r]} known old violation(s), not blocking`);
  if (fixed) console.log(`  ${fixed} baseline violation(s) are now fixed. A maintainer can lock that in with --update-baseline.`);
  if (fresh.length) {
    console.log('\nNEW violations found (listed above as errors). Fix them in your code. Do NOT run --update-baseline to make this pass.');
    console.log('The baseline only holds old code. See "How the check works" in docs/INDEX.md.');
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
