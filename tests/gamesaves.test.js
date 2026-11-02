// Unit tests for js/gamesaves.js. Run: node tests/gamesaves.test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var store = {}, writes = 0, blocked = false;
var win = {};
win.window = win;
var failKey = '';   // setItem throws for this key (a full or blocked store)
win.localStorage = {
    removeItem: function (k) { delete store[k]; },
    getItem: function (k) { if (blocked) { throw new Error('blocked'); } return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { if (blocked) { throw new Error('blocked'); } if (failKey && k === failKey) { throw new Error('full'); } writes++; store[k] = String(v); }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/gamesaves.js'), 'utf8'), { window: win, Date: Date });
var G = win.FongGameSaves;

assert(G.list().length>=2);assert(!G.list()[0].hasData);
store['nightlite.save']='{"v":1,"sparks":5}';store['nightlite.vol']='40';
var one=G.exportGame('nightlite-choir').text;
var all=G.exportAll().text;
assert.deepEqual(Object.keys(G.exportObject()),['nightlite-choir']);
store={};writes=0;
var r=G.importJSON(one,{dryRun:true});assert(r.ok&&writes===0&&r.games[0].keys===2);
r=G.importJSON(one,{mode:'merge'});assert(r.ok&&r.applied===2&&store['nightlite.vol']==='40');
store['nightlite.vol']='10';r=G.importJSON(one,{mode:'merge'});assert(!r.ok);assert(store['nightlite.vol']==='10');
r=G.importJSON(one,{mode:'replace'});assert(r.ok&&store['nightlite.vol']==='40');
store={};r=G.importJSON(all,{});assert(r.ok&&store['nightlite.save']);
r=G.importJSON(all,{only:['slots']});assert(!r.ok);
assert(!G.importJSON('nope').ok);
assert(!G.importJSON('{"format":"x","version":1}').ok);
var bad=JSON.stringify({format:'fong-game-save',version:1,game:'nightlite-choir',data:{'evil':'1','nightlite.save':'{bad','nightlite.vol':5}});
store={};r=G.importJSON(bad,{});assert(!r.ok&&Object.keys(store).length===0);
var mix=JSON.stringify({format:'fong-game-save',version:1,game:'nightlite-choir',data:{'evil':'1','nightlite.vol':'9'}});
r=G.importJSON(mix,{});assert(r.ok&&r.skipped===0&&!store.evil&&store['nightlite.vol']==='9');
var proto='{"format":"fong-game-save","version":1,"game":"nightlite-choir","data":{"__proto__":{"x":1}}}';
assert(!G.importJSON(proto).ok);
var protoIn=JSON.stringify({format:'fong-game-save',version:1,game:'nightlite-choir',data:{'nightlite.save':'{"__proto__":{"a":1}}'}});
assert(!G.importJSON(protoIn).ok);
assert(!G.importJSON(JSON.stringify({format:'fong-game-save',version:1,game:'unknown',data:{a:'b'}})).ok);
assert(!G.importJSON(new Array(600002).join('x')).ok);
G.register('zz',{name:'ZZ',keys:['a']});G.register('zz',{keys:['b']});assert.deepEqual(G.list().pop().keys,['a','b']);
blocked=true;
assert(G.list().every(function(x){return !x.hasData}));

// ---- review fixes: limits, warnings, rollback, replace keeps absent keys
blocked = false; failKey = '';
// export warns when a value or the file is over what import accepts
store = { 'nightlite.save': JSON.stringify({ pad: new Array(200002).join('x') }), 'nightlite.vol': '40' };
var big = G.exportGame('nightlite-choir');
assert(big.warnings.length >= 1 && /too big/.test(big.warnings[0]));
assert(G.exportWarnings().length >= 1);
assert(!G.importJSON(big.text, {}).ok || G.importJSON(big.text, {}).skipped >= 1);   // oversize value is skipped, as warned
assert.strictEqual(G.MAX_CHARS, 600000); assert.strictEqual(G.MAX_VALUE, 200000);
store = {}; assert.strictEqual(G.exportGame('nightlite-choir').warnings.length, 0);
var huge = {}; var hp = []; for (var hi = 0; hi < 4; hi++) { hp.push('sentences-saved'); }
store = { 'sentences-saved': JSON.stringify(['a']) };
var okExp = G.exportAll(); assert.strictEqual(okExp.warnings.length, 0);

// replace keeps keys that are absent from the file
store = { 'nightlite.save': '{"v":1}', 'nightlite.mix': '{"keep":1}', 'nightlite.vol': '10' };
var partial = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'nightlite-choir', data: { 'nightlite.vol': '77' } });
r = G.importJSON(partial, { mode: 'replace' });
assert(r.ok && store['nightlite.vol'] === '77' && store['nightlite.mix'] === '{"keep":1}' && store['nightlite.save'] === '{"v":1}');

// failed write rolls everything back and applies nothing
store = { 'nightlite.vol': '10' };
var two = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'nightlite-choir', data: { 'nightlite.vol': '55', 'nightlite.save': '{"v":2}', 'nightlite.mix': '{"m":1}' } });
writes = 0; failKey = 'nightlite.mix';
r = G.importJSON(two, { mode: 'replace' });
assert(!r.ok && r.applied === 0 && r.errors.length === 1 && /Nothing was changed/.test(r.errors[0]));
assert.deepStrictEqual(Object.keys(store), ['nightlite.vol']); assert.strictEqual(store['nightlite.vol'], '10');
failKey = '';

// failure across two games rolls back both
store = { 'sudoku_autosave': '{"old":1}' };
var multi = JSON.stringify({ format: 'fong-game-saves', version: 1, games: { 'nightlite-choir': { name: 'N', data: { 'nightlite.vol': '1' } }, 'sudoku': { name: 'S', data: { 'sudoku_autosave': '{"new":1}' } } } });
writes = 0; failKey = 'sudoku_autosave';
r = G.importJSON(multi, { mode: 'replace' });
assert(!r.ok && !store['nightlite.vol'] && store['sudoku_autosave'] === '{"old":1}');
failKey = '';

// merge with everything present says so (alreadyHave), not a bare nothing
store = { 'nightlite.vol': '10' };
var vOnly = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'nightlite-choir', data: { 'nightlite.vol': '99' } });
r = G.importJSON(vOnly, { mode: 'merge' });
assert(!r.ok && r.alreadyHave === true && /already have saves/.test(r.errors[0]) && store['nightlite.vol'] === '10');

// dry run in replace and merge agree with what apply then does
store = { 'nightlite.vol': '10' };
var d1 = G.importJSON(vOnly, { mode: 'replace', dryRun: true }), d2 = G.importJSON(vOnly, { mode: 'replace' });
assert(d1.ok && d2.ok && d1.games[0].keys === d2.games[0].keys && d2.applied === 1);

// card-utils escapeHTML (shared by War history)
var cuCtx = { window: {}, console: console };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../games/cards/shared/card-utils.js'), 'utf8') + '\nthis.CU = CardUtils;', cuCtx);
assert.strictEqual(cuCtx.CU.escapeHTML('<img src=x onerror=alert(1)>&"\''), '&lt;img src=x onerror=alert(1)&gt;&amp;&quot;&#39;');
assert(cuCtx.CU.renderCardHTML({ suit: 'HEARTS', rank: '<b>' }).indexOf('<b>') < 0);
console.log('gamesaves tests passed');
