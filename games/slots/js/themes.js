/**
 * Slots themes. One object per theme, data only. See DESIGN.md "Add a theme".
 *
 * Fields
 *   key      unique id, lowercase letters and digits. Never rename a shipped key (saves use it).
 *   name     shown in the picker
 *   group    one of GROUPS below (picker chip)
 *   kids     true if it is fine for the Kids chip
 *   flavour  one short line shown under the name
 *   pal      [background, background 2, accent, reel face, ink], hex colours
 *   sym      6 paying symbols, lowest to highest. Emoji or an inline "<svg ...>" string.
 *   wild     wild symbol (substitutes for the 6 paying symbols)
 *   scat     scatter symbol (3 or more start a bonus in the modes that have one)
 *   wildName, scatName  optional names for the paytable
 *
 * Payouts and odds do NOT live here. Every theme plays the same maths (js/engine.js),
 * so a theme can never change the return.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var GROUPS = ['Sweet', 'Nature', 'Fantasy', 'Fun', 'Adventure', 'Space & Tech', 'Classic'];
    var list = [];
    var byKey = {};

    function lum(hex) {
        var r = parseInt(hex.substr(1, 2), 16);
        var g = parseInt(hex.substr(3, 2), 16);
        var b = parseInt(hex.substr(5, 2), 16);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }

    /** Keep the accent bright enough to read dark ink text on top of it. */
    function lift(hex) {
        if (!/^#[0-9a-fA-F]{6}$/.test(hex)) { return '#ffd166'; }
        var out = hex;
        for (var i = 0; i < 6 && lum(out) < 0.5; i++) {
            var parts = [];
            for (var k = 0; k < 3; k++) {
                var v = parseInt(out.substr(1 + k * 2, 2), 16);
                v = Math.round(v + (255 - v) * 0.22);
                parts.push((v < 16 ? '0' : '') + v.toString(16));
            }
            out = '#' + parts.join('');
        }
        return out;
    }

    function add(t) {
        if (!t || !t.key || byKey[t.key]) { return; }
        if (!t.sym || t.sym.length !== 6 || !t.wild || !t.scat) { return; }
        var pal = t.pal || [];
        t.pal = [pal[0] || '#1a1a2e', pal[1] || '#2a2a50', lift(pal[2] || '#ffd166'), pal[3] || '#f6f6fb', pal[4] || '#1a1a2e'];
        if (GROUPS.indexOf(t.group) < 0) { t.group = 'Fun'; }
        t.kids = t.kids !== false;
        t.wildName = t.wildName || 'Wild';
        t.scatName = t.scatName || 'Scatter';
        byKey[t.key] = t;
        list.push(t);
    }

    /** The 8 glyphs of a theme in engine order: 6 tiers, wild, scatter. */
    function glyphs(t) { return t.sym.concat([t.wild, t.scat]); }

    S.themes = {
        GROUPS: GROUPS,
        list: list,
        byKey: byKey,
        add: add,
        glyphs: glyphs,
        get: function (key) { return byKey[key] || list[0]; },
        has: function (key) { return !!byKey[key]; }
    };

    var DATA = [
    { key: 'sugar', name: 'Sugar Counter', group: 'Sweet', kids: true, flavour: 'A sticky-sweet shop with a jar of everything.',
      pal: ['#4a1740', '#7d2a6a', '#ff7ac8', '#fff3fa', '#4a1040'],
      sym: ['🍬', '🍭', '🍫', '🍩', '🧁', '🎂'], wild: '🌈', scat: '🎁', wildName: 'Rainbow Swirl', scatName: 'Gift Box' },
    { key: 'bakery', name: 'Bakery Morning', group: 'Sweet', kids: true, flavour: 'Warm buns and a very early oven.',
      pal: ['#3d2410', '#6e4020', '#ffc46b', '#fff6e6', '#4a2c14'],
      sym: ['🥖', '🥐', '🥨', '🥯', '🍞', '🥧'], wild: '🍯', scat: '🔔', wildName: 'Honey Jar', scatName: 'Shop Bell' },
    { key: 'icecream', name: 'Ice-Cream Truck', group: 'Sweet', kids: true, flavour: 'Jingle jingle, here it comes.',
      pal: ['#0e3a5c', '#1c6fa0', '#ffe066', '#f2fbff', '#0f3550'],
      sym: ['🍦', '🍧', '🍨', '🥤', '🍓', '🍒'], wild: '🚚', scat: '☀️', wildName: 'Truck', scatName: 'Hot Day' },
    { key: 'pizza', name: 'Pizza Night', group: 'Sweet', kids: true, flavour: 'Friday on the sofa, extra cheese.',
      pal: ['#40130f', '#7a2a1f', '#ffb347', '#fff5ea', '#4a1a12'],
      sym: ['🧀', '🍄', '🍅', '🌶️', '🥓', '🍕'], wild: '🔥', scat: '📦', wildName: 'Hot Oven', scatName: 'Pizza Box' },
    { key: 'coral', name: 'Coral Cove', group: 'Nature', kids: true, flavour: 'A sunny reef where the fish never stop chatting.',
      pal: ['#073a4a', '#0e6a80', '#5ef2e0', '#eefcfb', '#0a3f4a'],
      sym: ['🐟', '🐠', '🦀', '🐙', '🐢', '🐋'], wild: '🐚', scat: '🦪', wildName: 'Shell', scatName: 'Pearl Oyster' },
    { key: 'bugs', name: 'Garden Bugs', group: 'Nature', kids: true, flavour: 'Tiny neighbours with big plans.',
      pal: ['#16381a', '#2c6a30', '#b6f06a', '#f5fbe9', '#1d4a20'],
      sym: ['🐛', '🐌', '🐜', '🐞', '🐝', '🦋'], wild: '🌻', scat: '🍯', wildName: 'Sunflower', scatName: 'Honey Pot' },
    { key: 'toys', name: 'Toy Parade', group: 'Fun', kids: true, flavour: 'Wind-up friends marching through the playroom.',
      pal: ['#2b1a5c', '#4f32a8', '#ff9f43', '#f6f2ff', '#2b1a5c'],
      sym: ['🧸', '🎈', '🚂', '🥁', '🎠', '🪁'], wild: '🔑', scat: '🎀', wildName: 'Wind-up Key', scatName: 'Ribbon' },
    { key: 'skyships', name: 'Sky Buccaneers', group: 'Adventure', kids: true, flavour: 'Airships, parrots and one very polite cannon.',
      pal: ['#16305c', '#2f5fa8', '#ffd166', '#f1f6ff', '#16305c'],
      sym: ['🦜', '🧭', '🗺️', '⚓', '🔭', '🛩️'], wild: '☁️', scat: '💎', wildName: 'Cloud Hop', scatName: 'Sky Gem' },
    { key: 'rink', name: 'Ice Rink', group: 'Fun', kids: true, flavour: 'Smooth ice, warm scarves, cocoa after.',
      pal: ['#12305a', '#2a63a8', '#9be7ff', '#f1faff', '#12305a'],
      sym: ['⛸️', '🧣', '🧤', '☕', '🎿', '⛄'], wild: '❄️', scat: '🎶', wildName: 'Snowflake', scatName: 'Rink Music' },
    { key: 'drums', name: 'Jungle Drums', group: 'Nature', kids: true, flavour: 'Rain on big green leaves, beat by beat.',
      pal: ['#10361f', '#216a3a', '#ffcf40', '#f3fbea', '#143d22'],
      sym: ['🌴', '🍌', '🦜', '🐒', '🦁', '🐘'], wild: '🥁', scat: '🌺', wildName: 'Big Drum', scatName: 'Jungle Flower' },
    { key: 'puddles', name: 'Rainy-Day Puddles', group: 'Nature', kids: true, flavour: 'Boots on, umbrellas up, jump.',
      pal: ['#1d3550', '#3a6a96', '#ffd23f', '#f0f6fb', '#1d3550'],
      sym: ['☔', '🌂', '🐸', '🐌', '🦆', '🌈'], wild: '💧', scat: '🥾', wildName: 'Raindrop', scatName: 'Rain Boots' },
    { key: 'lava', name: 'Lava Lagoon', group: 'Nature', kids: true, flavour: 'A snoozing volcano and a very warm beach.',
      pal: ['#3d1608', '#7a3010', '#ff8a3d', '#fff4e8', '#4a1c0a'],
      sym: ['🥥', '🍍', '🦀', '🐢', '🌴', '🌋'], wild: '🔥', scat: '🏝️', wildName: 'Warm Glow', scatName: 'Island' },
    { key: 'moongarden', name: 'Moon Garden', group: 'Fantasy', kids: true, flavour: 'Flowers that only open when the stars come out.',
      pal: ['#141044', '#2c2a8a', '#c9b6ff', '#f4f1ff', '#1b1660'],
      sym: ['🌸', '🍄', '🦉', '🐇', '🌙', '⭐'], wild: '🌠', scat: '🌕', wildName: 'Shooting Star', scatName: 'Full Moon' },
    { key: 'castle', name: 'Fairy-Tale Castle', group: 'Fantasy', kids: true, flavour: 'Once upon a time, there was a drawbridge.',
      pal: ['#3a1450', '#6a2a8f', '#ffd6f2', '#fbf1ff', '#3a1450'],
      sym: ['📖', '🗝️', '🕯️', '👑', '🦄', '🏰'], wild: '🧚', scat: '🌹', wildName: 'Fairy', scatName: 'Rose' },
    { key: 'musicbox', name: 'Music Box Melody', group: 'Fantasy', kids: true, flavour: 'Wind it up and watch the dancer spin.',
      pal: ['#40202e', '#7a3f58', '#ffc2d6', '#fff2f6', '#4a2434'],
      sym: ['🎵', '🎶', '🔔', '🎻', '🎹', '💃'], wild: '🗝️', scat: '🎀', wildName: 'Winding Key', scatName: 'Ribbon' },
    { key: 'lanterns', name: 'Paper Lantern Night', group: 'Fantasy', kids: true, flavour: 'Glowing lanterns drift over the river.',
      pal: ['#3a0f14', '#7a1f2a', '#ffb347', '#fff3e6', '#4a141a'],
      sym: ['🥠', '🍵', '🎋', '🐟', '🎆', '🏮'], wild: '🌕', scat: '🎐', wildName: 'Bright Moon', scatName: 'Wind Chime' },
    { key: 'circus', name: 'Circus Night', group: 'Fun', kids: true, flavour: 'Step right up. Nobody falls.',
      pal: ['#4a0f2a', '#8a1f4f', '#ffd23f', '#fff5e0', '#4a0f2a'],
      sym: ['🍿', '🎈', '🎩', '🐘', '🤹', '🎪'], wild: '🌟', scat: '🎟️', wildName: 'Star Act', scatName: 'Big Top Ticket' },
    { key: 'workshop', name: 'Robot Workshop', group: 'Space & Tech', kids: true, flavour: 'Bolts, batteries and a very happy helper.',
      pal: ['#1f2b3a', '#3a5370', '#7be0ff', '#eef6fb', '#1f2b3a'],
      sym: ['🔩', '⚙️', '🔋', '🔧', '💡', '🤖'], wild: '⚡', scat: '🧰', wildName: 'Spark', scatName: 'Toolbox' },
    { key: 'picnic', name: 'Space Picnic', group: 'Space & Tech', kids: true, flavour: 'Sandwiches float. Napkins, less so.',
      pal: ['#0f1240', '#24297a', '#ff9ecb', '#f2f3ff', '#12154a'],
      sym: ['🥪', '🍎', '🧃', '🍪', '🌍', '🚀'], wild: '🧺', scat: '⭐', wildName: 'Picnic Basket', scatName: 'Bright Star' },
    { key: 'dinodig', name: 'Dino Dig Park', group: 'Nature', kids: true, flavour: 'Fossils, footprints and friendly giants.',
      pal: ['#2f3a14', '#5a7022', '#ffb84d', '#f7f8e8', '#37431a'],
      sym: ['🥚', '🌿', '🐾', '🦴', '🦕', '🦖'], wild: '☄️', scat: '🔍', wildName: 'Comet', scatName: 'Magnifier' },
    { key: 'pets', name: 'Pet Parade', group: 'Fun', kids: true, flavour: 'Everyone is dressed up. Even the goldfish.',
      pal: ['#3a1a46', '#6a3a80', '#ffb3d9', '#fcf2ff', '#3a1a46'],
      sym: ['🐟', '🐹', '🐰', '🐱', '🐶', '🦜'], wild: '🎀', scat: '🏅', wildName: 'Bow', scatName: 'Prize Ribbon' },
    { key: 'pajamas', name: 'Pajama Party', group: 'Fun', kids: true, flavour: 'Pillow forts and one more story.',
      pal: ['#241a5c', '#4a3a9a', '#ffd86b', '#f4f1ff', '#241a5c'],
      sym: ['🧦', '🍿', '📚', '🧸', '🛏️', '🌙'], wild: '⭐', scat: '🔦', wildName: 'Night Star', scatName: 'Flashlight' },
    { key: 'farm', name: 'Farmyard Fun', group: 'Nature', kids: true, flavour: 'Sunrise on the farm and everyone is up.',
      pal: ['#3d2a0c', '#7a5518', '#ffe27a', '#fff9e3', '#4a3410'],
      sym: ['🌽', '🥕', '🐔', '🐑', '🐄', '🚜'], wild: '🌾', scat: '🥚', wildName: 'Golden Hay', scatName: 'Egg Basket' },
    { key: 'beach', name: 'Beach Day', group: 'Nature', kids: true, flavour: 'Sand in the sandwiches. Totally worth it.',
      pal: ['#0b4a5e', '#1a8aa8', '#ffe27a', '#fffbea', '#0b4a5e'],
      sym: ['🍉', '🐚', '🦀', '🏄', '🏖️', '☀️'], wild: '🌊', scat: '🏐', wildName: 'Big Wave', scatName: 'Beach Ball' },
    { key: 'fantasy', name: 'Mystical Unicorn', group: 'Fantasy', kids: true, flavour: 'A sparkly meadow and a very proud unicorn.',
      pal: ['#191434', '#2e2460', '#C0C0C0', '#efedf7', '#1d163b'],
      sym: ['💎', '🔮', '🛡️', '⚔️', '👸', '🏰'], wild: '🦄', scat: '🌟' },
    { key: 'classic', name: 'Classic Fruits', group: 'Classic', kids: true, flavour: 'Cherries, lemons and a shiny bell.',
      pal: ['#341714', '#602a24', '#e74c3c', '#f7eeed', '#3b1a16'],
      sym: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎'], wild: '🃏', scat: '🎁' },
    { key: 'ocean', name: 'Ocean Adventure', group: 'Nature', kids: true, flavour: 'Dive in and meet the neighbours.',
      pal: ['#143434', '#246060', '#00ffff', '#edf7f7', '#163b3b'],
      sym: ['🐠', '🐙', '🐋', '🦈', '🐬', '🎁'], wild: '🌊', scat: '⚓' },
    { key: 'space', name: 'Space Explorer', group: 'Space & Tech', kids: true, flavour: 'Blast off past the ringed planet.',
      pal: ['#143414', '#246024', '#00ff00', '#edf7ed', '#163b16'],
      sym: ['👽', '🚀', '🪐', '🛸', '👨‍🚀', '🌌'], wild: '⭐', scat: '🌍' },
    { key: 'animals', name: 'Wild Animals', group: 'Nature', kids: true, flavour: 'A big day out at the wildlife park.',
      pal: ['#342314', '#604024', '#e67e22', '#f7f2ed', '#3b2816'],
      sym: ['🐵', '🐅', '🐘', '🦁', '🐼', '🐉'], wild: '🦊', scat: '🌿' },
    { key: 'food', name: 'Delicious Treats', group: 'Sweet', kids: true, flavour: 'Pizza, cake and ice cream. All of it.',
      pal: ['#341424', '#602442', '#ff69b4', '#f7edf2', '#3b1629'],
      sym: ['🍕', '🍔', '🍩', '🎂', '🍦', '🍭'], wild: '🍰', scat: '🎉' },
    { key: 'gems', name: 'Precious Gems', group: 'Classic', kids: true, flavour: 'Every colour of shiny you can think of.',
      pal: ['#2a1434', '#4f2460', '#8e44ad', '#f4edf7', '#30163b'],
      sym: ['❤️', '💚', '💙', '💜', '💛', '👑'], wild: '✨', scat: '💍' },
    { key: 'cards', name: 'Card Royale', group: 'Classic', kids: false, flavour: 'Card suits and royal faces.',
      pal: ['#341714', '#602a24', '#c0392b', '#f7eeed', '#3b1a16'],
      sym: ['♣️', '♦️', '♥️', '♠️', '👸', '🤴'], wild: '🃏', scat: '🎴' },
    { key: 'chess', name: 'Chess Masters', group: 'Classic', kids: false, flavour: 'Pawns, knights and a very tall king.',
      pal: ['#191434', '#2e2460', '#95a5a6', '#efedf7', '#1d163b'],
      sym: ['♟️', '♞', '♝', '♜', '♛', '♚'], wild: '🏆', scat: '⚔️' },
    { key: 'monsters', name: 'Monster Mayhem', group: 'Fantasy', kids: false, flavour: 'Friendly-ish ghosts and goofy monsters.',
      pal: ['#143421', '#24603e', '#2ecc71', '#edf7f1', '#163b26'],
      sym: ['👻', '👾', '👺', '👹', '🧟', '🧛'], wild: '🔮', scat: '⚡' },
    { key: 'wolves', name: 'Wolf Pack', group: 'Nature', kids: false, flavour: 'Moonlit pines and a howling pack.',
      pal: ['#142734', '#244860', '#3498db', '#edf3f7', '#162c3b'],
      sym: ['🐾', '🌙', '🌲', '🐺', '🏹', '🌕'], wild: '🔥', scat: '🌟' },
    { key: 'egypt', name: 'Ancient Egypt', group: 'Adventure', kids: false, flavour: 'Pyramids, scarabs and ancient scrolls.',
      pal: ['#342d14', '#605424', '#f1c40f', '#f7f5ed', '#3b3416'],
      sym: ['☥', '👁️', '😺', '🪲', '🧟', '🦁'], wild: '🧞', scat: '📜' },
    { key: 'music', name: 'Music Beats', group: 'Fun', kids: true, flavour: 'Guitars, keys and a loud little speaker.',
      pal: ['#34141f', '#602439', '#e91e63', '#f7edf1', '#3b1623'],
      sym: ['🎵', '🎼', '🎸', '🎹', '🎤', '🎧'], wild: '🔊', scat: '💿' },
    { key: 'sports', name: 'Sports Arena', group: 'Fun', kids: true, flavour: 'Balls, goals and a big shiny trophy.',
      pal: ['#143421', '#24603e', '#2ecc71', '#edf7f1', '#163b26'],
      sym: ['⚽', '🏀', '🏈', '🎾', '⚾', '🏆'], wild: '🏅', scat: '🎯' },
    { key: 'tech', name: 'Tech Gadgets', group: 'Space & Tech', kids: true, flavour: 'Phones, cameras and a helpful robot.',
      pal: ['#143433', '#24605f', '#00cec9', '#edf7f7', '#163b3a'],
      sym: ['📱', '💻', '📷', '🎮', '📺', '🤖'], wild: '⚡', scat: '🔌' },
    { key: 'camping', name: 'Wilderness Camp', group: 'Nature', kids: true, flavour: 'Tent, campfire and a long hike.',
      pal: ['#143421', '#24603e', '#27ae60', '#edf7f1', '#163b26'],
      sym: ['⛺', '🌲', '⛰️', '🔥', '🐟', '🎒'], wild: '🧭', scat: '🌟' },
    { key: 'astrology', name: 'Astrology Signs', group: 'Space & Tech', kids: false, flavour: 'Star signs and a crystal ball.',
      pal: ['#2a1434', '#4f2460', '#9b59b6', '#f4edf7', '#30163b'],
      sym: ['♈', '♉', '♊', '♋', '♌', '♍'], wild: '✨', scat: '🔮' },
    { key: 'weather', name: 'Weather Forecast', group: 'Nature', kids: true, flavour: 'Sun, rain, snow and a rainbow.',
      pal: ['#142734', '#244860', '#3498db', '#edf3f7', '#162c3b'],
      sym: ['☀️', '☁️', '🌧️', '⚡', '❄️', '🌈'], wild: '🌞', scat: '🌍' },
    { key: 'planets', name: 'Solar System', group: 'Space & Tech', kids: true, flavour: 'A tour of the solar system.',
      pal: ['#2a1434', '#4f2460', '#8e44ad', '#f4edf7', '#30163b'],
      sym: ['☿', '♀', '🌍', '♂', '♃', '♄'], wild: '☀️', scat: '⭐' },
    { key: 'emoticons', name: 'Emoji Faces', group: 'Fun', kids: true, flavour: 'Big faces, bigger feelings.',
      pal: ['#342d14', '#605424', '#f1c40f', '#f7f5ed', '#3b3416'],
      sym: ['😊', '😂', '😉', '😍', '😎', '😮'], wild: '🥳', scat: '🎭' },
    { key: 'pirates', name: 'Pirate\'s Gold', group: 'Adventure', kids: false, flavour: 'Treasure maps and a talking parrot.',
      pal: ['#341714', '#602a24', '#c0392b', '#f7eeed', '#3b1a16'],
      sym: ['⚓', '💣', '⚔️', '📜', '🦜', '🦴'], wild: '🏴‍☠️', scat: '🎁' },
    { key: 'dinosaurs', name: 'Dino Jungle', group: 'Nature', kids: true, flavour: 'Eggs, ferns and giant friends.',
      pal: ['#143421', '#24603e', '#27ae60', '#edf7f1', '#163b26'],
      sym: ['🌿', '🥚', '🌋', '🥩', '🦕', '🦖'], wild: '☄️', scat: '🦟' },
    { key: 'samurai', name: 'Samurai Spirit', group: 'Adventure', kids: false, flavour: 'Blossoms, lanterns and quiet castles.',
      pal: ['#341714', '#602a24', '#e74c3c', '#f7eeed', '#3b1a16'],
      sym: ['🌸', '🍵', '🏮', '🏯', '👺', '🗡️'], wild: '🥋', scat: '⛩️' },
    { key: 'vikings', name: 'Viking Legends', group: 'Adventure', kids: false, flavour: 'Longships, shields and stormy seas.',
      pal: ['#142734', '#244860', '#3498db', '#edf3f7', '#162c3b'],
      sym: ['🍖', '🛡️', '🪓', '🛶', '🐺', '⚡'], wild: '🧔', scat: '🔨' },
    { key: 'steampunk', name: 'Steampunk Rev', group: 'Adventure', kids: true, flavour: 'Gears, clocks and a chugging train.',
      pal: ['#342014', '#603c24', '#d35400', '#f7f1ed', '#3b2516'],
      sym: ['🔩', '⚙️', '🕰️', '🗝️', '🎩', '🚂'], wild: '💡', scat: '🧭' },
    { key: 'wildwest', name: 'Wild West', group: 'Adventure', kids: false, flavour: 'Cactus, boots and a dusty trail.',
      pal: ['#342314', '#604024', '#e67e22', '#f7f2ed', '#3b2816'],
      sym: ['🌵', '👢', '🍯', '🐎', '🎁', '🤠'], wild: '⭐', scat: '📜' },
    { key: 'fairytale', name: 'Fairy Tale', group: 'Fantasy', kids: true, flavour: 'A frog, a crown and a castle.',
      pal: ['#341424', '#602442', '#ff69b4', '#f7edf2', '#3b1629'],
      sym: ['🍄', '🌸', '🐸', '👑', '🏰', '🧚'], wild: '✨', scat: '📖' },
    { key: 'dragons', name: 'Dragon\'s Lair', group: 'Fantasy', kids: true, flavour: 'A cosy cave and a very large egg.',
      pal: ['#341714', '#602a24', '#c0392b', '#f7eeed', '#3b1a16'],
      sym: ['🥚', '🔥', '🛡️', '🗡️', '🏰', '🐉'], wild: '👁️', scat: '💎' },
    { key: 'robots', name: 'Robot Factory', group: 'Space & Tech', kids: true, flavour: 'Wrenches, batteries and one big robot.',
      pal: ['#142734', '#244860', '#3498db', '#edf3f7', '#162c3b'],
      sym: ['🔧', '⚙️', '🔋', '💾', '🦿', '🤖'], wild: '⚡', scat: '🚨' },
    { key: 'ninjas', name: 'Ninja Shadows', group: 'Adventure', kids: false, flavour: 'Rice balls, bamboo and a quiet rooftop.',
      pal: ['#142434', '#244260', '#2c3e50', '#edf2f7', '#16293b'],
      sym: ['🍙', '🎋', '👺', '🗡️', '🏯', '🥷'], wild: '💨', scat: '⭐' }

    ];
    for (var i = 0; i < DATA.length; i++) { add(DATA[i]); }
}());
