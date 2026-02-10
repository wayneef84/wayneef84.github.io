/**
 * ========================================================================
 * S4K MIXER V3.4 - CLIENT LOGIC (ES5 Compatible)
 * ========================================================================
 */

// --- GLOBAL STATE ---
var config = null;       // Stores the loaded JSON config
var audioCtx = null;     // Web Audio API Context
var currentPackId = null; // ID of the currently active pack
var slotCount = 0;       // Current number of active stage slots
var isPlaying = false;   // Playback state
var horrorMode = false;  // Horror Mode State

// --- TRACKING OBJECTS ---
var activeSources = {}; // Maps slotId -> AudioBufferSourceNode
var activeSlots = {};   // Maps slotId -> Character Data Object
var activeCharIds = {}; // Maps charId -> true (to prevent dupes)

// --- DRAG ENGINE VARIABLES ---
var dragItem = null;
var dragGhost = null;
var currentPackBase = '';
var startX = 0, startY = 0;
var isDragging = false;

/**
 * INIT - Entry point of the application.
 */
function init() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './config.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) {
            document.getElementById('stage').innerHTML = '<div class="error">Config not found.</div>';
            return;
        }
        try {
            config = JSON.parse(xhr.responseText);
        } catch (e) {
            document.getElementById('stage').innerHTML = '<div class="error">Bad config JSON.</div>';
            return;
        }

        // --- CUSTOM CONTENT INJECTION ---
        if (window.CustomSprunkiManager) {
            var customChars = window.CustomSprunkiManager.getCustomCharacters();
            for (var i = 0; i < customChars.length; i++) {
                config.characters.push(customChars[i]);
            }
        }

        initSettings();
        initPackSelector();

        // Load Default Pack
        var defaultPack = config.packs[0].id;
        switchPack(defaultPack);

        // Bind Controls
        document.getElementById('playBtn').onclick = togglePlay;
        document.getElementById('resetBtn').onclick = clearStage;

        // Bind Global Drag Listeners
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        console.log('S4K V3.4 System Ready.');
    };
    xhr.send();
}

function initSettings() {
    var settings = config.settings.stage;
    var range = document.getElementById('slotRange');
    range.min = settings.min_slots;
    range.max = settings.max_slots;
    range.value = settings.default_slots;
    slotCount = settings.default_slots;

    var rootStyle = getComputedStyle(document.body);
    var slotSize = parseInt(rootStyle.getPropertyValue('--slot-size'));
    var slotGap = 8;
    var padding = 24;
    var border = 4;

    var limit = settings.slots_per_row;
    var maxWidth = (limit * slotSize) + ((limit - 1) * slotGap) + padding + border;
    document.getElementById('stage').style.maxWidth = maxWidth + 'px';
    document.getElementById('slotCountVal').textContent = slotCount;
}

function initPackSelector() {
    var select = document.getElementById('packSelect');
    select.innerHTML = '';
    for (var i = 0; i < config.packs.length; i++) {
        var pack = config.packs[i];
        var opt = document.createElement('option');
        opt.value = pack.id;
        opt.textContent = pack.label;
        select.appendChild(opt);
    }
    select.value = config.packs[0].id;
}

function switchPack(forcePackId) {
    var targetId = forcePackId || document.getElementById('packSelect').value;
    if (forcePackId) document.getElementById('packSelect').value = forcePackId;

    if (currentPackId && currentPackId !== targetId) clearStage();
    currentPackId = targetId;

    var packInfo = null;
    for (var i = 0; i < config.packs.length; i++) {
        if (config.packs[i].id === currentPackId) { packInfo = config.packs[i]; break; }
    }
    currentPackBase = packInfo ? packInfo.base_path : '';

    buildStage(slotCount);
    buildPalette(currentPackId);
}

function handleSliderChange() {
    var range = document.getElementById('slotRange');
    var newVal = parseInt(range.value);

    var maxOccupiedIndex = -1;
    for (var i = 0; i < config.settings.stage.max_slots; i++) {
        if (activeSlots['slot-' + i]) maxOccupiedIndex = i;
    }
    if (newVal < maxOccupiedIndex + 1) {
        range.value = maxOccupiedIndex + 1;
        return;
    }

    var oldVal = slotCount;
    slotCount = newVal;
    document.getElementById('slotCountVal').textContent = slotCount;
    updateStageDOM(oldVal, slotCount);
}

function updateStageDOM(oldVal, newVal) {
    var stage = document.getElementById('stage');
    var i;
    if (newVal > oldVal) {
        for (i = oldVal; i < newVal; i++) createSlot(i, stage);
    } else if (newVal < oldVal) {
        for (i = oldVal - 1; i >= newVal; i--) {
            var el = document.getElementById('slot-' + i);
            if (el) el.remove();
        }
    }
}

function createSlot(i, container) {
    var slot = document.createElement('div');
    slot.className = 'slot';
    slot.id = 'slot-' + i;
    slot.textContent = '+';
    (function (index) {
        slot.onclick = function () {
            if (activeSlots['slot-' + index]) removeFromSlot(index);
        };
    })(i);
    container.appendChild(slot);
}

function buildStage(count) {
    var stage = document.getElementById('stage');
    stage.innerHTML = '';
    for (var i = 0; i < count; i++) createSlot(i, stage);
}

function resolvePath(base, path) {
    if (path.indexOf('http') === 0 || path.indexOf('data:') === 0) return path;
    return base + path;
}

function buildPalette(packId) {
    var palette = document.getElementById('palette');
    palette.innerHTML = '';

    var charsInPack = [];
    for (var i = 0; i < config.characters.length; i++) {
        if (config.characters[i].pack_id === packId) charsInPack.push(config.characters[i]);
    }

    var byType = {};
    for (var j = 0; j < charsInPack.length; j++) {
        var c = charsInPack[j];
        if (!byType[c.type]) byType[c.type] = [];
        byType[c.type].push(c);
    }

    for (var k = 0; k < config.categories.length; k++) {
        var cat = config.categories[k];
        if (!byType[cat.id]) continue;

        var header = document.createElement('div');
        header.className = 'cat-header';
        header.textContent = cat.label;
        header.style.borderBottomColor = cat.color;
        palette.appendChild(header);

        var chars = byType[cat.id];
        for (var m = 0; m < chars.length; m++) {
            (function (char, catColor) {
                var box = document.createElement('div');
                box.className = 'char-box';
                box.id = 'char-btn-' + char.id;
                box.style.borderBottomColor = catColor;
                box.style.position = 'relative';

                var imgPath = resolvePath(currentPackBase, char.img);

                var img = document.createElement('img');
                img.src = imgPath;
                img.alt = char.name;
                if (char.crop) {
                    img.style.objectPosition = char.crop.x + '% ' + char.crop.y + '%';
                    img.style.transform = 'scale(' + char.crop.scale + ')';
                }
                box.appendChild(img);

                var span = document.createElement('span');
                span.className = 'char-label';
                span.textContent = char.name;
                box.appendChild(span);

                // --- CUSTOM ACTIONS ---
                if (char.custom) {
                    var actionRow = document.createElement('div');
                    actionRow.style.cssText = 'position: absolute; bottom: -5px; right: 0; display: flex; gap: 2px;';

                    var qrBtn = document.createElement('button');
                    qrBtn.innerHTML = '&#x1F517;';
                    qrBtn.style.cssText = 'font-size: 8px; background: #222; border: 1px solid #555; padding: 2px; cursor: pointer; color: white;';
                    qrBtn.title = 'Share QR';
                    qrBtn.onclick = function (e) {
                        e.stopPropagation();
                        window.SprunkiQR.generateQR(char);
                    };

                    var delBtn = document.createElement('button');
                    delBtn.innerHTML = '&#x2716;';
                    delBtn.style.cssText = 'font-size: 8px; background: #900; border: 1px solid #555; padding: 2px; cursor: pointer; color: white;';
                    delBtn.title = 'Delete';
                    delBtn.onclick = function (e) {
                        e.stopPropagation();
                        if (confirm('Delete ' + char.name + '?')) {
                            window.CustomSprunkiManager.deleteCharacter(char.id);
                            location.reload();
                        }
                    };

                    actionRow.appendChild(qrBtn);
                    actionRow.appendChild(delBtn);
                    box.appendChild(actionRow);
                }

                var startInput = function (e) {
                    if (activeCharIds[char.id]) return;
                    if (e.target.tagName === 'BUTTON') return;
                    initDrag(e, char, imgPath);
                };

                box.addEventListener('touchstart', startInput, { passive: false });
                box.addEventListener('mousedown', startInput);

                palette.appendChild(box);
            })(chars[m], cat.color);
        }
    }
}

function initDrag(e, char, imgPath) {
    dragItem = char;
    isDragging = false;

    var touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;

    dragGhost = document.createElement('img');
    dragGhost.src = imgPath;
    dragGhost.className = 'drag-ghost';
    dragGhost.style.display = 'none';

    if (char.crop) {
        dragGhost.style.objectPosition = char.crop.x + '% ' + char.crop.y + '%';
        dragGhost.style.objectFit = 'cover';
    }

    document.body.appendChild(dragGhost);
}

function onDragMove(e) {
    if (!dragItem) return;

    var touch = e.touches ? e.touches[0] : e;
    var x = touch.clientX;
    var y = touch.clientY;
    var dx = x - startX;
    var dy = y - startY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5 && !isDragging) {
        isDragging = true;
        dragGhost.style.display = 'block';
    }

    if (isDragging) {
        if (e.cancelable) e.preventDefault();

        dragGhost.style.left = x + 'px';
        dragGhost.style.top = y + 'px';

        var slots = document.querySelectorAll('.slot');
        for (var i = 0; i < slots.length; i++) slots[i].classList.remove('drag-over');
        var elementBelow = document.elementFromPoint(x, y);
        var slot = elementBelow ? elementBelow.closest('.slot') : null;
        if (slot) slot.classList.add('drag-over');
    }
}

function onDragEnd(e) {
    if (!dragItem) return;

    // HORROR TRIGGER CHECK
    if (dragItem.id === 'black_hat') {
        if (dragGhost) dragGhost.remove();
        dragGhost = null;
        var slots = document.querySelectorAll('.slot');
        for (var i = 0; i < slots.length; i++) slots[i].classList.remove('drag-over');

        var touch = e.changedTouches ? e.changedTouches[0] : e;
        var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        var slot = elementBelow ? elementBelow.closest('.slot') : null;

        if (slot && activeSlots[slot.id] && activeSlots[slot.id].id === 'v02') {
             enableHorrorMode();
        }

        dragItem = null;
        isDragging = false;
        return;
    }

    if (dragGhost) dragGhost.remove();
    dragGhost = null;
    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) slots[i].classList.remove('drag-over');

    if (isDragging) {
        var touch = e.changedTouches ? e.changedTouches[0] : e;
        var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        var slot = elementBelow ? elementBelow.closest('.slot') : null;

        if (slot) assignToSlot(slot, dragItem);
    } else {
        autoAddChar(dragItem);
    }

    dragItem = null;
    isDragging = false;
}

function enableHorrorMode() {
    if (horrorMode) return;
    horrorMode = true;
    document.body.classList.add('horror');

    // Refresh all active slots
    for (var key in activeSlots) {
        if (activeSlots.hasOwnProperty(key)) {
            var char = activeSlots[key];
            var slotEl = document.getElementById(key);
            assignToSlot(slotEl, char);
        }
    }
}

function autoAddChar(char) {
    var emptySlot = null;
    for (var i = 0; i < slotCount; i++) {
        var slot = document.getElementById('slot-' + i);
        if (slot && slot.textContent === '+') {
            emptySlot = slot;
            break;
        }
    }

    if (emptySlot) {
        assignToSlot(emptySlot, char);
    } else {
        var st = document.getElementById('stage');
        st.classList.add('full');
        setTimeout(function () { st.classList.remove('full'); }, 300);
    }
}

function assignToSlot(slot, char) {
    if (activeSlots[slot.id]) {
        removeFromSlot(parseInt(slot.id.split('-')[1]));
    }

    var ctx = getAudioContext();

    // Select assets based on Horror Mode
    var useHorror = horrorMode && char.horror_audio && char.horror_img;
    var audioPath = resolvePath(currentPackBase, useHorror ? char.horror_audio : char.audio);
    var imgPath = resolvePath(currentPackBase, useHorror ? char.horror_img : char.img);

    slot.innerHTML = '';
    var img = document.createElement('img');
    img.src = imgPath;
    img.alt = char.name;

    if (char.crop) {
        img.style.objectPosition = char.crop.x + '% ' + char.crop.y + '%';
        img.style.transform = 'scale(' + char.crop.scale + ')';
    }
    slot.appendChild(img);

    slot.classList.add('active');
    slot.dataset.charId = char.id;

    activeSlots[slot.id] = char;
    activeCharIds[char.id] = true;
    updatePaletteState(char.id, true);

    // Fetch and decode audio via XHR (ES5 compatible)
    var xhr = new XMLHttpRequest();
    xhr.open('GET', audioPath, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (xhr.status !== 200) {
            console.error('Audio fetch failed: HTTP ' + xhr.status);
            slot.innerHTML = '&#x274C;';
            removeFromSlot(parseInt(slot.id.split('-')[1]));
            return;
        }
        ctx.decodeAudioData(xhr.response, function (buff) {
            // Check if slot was cleared or changed while decoding
            if (!activeSlots[slot.id] || activeSlots[slot.id].id !== char.id) return;

            var src = ctx.createBufferSource();
            src.buffer = buff;
            src.loop = true;
            src.connect(ctx.destination);
            src.start(0);
            activeSources[slot.id] = src;

            if (!isPlaying) ctx.suspend();
        }, function (err) {
            console.error('Audio decode error', err);
            slot.innerHTML = '&#x274C;';
            removeFromSlot(parseInt(slot.id.split('-')[1]));
        });
    };
    xhr.onerror = function () {
        console.error('Audio XHR error');
        slot.innerHTML = '&#x274C;';
        removeFromSlot(parseInt(slot.id.split('-')[1]));
    };
    xhr.send();
}

function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function togglePlay() {
    var ctx = getAudioContext();
    isPlaying = !isPlaying;
    var btn = document.getElementById('playBtn');
    if (isPlaying) {
        btn.textContent = '\u23F8';
        btn.classList.add('playing');
        ctx.resume();
    } else {
        btn.textContent = '\u25B6';
        btn.classList.remove('playing');
        ctx.suspend();
    }
}

function removeFromSlot(index) {
    var slotId = 'slot-' + index;
    var char = activeSlots[slotId];
    if (!char) return;

    if (activeSources[slotId]) {
        activeSources[slotId].stop();
        delete activeSources[slotId];
    }

    delete activeCharIds[char.id];
    delete activeSlots[slotId];
    updatePaletteState(char.id, false);

    var slot = document.getElementById(slotId);
    slot.innerHTML = '+';
    slot.classList.remove('active');
    delete slot.dataset.charId;
}

function clearStage() {
    var key;
    for (key in activeSources) {
        if (activeSources.hasOwnProperty(key)) {
            activeSources[key].stop();
            delete activeSources[key];
        }
    }
    for (key in activeSlots) {
        if (activeSlots.hasOwnProperty(key)) delete activeSlots[key];
    }
    activeCharIds = {};

    // Reset Horror Mode
    horrorMode = false;
    document.body.classList.remove('horror');

    buildStage(slotCount);
    isPlaying = false;
    document.getElementById('playBtn').textContent = '\u25B6';
    document.getElementById('playBtn').classList.remove('playing');
    buildPalette(currentPackId);
    if (audioCtx) audioCtx.resume();
}

function updatePaletteState(charId, isOnStage) {
    var btn = document.getElementById('char-btn-' + charId);
    if (btn) {
        if (isOnStage) {
            btn.classList.add('on-stage');
        } else {
            btn.classList.remove('on-stage');
        }
    }
}

window.addEventListener('load', init);
