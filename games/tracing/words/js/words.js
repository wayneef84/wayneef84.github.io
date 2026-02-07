class WordGame {
    constructor() {
        this.canvas = document.getElementById('traceCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Views & UI
        this.menuView = document.getElementById('menu-view');
        this.gameView = document.getElementById('game-view');
        this.wordListEl = document.getElementById('word-list');
        this.progressEl = document.getElementById('word-progress');
        this.msgEl = document.getElementById('message-area');
        this.modeSelectEl = document.getElementById('guidanceSelect');
        this.wordSelectEl = document.getElementById('wordSelect');
        this.backToMenuBtn = document.getElementById('back-to-menu');

        // Image UI
        this.imageArea = document.getElementById('imageArea');
        this.wordImage = document.getElementById('wordImage');
        this.imageFallback = document.getElementById('imageFallback');

        // Modal Elements
        this.modal = document.getElementById('add-modal');
        this.inputEl = document.getElementById('new-word-input');
        this.cancelBtn = document.getElementById('cancel-add');
        this.saveBtn = document.getElementById('confirm-add');

        // Category Selector
        this.categorySelectorEl = document.getElementById('category-selector');

        // State
        this.currentWord = "";
        this.letterIndex = 0;

        this.strokes = [];
        this.strokeProgress = [];
        this.strokeDone = [];
        this.isDrawing = false;
        this.lastPos = null;
        this.particles = [];

        this.guidanceMode = 'ghost_plus';
        this.ghostT = 0;
        this.voiceRate = 0.9;

        // Data - Now loaded from JSON
        this.wordData = null;           // Loaded JSON data
        this.currentCategory = null;    // Active category object
        this.categoryId = 'family';     // Default category ID
        this.emojiMap = {};             // Dynamic emoji mapping
        this.defaultWords = [];         // Words from current category
        this.customWords = [];
        this.globalAudio = {};

        this.init();
    }

    init() {
        var self = this;

        // 1. Load Global Audio
        if (window.GAME_CONTENT && window.GAME_CONTENT.globalAudio) {
            this.globalAudio = window.GAME_CONTENT.globalAudio;
        }

        // 2. Load Custom Words from Storage
        var saved = localStorage.getItem('fong_custom_words');
        if (saved) {
            try {
                this.customWords = JSON.parse(saved);
            } catch(e) { console.error("Save data corrupted", e); }
        }

        // 3. Load saved category preference
        var savedCategory = localStorage.getItem('fong_word_category');
        if (savedCategory) {
            this.categoryId = savedCategory;
        }

        // 4. Check URL parameters
        var params = this.parseURLParams();

        // 5. Setup events and animation loop
        this.setupEvents();
        requestAnimationFrame(function() { self.loop(); });

        // 6. Load word data from JSON
        fetch('data/word_list.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                self.wordData = data;
                // Use saved category or default from JSON
                if (!savedCategory && data.defaultCategory) {
                    self.categoryId = data.defaultCategory;
                }
                self.loadCategory(self.categoryId);
                self.renderMenu();

                // 7. Load word from URL if provided (after data is loaded)
                if (params.word) {
                    self.loadFromURL(params);
                }
            })
            .catch(function(err) {
                console.error("Failed to load word_list.json:", err);
                // Fallback to hardcoded words if JSON fails
                self.defaultWords = ["Kenzie", "Jennie", "Wayne", "Mom", "Dad", "Cat", "Dog"];
                self.emojiMap = { "Kenzie": "👧", "Jennie": "👩", "Wayne": "👨", "Mom": "👩", "Dad": "👨", "Cat": "🐱", "Dog": "🐕" };
                self.renderMenu();
                if (params.word) {
                    self.loadFromURL(params);
                }
            });
    }

    loadCategory(categoryId) {
        if (!this.wordData || !this.wordData.categories) return;

        var category = null;
        for (var i = 0; i < this.wordData.categories.length; i++) {
            if (this.wordData.categories[i].id === categoryId) {
                category = this.wordData.categories[i];
                break;
            }
        }

        if (!category) {
            // Fall back to first category
            category = this.wordData.categories[0];
        }

        this.currentCategory = category;
        this.categoryId = category.id;

        // Build word list and emoji map from category
        this.defaultWords = [];
        this.emojiMap = {};

        for (var j = 0; j < category.words.length; j++) {
            var item = category.words[j];
            this.defaultWords.push(item.word);
            if (item.emoji) {
                this.emojiMap[item.word] = item.emoji;
            }
        }

        // Save category preference
        localStorage.setItem('fong_word_category', this.categoryId);
    }

    parseURLParams() {
        var params = {};
        var searchParams = new URLSearchParams(window.location.search);
        params.id = searchParams.get('id');
        params.word = searchParams.get('word');
        params.emoji = searchParams.get('emoji');
        return params;
    }

    loadFromURL(params) {
        var self = this;
        if (params.id === 'custom' && params.word) {
            // Custom word mode
            setTimeout(function() {
                self.startCustomWord(params.word, params.emoji);
            }, 50);
        } else if (params.word) {
            // Look up word in word lists
            var word = params.word;
            var found = self.defaultWords.indexOf(word) !== -1 ||
                       self.customWords.indexOf(word) !== -1;
            if (found) {
                setTimeout(function() {
                    self.startWord(word);
                }, 50);
            }
        }
    }

    startCustomWord(word, emoji) {
        this.currentWord = word;
        this.letterIndex = 0;
        this.isCustomWord = true;
        this.customEmoji = emoji || null;

        this.menuView.style.display = 'none';
        this.gameView.classList.add('active');

        // Populate word selector dropdown (will show "Custom" only, disabled)
        this.populateWordSelector();

        // Update URL
        this.updateURL(word);

        this.updateImageDisplay();

        var self = this;
        setTimeout(function() {
            self.resize();
            self.loadLetter(self.currentWord[0]);
            self.updateProgressBar();
        }, 50);
    }

    // --- MENU SYSTEM ---
    renderMenu() {
        var self = this;

        // Render category tabs
        this.renderCategoryTabs();

        // Clear word list
        this.wordListEl.innerHTML = '';

        // 1. Default Words from current category
        for (var i = 0; i < this.defaultWords.length; i++) {
            this.createWordCard(this.defaultWords[i], false);
        }

        // 2. Custom Words
        for (var j = 0; j < this.customWords.length; j++) {
            this.createWordCard(this.customWords[j], true);
        }

        // 3. Add Button
        var addBtn = document.createElement('div');
        addBtn.className = 'word-card add-btn';
        addBtn.textContent = '+';
        addBtn.onclick = function() { self.openModal(); };
        this.wordListEl.appendChild(addBtn);
    }

    renderCategoryTabs() {
        var self = this;
        if (!this.categorySelectorEl || !this.wordData) return;

        this.categorySelectorEl.innerHTML = '';

        for (var i = 0; i < this.wordData.categories.length; i++) {
            var cat = this.wordData.categories[i];
            var tab = document.createElement('button');
            tab.className = 'category-tab';
            if (cat.id === this.categoryId) {
                tab.className += ' active';
            }
            tab.dataset.categoryId = cat.id;

            var iconSpan = document.createElement('span');
            iconSpan.className = 'category-icon';
            iconSpan.textContent = cat.icon || '';
            tab.appendChild(iconSpan);

            var nameSpan = document.createElement('span');
            nameSpan.textContent = cat.name;
            tab.appendChild(nameSpan);

            tab.onclick = function(e) {
                var btn = e.currentTarget;
                var catId = btn.dataset.categoryId;
                if (catId !== self.categoryId) {
                    self.loadCategory(catId);
                    self.renderMenu();
                }
            };

            this.categorySelectorEl.appendChild(tab);
        }
    }

    createWordCard(word, isCustom) {
        var self = this;
        var btn = document.createElement('div');
        btn.className = 'word-card';
        btn.onclick = function() { self.startWord(word); };

        // Add emoji icon on top for non-custom words
        if (!isCustom) {
            var emoji = this.getEmojiForWord(word);
            var iconEl = document.createElement('div');
            iconEl.className = 'word-card-icon';
            iconEl.textContent = emoji;
            btn.appendChild(iconEl);
        }

        // Add word text
        var textEl = document.createElement('div');
        textEl.className = 'word-card-text';
        textEl.textContent = word;
        btn.appendChild(textEl);

        if (isCustom) {
            var delBtn = document.createElement('div');
            delBtn.className = 'delete-icon';
            delBtn.innerHTML = '×';
            delBtn.title = "Delete Word";
            delBtn.onclick = function(e) {
                e.stopPropagation(); // Don't start game
                self.deleteCustomWord(word);
            };
            btn.appendChild(delBtn);
        }

        this.wordListEl.appendChild(btn);
    }

    // --- MODAL LOGIC ---
    openModal() {
        this.modal.classList.remove('hidden');
        this.inputEl.value = '';
        this.inputEl.focus();
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    saveNewWord() {
        const raw = this.inputEl.value.trim();
        // Allow Mixed Case (a-z and A-Z)
        const clean = raw.replace(/[^a-zA-Z]/g, '');

        if (clean.length > 0) {
            if (!this.customWords.includes(clean) && !this.defaultWords.includes(clean)) {
                this.customWords.push(clean);
                this.saveToStorage();
                this.renderMenu();
            }
        }
        this.closeModal();
    }

    deleteCustomWord(word) {
        if (confirm(`Delete "${word}"?`)) {
            this.customWords = this.customWords.filter(w => w !== word);
            this.saveToStorage();
            this.renderMenu();
        }
    }

    saveToStorage() {
        localStorage.setItem('fong_custom_words', JSON.stringify(this.customWords));
    }

    // --- GAME START ---
    startWord(word) {
        this.currentWord = word;
        this.letterIndex = 0;
        this.isCustomWord = false;
        this.customEmoji = null;

        this.menuView.style.display = 'none';
        this.gameView.classList.add('active');

        // Populate word selector dropdown
        this.populateWordSelector();

        // Update URL
        this.updateURL(word);

        this.updateImageDisplay();

        var self = this;
        setTimeout(function() {
            self.resize();
            self.loadLetter(self.currentWord[0]);
            self.updateProgressBar();
        }, 50);
    }

    populateWordSelector() {
        var self = this;
        this.wordSelectEl.innerHTML = '';

        if (this.isCustomWord) {
            // Custom word mode - show only "Custom" option, disabled
            var opt = document.createElement('option');
            opt.value = 'custom';
            opt.textContent = 'Custom';
            opt.selected = true;
            this.wordSelectEl.appendChild(opt);
            this.wordSelectEl.disabled = true;
            this.wordSelectEl.style.opacity = '0.6';
            this.wordSelectEl.style.cursor = 'not-allowed';
        } else {
            // Normal mode - populate with all words
            this.wordSelectEl.disabled = false;
            this.wordSelectEl.style.opacity = '1';
            this.wordSelectEl.style.cursor = 'pointer';

            // Add all default words
            this.defaultWords.forEach(function(w) {
                var opt = document.createElement('option');
                opt.value = w;
                opt.textContent = w;
                if (w === self.currentWord) opt.selected = true;
                self.wordSelectEl.appendChild(opt);
            });

            // Add all custom words
            this.customWords.forEach(function(w) {
                var opt = document.createElement('option');
                opt.value = w;
                opt.textContent = w + ' ⭐';
                if (w === self.currentWord) opt.selected = true;
                self.wordSelectEl.appendChild(opt);
            });

            // Handle word selection change
            this.wordSelectEl.onchange = function() {
                var selectedWord = self.wordSelectEl.value;
                if (selectedWord && selectedWord !== self.currentWord) {
                    self.startWord(selectedWord);
                }
            };
        }
    }

    updateURL(word) {
        var url = new URL(window.location);
        if (this.isCustomWord) {
            url.searchParams.set('id', 'custom');
            url.searchParams.set('word', word);
            if (this.customEmoji) {
                url.searchParams.set('emoji', this.customEmoji);
            }
        } else {
            url.searchParams.delete('id');
            url.searchParams.set('word', word);
            url.searchParams.delete('emoji');
        }
        history.pushState({word: word}, '', url);
    }

    updateImageDisplay() {
        if (!this.currentWord) {
            this.imageArea.classList.add('hidden');
            return;
        }

        // Check for custom emoji first (from URL parameter)
        var emoji;
        if (this.isCustomWord && this.customEmoji) {
            emoji = this.customEmoji;
        } else {
            emoji = this.getEmojiForWord(this.currentWord);
        }

        // Show emoji fallback for the word
        this.imageFallback.textContent = emoji;
        this.imageFallback.style.display = 'block';
        this.wordImage.classList.add('hidden');
        this.imageArea.classList.remove('hidden');
    }

    getEmojiForWord(word) {
        // Use dynamic emoji map loaded from JSON
        return this.emojiMap[word] || '✨';
    }

    backToMenu() {
        this.gameView.classList.remove('active');
        this.menuView.style.display = 'flex';
        this.msgEl.classList.add('hidden');
    }

    // --- GAME LOGIC ---
    loadLetter(char) {
        let data = null;
        if (window.GAME_CONTENT && window.GAME_CONTENT.packs) {
            for (const pack of window.GAME_CONTENT.packs) {
                if (pack.items && pack.items[char]) {
                    data = pack.items[char];
                    break;
                }
            }
        }

        if (!data) {
            this.nextLetter(); 
            return;
        }

        let instructionData = [];
        if (Array.isArray(data)) instructionData = data;
        else if (data.strokes) instructionData = data.strokes;

        this.strokes = instructionData.map(instr => this.generatePoints(instr));
        this.resetProgress();
    }

    resetProgress() {
        this.strokeProgress = this.strokes.map(() => 0);
        this.strokeDone = this.strokes.map(() => false);
        this.isDrawing = false;
        this.msgEl.classList.add('hidden');
        this.draw();
    }

    playLetterAudio(char) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(char.toUpperCase());
            utter.rate = this.voiceRate;
            window.speechSynthesis.speak(utter);
        }
    }

    nextLetter() {
        this.letterIndex++;
        if (this.letterIndex >= this.currentWord.length) {
            this.handleWordComplete();
        } else {
            this.loadLetter(this.currentWord[this.letterIndex]);
            this.updateProgressBar();
        }
    }

    handleWordComplete() {
        const center = this.toPixels({x:50, y:50});
        this.createParticles(center.x, center.y);

        const prefixes = this.globalAudio['A'] || ["Great job", "Awesome"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middle = `The word is ${this.currentWord}`;
        const suffixes = this.globalAudio['C'] || ["Way to go", "You did it"];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        const fullText = `${prefix}. ${middle}. ${suffix}`;

        this.msgEl.textContent = fullText;
        this.msgEl.classList.remove('hidden');

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(fullText);
            utter.rate = this.voiceRate;
            utter.onend = () => setTimeout(() => this.backToMenu(), 1000);
            window.speechSynthesis.speak(utter);
        } else {
            setTimeout(() => this.backToMenu(), 3000);
        }
    }

    updateProgressBar() {
        this.progressEl.innerHTML = '';
        for (let i = 0; i < this.currentWord.length; i++) {
            const char = this.currentWord[i];
            const span = document.createElement('span');
            span.className = 'progress-letter';
            span.textContent = char;
            if (i < this.letterIndex) span.classList.add('done');
            if (i === this.letterIndex) span.classList.add('active');
            this.progressEl.appendChild(span);
        }
    }

    // --- DRAWING ---
    loop() {
        if (this.gameView.classList.contains('active')) {
            this.ghostT += 0.015;
            if (this.ghostT > 1) this.ghostT = 0;
            this.draw();
            this.updateParticles();
        }
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);
        
        // Lines
        const top = this.toPixels({x:0, y:0}).y; 
        const mid = this.toPixels({x:0, y:50}).y;
        const bot = this.toPixels({x:0, y:100}).y;
        
        // Paper Background
        ctx.beginPath(); ctx.strokeStyle = '#a3c4dc'; ctx.lineWidth = 2; 
        ctx.moveTo(0, top); ctx.lineTo(w, top); ctx.stroke();
        
        ctx.beginPath(); ctx.strokeStyle = '#ffb7b2'; 
        ctx.setLineDash([15, 15]); 
        ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke(); 
        ctx.setLineDash([]); 

        ctx.beginPath(); ctx.strokeStyle = '#a3c4dc'; 
        ctx.moveTo(0, bot); ctx.lineTo(w, bot); ctx.stroke();

        // Guides
        if (this.guidanceMode !== 'off') {
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            this.strokes.forEach(stroke => {
                const pts = stroke.map(p => this.toPixels(p));
                ctx.beginPath(); ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 30;
                ctx.moveTo(pts[0].x, pts[0].y);
                for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke();

                ctx.beginPath(); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; 
                ctx.setLineDash([10, 10]);
                ctx.moveTo(pts[0].x, pts[0].y);
                for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke(); ctx.setLineDash([]);
            });
        }

        // Ink
        ctx.strokeStyle = '#4a90e2'; ctx.lineWidth = 25;
        this.strokes.forEach((stroke, sIdx) => {
            const progress = this.strokeProgress[sIdx];
            if (progress > 0) {
                const pts = stroke.map(p => this.toPixels(p));
                ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
                for(let i=1; i < progress; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke();
            }
        });

        this.drawGuidance(ctx);
    }

    drawGuidance(ctx) {
        if (this.guidanceMode === 'off' || this.guidanceMode === 'loose') return;
        let sIdx = this.strokeDone.findIndex(d => !d);
        if (sIdx === -1) return; 

        const stroke = this.strokes[sIdx];
        const pIdx = this.strokeProgress[sIdx];
        const pts = stroke.map(p => this.toPixels(p));

        if (this.guidanceMode === 'ghost_plus') {
            const floatIdx = this.ghostT * (pts.length - 1);
            const idx = Math.floor(floatIdx);
            const t = floatIdx - idx;
            if (idx < pts.length - 1) {
                const p1 = pts[idx]; const p2 = pts[idx+1];
                const x = p1.x + (p2.x - p1.x) * t;
                const y = p1.y + (p2.y - p1.y) * t;
                ctx.fillStyle = 'rgba(255, 87, 34, 0.4)'; 
                ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI*2); ctx.fill();
            }
        }

        if (this.guidanceMode === 'strict' || this.guidanceMode === 'ghost_plus') {
            const nextPt = pts[pIdx];
            if (nextPt) {
                const pulse = 10 + Math.sin(Date.now() / 200) * 3;
                ctx.fillStyle = '#FF5722'; 
                ctx.beginPath(); ctx.arc(nextPt.x, nextPt.y, pulse, 0, Math.PI*2); ctx.fill();
                ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
            }
        }
    }

    // --- INPUT ---
    startDraw(e) {
        this.isDrawing = true;
        this.canvas.setPointerCapture(e.pointerId);
        this.lastPos = this.getPos(e);
        this.checkPoint(this.lastPos);
    }
    moveDraw(e) {
        if (!this.isDrawing) return;
        const newPos = this.getPos(e);
        if (this.lastPos) {
            const dist = Math.hypot(newPos.x - this.lastPos.x, newPos.y - this.lastPos.y);
            const steps = Math.ceil(dist / 5);
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const ix = this.lastPos.x + (newPos.x - this.lastPos.x) * t;
                const iy = this.lastPos.y + (newPos.y - this.lastPos.y) * t;
                this.checkPoint({x: ix, y: iy});
            }
        }
        this.lastPos = newPos;
        this.draw();
    }
    endDraw() { this.isDrawing = false; }

    checkPoint(pos) {
        const check = (idx) => {
            const stroke = this.strokes[idx];
            const pIdx = this.strokeProgress[idx];
            const maxCheck = Math.min(pIdx + 3, stroke.length - 1);
            for (let i = pIdx; i <= maxCheck; i++) {
                const target = this.toPixels(stroke[i]);
                if (Math.hypot(pos.x - target.x, pos.y - target.y) < 45) {
                    this.strokeProgress[idx] = i + 1;
                    if (this.strokeProgress[idx] >= stroke.length) {
                        this.strokeDone[idx] = true;
                        
                        if (this.strokeDone.every(d => d)) {
                            this.playLetterAudio(this.currentWord[this.letterIndex]);
                            setTimeout(() => this.nextLetter(), 1000);
                        }
                    }
                    return true;
                }
            }
            return false;
        };

        if (this.guidanceMode === 'loose') {
            this.strokes.forEach((_, i) => { if (!this.strokeDone[i]) check(i); });
        } else {
            const sIdx = this.strokeDone.findIndex(d => !d);
            if (sIdx !== -1) check(sIdx);
        }
    }

    // --- UTILS ---
    generatePoints(instruction) {
        const points = []; const DENSITY = 4;
        if (instruction.type === 'complex') {
            instruction.parts.forEach(part => points.push(...this.generatePoints(part))); return points;
        }
        if (instruction.type === 'line') {
            const [x1, y1] = instruction.start; const [x2, y2] = instruction.end;
            const dist = Math.hypot(x2 - x1, y2 - y1); const steps = Math.ceil(dist / DENSITY);
            for (let i = 0; i <= steps; i++) { points.push({ x: x1 + (x2 - x1) * (i / steps), y: y1 + (y2 - y1) * (i / steps) }); }
        }
        if (instruction.type === 'arc') {
            const { cx, cy, rx, ry, start, end } = instruction; const isCCW = instruction.direction === 'ccw';
            let angleRange = Math.abs(end - start); if (angleRange === 0 && isCCW) angleRange = 360; 
            const steps = Math.ceil(((angleRange / 180) * Math.PI * ((rx+ry)/2)) / DENSITY);
            const toRad = Math.PI / 180;
            for (let i = 0; i <= steps; i++) {
                let factor = i / steps; if (isCCW) factor = 1 - factor;
                const theta = (start + (end - start) * factor) * toRad;
                points.push({ x: cx + rx * Math.cos(theta), y: cy + ry * Math.sin(theta) });
            }
            if (isCCW) points.reverse();
        }
        return points;
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }
    toPixels(pt) {
        var w = this.canvas.width;
        var h = this.canvas.height;
        var aspectRatio = 0.8;
        var padding = 20;
        var availW = w - (padding * 2);

        var boxW = availW;
        var boxH = boxW / aspectRatio;

        if (boxH > h - 40) {
            boxH = h - 40;
            boxW = boxH * aspectRatio;
        }

        // Account for descenders (y, g, p, q, j go below baseline)
        // Map y range from -5 to 140 (145 units total) to show full descenders
        var yMin = -5;
        var yMax = 140;
        var yRange = yMax - yMin; // 145

        var offsetX = (w - boxW) / 2;
        var offsetY = (h - boxH) / 2;

        return {
            x: offsetX + (pt.x / 100) * boxW,
            y: offsetY + ((pt.y - yMin) / yRange) * boxH
        };
    }
    getPos(e) { const rect = this.canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }

    setupEvents() {
        var self = this;
        window.addEventListener('resize', function() { self.resize(); });

        if(this.backToMenuBtn) {
            this.backToMenuBtn.onclick = function() { self.backToMenu(); };
        }

        if(this.modeSelectEl) {
            this.modeSelectEl.onchange = function(e) {
                self.guidanceMode = e.target.value;
                self.draw();
            };
        }

        this.saveBtn.onclick = function() { self.saveNewWord(); };
        this.cancelBtn.onclick = function() { self.closeModal(); };

        this.canvas.addEventListener('pointerdown', function(e) { self.startDraw(e); });
        this.canvas.addEventListener('pointermove', function(e) { self.moveDraw(e); });
        this.canvas.addEventListener('pointerup', function() { self.endDraw(); });

        // Browser back/forward button support
        window.addEventListener('popstate', function(e) {
            var params = self.parseURLParams();
            if (params.word) {
                self.loadFromURL(params);
            } else {
                // No parameters - return to menu
                self.backToMenu();
            }
        });
    }

    createParticles(x, y) { for(let i=0; i<30; i++) { this.particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1.0, color: ['#ff0', '#f00', '#0f0', '#00f'][Math.floor(Math.random()*4)] }); } }
    updateParticles() {
        if (this.particles.length === 0) return;
        this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; p.vy += 0.2; this.ctx.globalAlpha = p.life; this.ctx.fillStyle = p.color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 5, 0, Math.PI*2); this.ctx.fill(); });
        this.ctx.globalAlpha = 1.0; this.particles = this.particles.filter(p => p.life > 0);
    }
}

window.onload = () => new WordGame();