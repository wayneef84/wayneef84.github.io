// Site check: validates js/catalog.js, JS syntax and local links.
// Usage: node scripts/check-site.mjs   (run from the repo root, no dependencies)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.log(`::error::${m}`); };
const warn = (m) => { warnings++; console.log(`::warning::${m}`); };
const exists = (p) => fs.existsSync(path.join(root, p));

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

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
