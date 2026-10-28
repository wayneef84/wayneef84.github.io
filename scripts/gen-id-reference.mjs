// Generates docs/CUSTOMIZE_IDS.md (every catalog id, title and group) from js/catalog.js.
// Usage (from the repo root):
//   node scripts/gen-id-reference.mjs           write docs/CUSTOMIZE_IDS.md
//   node scripts/gen-id-reference.mjs --check   exit 1 if the file is out of date
// scripts/check-site.mjs calls buildReference() and only WARNS when the file is stale.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const OUT = 'docs/CUSTOMIZE_IDS.md';
const GROUP_NAMES = { games: 'Games', tools: 'Tools', wos: 'Whiteout Survival', more: 'More' };
const HUB_CARDS = [
  ['hub-arcade', 'Arcade'], ['hub-cards', 'Card Games'], ['hub-puzzle', 'Puzzle'], ['hub-edu', 'Educational'],
  ['hub-games-all', 'All games'], ['hub-projects', 'Projects & Tools'], ['hub-tools-all', 'All tools'],
  ['hub-wosky', 'WOSKY_3169'], ['hub-wos-all', 'All WOS tools'], ['hub-more', 'Guides, Labs and Archive'],
  ['hub-profile', 'Developer Profile']
];

export function buildReference(root) {
  const ctx = { window: {} };
  ctx.window = ctx;
  vm.createContext(ctx);
  // The catalog is a classic script (var FONG_CATALOG). hub-nav.js reads window.FONG_CATALOG.
  vm.runInContext(fs.readFileSync(path.join(root, 'js/catalog.js'), 'utf8') + '\n;this.FONG_CATALOG = FONG_CATALOG;', ctx, { filename: 'js/catalog.js' });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/hub-nav.js'), 'utf8'), ctx, { filename: 'js/hub-nav.js' });
  const nav = ctx.FONG_NAV;
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const lines = [
    '# Customize: id reference',
    '',
    'Generated from `js/catalog.js` by `scripts/gen-id-reference.mjs`. Do not edit by hand. Run `node scripts/gen-id-reference.mjs` after the catalog changes.',
    '',
    'Use these ids in a theme file (`groups[].items`, `pinned`, `hidden`, `labels`). See [CUSTOMIZE.md](CUSTOMIZE.md).',
    '',
    `Catalog entries: ${ctx.FONG_CATALOG.length}.`,
    ''
  ];
  for (const g of Object.keys(GROUP_NAMES)) {
    const items = ctx.FONG_CATALOG.filter((e) => nav.groupOf(e) === g);
    if (!items.length) continue;
    lines.push(`## ${GROUP_NAMES[g]} (${items.length})`, '', '| id | title | group |', '|---|---|---|');
    for (const e of items) lines.push(`| \`${esc(e.id)}\` | ${esc(e.title)} | ${g} |`);
    lines.push('');
  }
  lines.push('## Built-in cards on the homepage', '', 'These ids can be renamed (`labels`) or hidden (`hidden`). They cannot be put in a custom group.', '', '| id | title |', '|---|---|');
  for (const [id, title] of HUB_CARDS) lines.push(`| \`${id}\` | ${esc(title)} |`);
  lines.push('', '## Group ids', '', '`games`, `tools`, `wos`, `more` are the built-in groups and `pinned` is the favorites group. Custom group ids use `a-z`, `0-9` and `-` (1 to 24 characters) and cannot match an app id or start with `hub-`.', '');
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = process.cwd();
  const text = buildReference(root);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(path.join(root, OUT)) ? fs.readFileSync(path.join(root, OUT), 'utf8') : '';
    if (cur !== text) { console.log(`${OUT} is out of date. Run: node scripts/gen-id-reference.mjs`); process.exit(1); }
    console.log(`${OUT} is up to date`);
  } else {
    fs.writeFileSync(path.join(root, OUT), text);
    console.log(`Wrote ${OUT}`);
  }
}
