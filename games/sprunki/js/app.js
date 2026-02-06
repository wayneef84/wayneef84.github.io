/**
 * ========================================================================
 * S4K MIXER V3.4 - CLIENT LOGIC
 * ========================================================================
 */

// --- GLOBAL STATE ---
let config = null;       // Stores the loaded JSON config
let audioCtx = null;     // Web Audio API Context
let currentPackId = null; // ID of the currently active pack (e.g., 'phase1')
let slotCount = 0;       // Current number of active stage slots

// --- TRACKING OBJECTS ---
const activeSources = {}; // Maps slotId (e.g., 'slot-0') -> AudioBufferSourceNode
const activeSlots = {};   // Maps slotId -> Character Data Object
const activeCharIds = new Set(); // Set of currently active Character IDs (to prevent dupes)

// --- DRAG ENGINE VARIABLES ---
let dragItem = null;      // The character data being dragged
let dragGhost = null;     // The DOM element following the cursor
let currentPackBase = ''; // The root path for the current pack (e.g., './assets/packs/phase1/')
let startX = 0, startY = 0; // Coordinates where touch started
let isDragging = false;   // Flag: True if movement > 5px
let isPlaying = false;    // Global Play State

/**
 * INIT
 * Entry point of the application.
 */
async function init() {
    try {
        const response = await fetch('./config.json');
        if (!response.ok) throw new Error('Config not found. Ensure v3_config.json exists.');
        config = await response.json();

        // --- CUSTOM CONTENT INJECTION ---
        if (window.CustomSprunkiManager) {
            const customChars = window.CustomSprunkiManager.getCustomCharacters();
            if (customChars.length > 0) {
                // Add chars to roster
                config.characters.push(...customChars);
            }
        }
        // --------------------------------

        initSettings();
        initPackSelector();

        // Load Default Pack (First one in list)
        const defaultPack = config.packs[0].id;
        await switchPack(defaultPack);

        // Bind Controls
        document.getElementById('playBtn').onclick = togglePlay;
        document.getElementById('resetBtn').onclick = clearStage;

        // Bind Global Drag Listeners
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        console.log(`S4K V3.4 System Ready.`);
    } catch (err) {
        console.error(err);
        document.getElementById('stage').innerHTML = `<div class="error">${err.message}</div>`;
    }
}

function initSettings() {
    const settings = config.settings.stage;
    const range = document.getElementById('slotRange');
    range.min = settings.min_slots;
    range.max = settings.max_slots;
    range.value = settings.default_slots;
    slotCount = settings.default_slots;

    // Layout Math
    const rootStyle = getComputedStyle(document.body);
    const slotSize = parseInt(rootStyle.getPropertyValue('--slot-size'));
    const slotGap = 8;
    const padding = 24;
    const border = 4;

    // Formula: (Slots * Size) + (Gaps) + Padding + Safety Border
    const limit = settings.slots_per_row;
    const maxWidth = (limit * slotSize) + ((limit - 1) * slotGap) + padding + border;
    document.getElementById('stage').style.maxWidth = `${maxWidth}px`;
    document.getElementById('slotCountVal').textContent = slotCount;
}

function initPackSelector() {
    const select = document.getElementById('packSelect');
    select.innerHTML = '';
    config.packs.forEach(pack => {
        const opt = document.createElement('option');
        opt.value = pack.id;
        opt.textContent = pack.label;
        select.appendChild(opt);
    });
    select.value = config.packs[0].id;
}

async function switchPack(forcePackId) {
    const targetId = forcePackId || document.getElementById('packSelect').value;
    if (forcePackId) document.getElementById('packSelect').value = forcePackId;

    if (currentPackId && currentPackId !== targetId) clearStage();
    currentPackId = targetId;

    const packInfo = config.packs.find(p => p.id === currentPackId);
    currentPackBase = packInfo ? packInfo.base_path : '';

    buildStage(slotCount);
    buildPalette(currentPackId);
}

function handleSliderChange() {
    const range = document.getElementById('slotRange');
    const newVal = parseInt(range.value);

    // Find right-most occupied slot
    let maxOccupiedIndex = -1;
    for (let i = 0; i < config.settings.stage.max_slots; i++) {
        if (activeSlots[`slot-${i}`]) maxOccupiedIndex = i;
    }
    // Constraint Check
    if (newVal < maxOccupiedIndex + 1) {
        range.value = maxOccupiedIndex + 1; // Snap back
        return;
    }

    const oldVal = slotCount;
    slotCount = newVal;
    document.getElementById('slotCountVal').textContent = slotCount;
    updateStageDOM(oldVal, slotCount);
}

function updateStageDOM(oldVal, newVal) {
    const stage = document.getElementById('stage');
    if (newVal > oldVal) {
        for (let i = oldVal; i < newVal; i++) createSlot(i, stage);
    } else if (newVal < oldVal) {
        for (let i = oldVal - 1; i >= newVal; i--) {
            const el = document.getElementById(`slot-${i}`);
            if (el) el.remove();
        }
    }
}

function createSlot(i, container) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.id = `slot-${i}`;
    slot.textContent = '+';
    slot.onclick = () => { if(activeSlots[slot.id]) removeFromSlot(i); };
    container.appendChild(slot);
}

function buildStage(count) {
    const stage = document.getElementById('stage');
    stage.innerHTML = '';
    for (let i = 0; i < count; i++) createSlot(i, stage);
}

// Helper to resolve paths
function resolvePath(base, path) {
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return base + path;
}

function buildPalette(packId) {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    // Filter
    const charsInPack = config.characters.filter(c => c.pack_id === packId);

    // Group by Type (Beats, Effects...)
    const byType = {};
    charsInPack.forEach(c => { if(!byType[c.type]) byType[c.type]=[]; byType[c.type].push(c); });

    config.categories.forEach(cat => {
        if (!byType[cat.id]) return;

        // Add Header
        const header = document.createElement('div');
        header.className = 'cat-header'; header.textContent = cat.label; header.style.borderBottomColor = cat.color;
        palette.appendChild(header);

        // Add Characters
        byType[cat.id].forEach(char => {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.id = `char-btn-${char.id}`;
            box.style.borderBottomColor = cat.color;
            box.style.position = 'relative'; // For buttons

            const imgPath = resolvePath(currentPackBase, char.img);

            // Image
            const img = document.createElement('img');
            img.src = imgPath;
            img.alt = char.name;
            if (char.crop) {
                img.style.objectPosition = `${char.crop.x}% ${char.crop.y}%`;
                img.style.transform = `scale(${char.crop.scale})`;
            }
            box.appendChild(img);

            // Label
            const span = document.createElement('span');
            span.className = 'char-label';
            span.textContent = char.name;
            box.appendChild(span);

            // --- CUSTOM ACTIONS ---
            if (char.custom) {
                const actionRow = document.createElement('div');
                actionRow.style = 'position: absolute; bottom: -5px; right: 0; display: flex; gap: 2px;';

                // QR Button
                const qrBtn = document.createElement('button');
                qrBtn.innerHTML = '🔗';
                qrBtn.style = 'font-size: 8px; background: #222; border: 1px solid #555; padding: 2px; cursor: pointer; color: white;';
                qrBtn.title = 'Share QR';
                qrBtn.onclick = (e) => {
                    e.stopPropagation(); // Prevent drag start
                    window.SprunkiQR.generateQR(char);
                };

                // Delete Button
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '✖';
                delBtn.style = 'font-size: 8px; background: #900; border: 1px solid #555; padding: 2px; cursor: pointer; color: white;';
                delBtn.title = 'Delete';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if(confirm(`Delete ${char.name}?`)) {
                        window.CustomSprunkiManager.deleteCharacter(char.id);
                        location.reload();
                    }
                };

                actionRow.appendChild(qrBtn);
                actionRow.appendChild(delBtn);
                box.appendChild(actionRow);
            }
            // ----------------------

            // INIT INPUT (Touch or Mouse)
            const startInput = (e) => {
                if (activeCharIds.has(char.id)) return;
                // If touching a button, don't drag
                if (e.target.tagName === 'BUTTON') return;
                initDrag(e, char, imgPath);
            };

            box.addEventListener('touchstart', startInput, {passive: false});
            box.addEventListener('mousedown', startInput);

            palette.appendChild(box);
        });
    });
}

function initDrag(e, char, imgPath) {
    dragItem = char;
    isDragging = false;

    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;

    dragGhost = document.createElement('img');
    dragGhost.src = imgPath;
    dragGhost.className = 'drag-ghost';
    dragGhost.style.display = 'none';

    // Apply crop to ghost too
    if (char.crop) {
        dragGhost.style.objectPosition = `${char.crop.x}% ${char.crop.y}%`;
        // Scale on ghost might need adjustment or a wrapper,
        // but for now let's just use object-fit logic similar to slot
        // Actually, ghost uses transform for position, so adding scale might conflict.
        // We'll leave ghost uncropped/unscaled for simplicity or apply scale via css vars if we refactor.
        // Let's just set object-fit cover to fill the ghost box
        dragGhost.style.objectFit = 'cover';
    }

    document.body.appendChild(dragGhost);
}

function onDragMove(e) {
    if (!dragItem) return;

    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX;
    const y = touch.clientY;
    const dist = Math.hypot(x - startX, y - startY);

    if (dist > 5 && !isDragging) {
        isDragging = true;
        dragGhost.style.display = 'block';
    }

    if (isDragging) {
        if(e.cancelable) e.preventDefault();

        dragGhost.style.left = `${x}px`;
        dragGhost.style.top = `${y}px`;

        document.querySelectorAll('.slot').forEach(s => s.classList.remove('drag-over'));
        const elementBelow = document.elementFromPoint(x, y);
        const slot = elementBelow ? elementBelow.closest('.slot') : null;
        if (slot) slot.classList.add('drag-over');
    }
}

function onDragEnd(e) {
    if (!dragItem) return;

    if (dragGhost) dragGhost.remove();
    dragGhost = null;
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('drag-over'));

    if (isDragging) {
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const slot = elementBelow ? elementBelow.closest('.slot') : null;

        if (slot) assignToSlot(slot, dragItem);
    } else {
        autoAddChar(dragItem);
    }

    dragItem = null;
    isDragging = false;
}

function autoAddChar(char) {
    let emptySlot = null;
    for (let i = 0; i < slotCount; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot && slot.textContent === '+') {
            emptySlot = slot;
            break;
        }
    }

    if (emptySlot) {
        assignToSlot(emptySlot, char);
    } else {
        const st = document.getElementById('stage');
        st.classList.add('full');
        setTimeout(() => st.classList.remove('full'), 300);
    }
}

async function assignToSlot(slot, char) {
    if (activeSlots[slot.id]) {
        removeFromSlot(parseInt(slot.id.split('-')[1]));
    }

    const ctx = getAudioContext();
    const audioPath = resolvePath(currentPackBase, char.audio);

    try {
        const imgPath = resolvePath(currentPackBase, char.img);

        slot.innerHTML = '';
        const img = document.createElement('img');
        img.src = imgPath;
        img.alt = char.name;

        if (char.crop) {
            img.style.objectPosition = `${char.crop.x}% ${char.crop.y}%`;
            img.style.transform = `scale(${char.crop.scale})`;
        }
        slot.appendChild(img);

        slot.classList.add('active');
        slot.dataset.charId = char.id;

        activeSlots[slot.id] = char;
        activeCharIds.add(char.id);
        updatePaletteState(char.id, true);

        const response = await fetch(audioPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const ab = await response.arrayBuffer();
        const buff = await ctx.decodeAudioData(ab);

        const src = ctx.createBufferSource();
        src.buffer = buff; src.loop = true;
        src.connect(ctx.destination);
        src.start(0);
        activeSources[slot.id] = src;

        if (!isPlaying) ctx.suspend();
    } catch (err) {
        console.error(err);
        slot.innerHTML = '❌';
        removeFromSlot(parseInt(slot.id.split('-')[1]));
    }
}

function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function togglePlay() {
    const ctx = getAudioContext();
    isPlaying = !isPlaying;
    const btn = document.getElementById('playBtn');
    if (isPlaying) {
        btn.textContent = '⏸'; btn.classList.add('playing'); ctx.resume();
    } else {
        btn.textContent = '▶'; btn.classList.remove('playing'); ctx.suspend();
    }
}

function removeFromSlot(index) {
    const slotId = `slot-${index}`;
    const char = activeSlots[slotId];
    if (!char) return;

    if (activeSources[slotId]) {
        activeSources[slotId].stop();
        delete activeSources[slotId];
    }

    activeCharIds.delete(char.id);
    delete activeSlots[slotId];
    updatePaletteState(char.id, false);

    const slot = document.getElementById(slotId);
    slot.innerHTML = '+';
    slot.classList.remove('active');
    delete slot.dataset.charId;
}

function clearStage() {
    Object.values(activeSources).forEach(src => src.stop());
    for (const key in activeSources) delete activeSources[key];
    for (const key in activeSlots) delete activeSlots[key];
    activeCharIds.clear();

    buildStage(slotCount);
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
    document.getElementById('playBtn').classList.remove('playing');
    buildPalette(currentPackId);
    if (audioCtx) audioCtx.resume();
}

function updatePaletteState(charId, isOnStage) {
    const btn = document.getElementById(`char-btn-${charId}`);
    if (btn) {
        isOnStage ? btn.classList.add('on-stage') : btn.classList.remove('on-stage');
    }
}

window.addEventListener('load', init);
