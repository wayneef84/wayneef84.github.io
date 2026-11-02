// Unit tests for js/gamesaves.js. Run: node tests/gamesaves.test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var store = {}, writes = 0, blocked = false;
var win = {};
win.window = win;
win.localStorage = {
    getItem: function (k) { if (blocked) { throw new Error('blocked'); } return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { if (blocked) { throw new Error('blocked'); } writes++; store[k] = String(v); }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/gamesaves.js'), 'utf8'), { window: win, Date: Date });
var G = win.FongGameSaves;

assert(G.list().length>=2);assert(!G.list()[0].hasData);
store['nightlite.save']='{"v":1,"sparks":5}';store['nightlite.vol']='40';
var one=G.exportGame('nightlite-choir');
var all=G.exportAll();
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
r=G.importJSON(mix,{});assert(r.ok&&r.skipped===1&&!store.evil&&store['nightlite.vol']==='9');
var proto='{"format":"fong-game-save","version":1,"game":"nightlite-choir","data":{"__proto__":{"x":1}}}';
assert(!G.importJSON(proto).ok);
var protoIn=JSON.stringify({format:'fong-game-save',version:1,game:'nightlite-choir',data:{'nightlite.save':'{"__proto__":{"a":1}}'}});
assert(!G.importJSON(protoIn).ok);
assert(!G.importJSON(JSON.stringify({format:'fong-game-save',version:1,game:'unknown',data:{a:'b'}})).ok);
assert(!G.importJSON(new Array(600002).join('x')).ok);
G.register('zz',{name:'ZZ',keys:['a']});G.register('zz',{keys:['b']});assert.deepEqual(G.list().pop().keys,['a','b']);
blocked=true;
assert(G.list().every(function(x){return !x.hasData}));
console.log('gamesaves tests passed');
