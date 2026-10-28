/* Memory Match - card sets. ES5. Each item: { id, name, html } where html is shown on the card face. */
var MMCards = (function () {
    'use strict';

    var emoji = [
        ['dog', 'dog', '🐶'], ['cat', 'cat', '🐱'], ['frog', 'frog', '🐸'],
        ['monkey', 'monkey', '🐵'], ['panda', 'panda', '🐼'], ['rabbit', 'rabbit', '🐰'],
        ['fox', 'fox', '🦊'], ['pig', 'pig', '🐷'], ['cow', 'cow', '🐮'],
        ['apple', 'apple', '🍎'], ['banana', 'banana', '🍌'], ['strawberry', 'strawberry', '🍓'],
        ['grapes', 'grapes', '🍇'], ['watermelon', 'watermelon', '🍉'], ['orange', 'orange', '🍊'],
        ['car', 'car', '🚗'], ['bus', 'bus', '🚌'], ['tractor', 'tractor', '🚜'],
        ['train', 'train', '🚂'], ['bicycle', 'bicycle', '🚲'], ['boat', 'sailboat', '⛵']
    ];

    function build(rows) {
        var out = [], i;
        for (i = 0; i < rows.length; i++) { out.push({ id: rows[i][0], name: rows[i][1], html: rows[i][2] }); }
        return out;
    }

    var sets = {
        emoji: { label: 'Emoji', hint: 'animals, fruit, vehicles', items: build(emoji) }
    };

    return { sets: sets, order: ['emoji', 'animals'] };
}());
