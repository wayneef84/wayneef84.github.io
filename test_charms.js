const fs = require('fs');

const code = fs.readFileSync('wosky/js/data/charms-data.js', 'utf8');

let sandbox = {};
eval(code + '\n Object.assign(sandbox, { WOSKY_CHARMS_DATA });');
const DATA = sandbox.WOSKY_CHARMS_DATA;

console.log("Testing rangeHasUnverified:");
console.log("Lvl 1.1 to Lvl 11.0:", DATA.rangeHasUnverified(1, 1, 11, 0));
console.log("Lvl 1.1 to Lvl 16.4 (should bound to 11.0):", DATA.rangeHasUnverified(1, 1, 16, 4));

console.log("\nTesting calcRange:");
console.log("Lvl 1.0 to Lvl 11.0:", DATA.calcRange(1, 0, 11, 0));
console.log("Lvl 1.0 to Lvl 16.4 (should bound to 11.0):", DATA.calcRange(1, 0, 16, 4));

console.log("\nTesting calcRange boundaries:");
console.log("Lvl 11.0 to Lvl 11.0 (should be 0):", DATA.calcRange(11, 0, 11, 0));

console.log("\nTesting getPiecesByGroup:");
console.log(DATA.getPiecesByGroup().length);
