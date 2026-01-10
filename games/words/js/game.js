class LetterGame {
    constructor() {
        // 1. SAFEGUARD: Get the element
        this.canvas = document.getElementById('traceCanvas');
        
        if (!this.canvas) {
            alert("Critical Error: <canvas id='traceCanvas'> not found in HTML.");
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.gridEl = document.getElementById('letterGrid');
        this.msgEl = document.getElementById('message-area');
        this.packSelectEl = document.getElementById('packSelect');
        this.modeSelectEl = document.getElementById('guidanceSelect');
        
        // Settings UI
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.speedSlider = document.getElementById('voiceSpeed');
        this.speedDisplay = document.getElementById('speedDisplay');

        // State
        this.allPacks = [];
        this.currentPack = null;
        this.currentLetter = null;
        this.globalConfig = {}; 
        
        // Path Data
        this.strokes = [];       
        this.userStrokes = [];   
        
        // Progress Tracking
        this.strokeProgress = []; 
        this.strokeDone = [];     
        
        // Game Logic
        this.isDrawing = false;
        this.lastPos = null;
        this.particles = [];
        this.guidanceMode = 'ghost_plus';
        this.voiceRate = 0.9;
        this.ghostT = 0;

        // Initialize
        this.init();
    }

    init() {
        // CHECK: Did the external data load?
        if (window.GAME_CONTENT) {
            this.globalConfig = window.GAME_CONTENT.globalAudio || {};
            this.allPacks = window.GAME_CONTENT.packs;
        } else {
            // --- FALLBACK MODE ---
            // If the ../../ path fails, we use this hardcoded 'A' so the screen isn't blank.
            console.warn("Data file missing! Using Fallback.");
            alert("Note: 'letters-data.js' did not load. Using Fallback Mode (Letter A only). Check your file paths.");
            
            this.allPacks = [{
                name: "Fallback Pack",
                items: {
                    'A': {
                        strokes: [
                            { type: 'line', start: [50, 15], end: [20, 85] },
                            { type: 'line', start: [50, 15], end: [80, 85] },
                            { type: 'line', start: [35, 55], end: [65, 55] }
                        ]
                    }
                }
            }];
        }

        this.populatePackSelector();
        this.setupModeSelector();
        this.setupSettings();

        // Load the first pack if it exists
        if (this.allPacks.length > 0) {
            this.loadPack(0);
        }

        this.setupEvents();
        
        // Slight delay to ensure CSS is applied before we measure size
        setTimeout(() => {
            this.resize();
            this.loop();
        }, 100);
    }

    setupSettings() {
        if(this.settingsBtn) this.settingsBtn.onclick = () => {
            if(this.settingsPanel) this.settingsPanel.classList.toggle('hidden');
        };
        if(this.speedSlider) this.speedSlider.oninput = (e) => {
            this.voiceRate = parseFloat(e.target.value);
            if(this.speedDisplay) this.speedDisplay.textContent = this.voiceRate + "x";
        };
    }

    setupModeSelector() {
        if(this.modeSelectEl) this.modeSelectEl.onchange = (e) => {
            this.guidanceMode = e.target.value;
            this.draw(); 
        };
    }

    populatePackSelector() {
        if(!this.packSelectEl) return;
        this.packSelectEl.innerHTML = '';
        this.allPacks.forEach((pack, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = pack.name;
            this.packSelectEl.appendChild(opt);
        });
        this.packSelectEl.onchange = (e) => this.loadPack(parseInt(e.target.value));
    }

    loadPack(index) {
        if (index < 0 || index >= this.allPacks.length) return;
        this.currentPack = this.allPacks[index];
        if(this.packSelectEl) this.packSelectEl.value = index;
        this.setupGrid();
        
        const firstKey = Object.keys(this.currentPack.items)[0];
        if (firstKey) this.selectLetter(firstKey);
    }

    setupGrid() {
        if(!this.gridEl) return;
        this.gridEl.innerHTML = '';
        const items = this.currentPack.items;
        Object.keys(items).forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.textContent = key;
            btn.onclick = () => this.selectLetter(key);
            this.gridEl.appendChild(btn);
        });
    }

    selectLetter(char) {
        this.currentLetter = char;
        const data = this.currentPack.items[char];
        
        let instructionData = [];
        if (Array.isArray(data)) {
            instructionData = data;
        } else if (data && data.strokes) {
            instructionData = data.strokes;
        }

        this.strokes = instructionData.map(instr => this.generatePoints(instr));
        
        this.resetProgress();
        if(this.msgEl) this.msgEl.classList.add('hidden');
        this.draw();
        
        // Highlight button
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === char) btn.classList.add('active');
        });
    }

    resetProgress() {
        this.strokeProgress = this.strokes.map(() => 0);
        this.strokeDone = this.strokes.map(() => false);
        this.userStrokes = this.strokes.map(() => []); 
        this.isDrawing = false;
        this.lastPos = null;
    }

    // --- AUDIO RESOLUTION SYSTEM ---
    resolveAudioList(componentType) {
        const item = this.currentPack.items[this.currentLetter];
        const pack = this.currentPack;
        const global = this.globalConfig;

        if (item.hasOwnProperty('audioOverride') && item.audioOverride.hasOwnProperty(componentType)) {
            return item.audioOverride[componentType];
        }
        if (pack.hasOwnProperty('audioDefaults') && pack.audioDefaults.hasOwnProperty(componentType)) {
            return pack.audioDefaults[componentType];
        }
        if (global.hasOwnProperty(componentType)) {
            return global[componentType];
        }
        return [];
    }

    checkWin() {
        if (this.strokeDone.every(d => d === true)) {
            
            // Audio Assembly
            const aList = this.resolveAudioList('A');
            const partA = aList.length > 0 ? aList[Math.floor(Math.random() * aList.length)] : "";

            const item = this.currentPack.items[this.currentLetter];
            let partB = "";
            
            if (item.hasOwnProperty('words') && item.words.length > 0) {
                const name = item.name || this.currentLetter;
                const shuffled = [...item.words].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 2);
                partB = `${name} is for ${selected[0]}, and ${selected[1]}`;
            } else {
                const name = item.name || `Letter ${this.currentLetter}`;
                partB = name;
            }

            const cList = this.resolveAudioList('C');
            const partC = cList.length > 0 ? cList[Math.floor(Math.random() * cList.length)] : "";

            const fullText = [partA, partB, partC].filter(s => s.length > 0).join(". ");

            // UI Feedback
            if(this.msgEl) {
                this.msgEl.classList.remove('hidden'); 
                this.msgEl.textContent = fullText;
            }
            
            if ('speechSynthesis' in window) { 
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(fullText);
                utter.pitch = 1.1; 
                utter.rate = this.voiceRate;
                window.speechSynthesis.speak(utter); 
            }
            
            // Particles
            const center = this.toPixels({x:50, y:50}); 
            this.createParticles(center.x, center.y);
        }
    }

    // --- DRAWING ENGINE ---
    loop() {
        this.ghostT += 0.015;
        if (this.ghostT > 1) this.ghostT = 0;
        
        if (this.guidanceMode.includes('ghost') || this.guidanceMode === 'guide' || this.particles.length > 0) {
            this.draw();
        }
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        const w = this.canvas.width; 
        const h = this.canvas.height; 
        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h); 
        this.drawPaperLines(ctx, w, h);

        if (!this.currentLetter) return;

        // Draw Guide Lines (Gray Background)
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        this.strokes.forEach(stroke => {
            const pts = stroke.map(p => this.toPixels(p));
            ctx.beginPath(); ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 30;
            ctx.moveTo(pts[0].x, pts[0].y);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
            
            // Dashed center line
            ctx.beginPath(); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
            ctx.moveTo(pts[0].x, pts[0].y);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke(); ctx.setLineDash([]);
        });

        // Draw User Ink (Green)
        ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 25;
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
        this.updateParticles();
    }

    drawGuidance(ctx) {
        if (this.guidanceMode === 'off' || this.guidanceMode === 'loose') return;

        let targetStrokeIdx = this.strokeDone.findIndex(done => !done);
        if (targetStrokeIdx === -1) return; 

        const stroke = this.strokes[targetStrokeIdx];
        const progressIdx = this.strokeProgress[targetStrokeIdx];
        const pixelPoints = stroke.map(p => this.toPixels(p));

        // 1. Tracer (Ghost Dot) - Faint Orange
        if (this.guidanceMode === 'ghost_plus') {
            const totalPoints = pixelPoints.length;
            const floatIdx = this.ghostT * (totalPoints - 1);
            const idx = Math.floor(floatIdx);
            const t = floatIdx - idx;
            
            if (idx < pixelPoints.length - 1) {
                const p1 = pixelPoints[idx];
                const p2 = pixelPoints[idx+1];
                const x = p1.x + (p2.x - p1.x) * t;
                const y = p1.y + (p2.y - p1.y) * t;
                
                ctx.fillStyle = 'rgba(255, 87, 34, 0.4)'; 
                ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI*2); ctx.fill();
            }
        }

        // 2. Target Dot (Solid Orange)
        if (this.guidanceMode === 'strict' || this.guidanceMode === 'ghost_plus') {
            const nextPt = pixelPoints[progressIdx];
            if (nextPt) {
                const pulse = 10 + Math.sin(Date.now() / 200) * 3;
                
                ctx.fillStyle = '#FF5722'; 
                ctx.beginPath(); ctx.arc(nextPt.x, nextPt.y, pulse, 0, Math.PI*2); ctx.fill();
                
                ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
            }
        }
    }

    // --- INPUT & UTILS ---
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
                const interpX = this.lastPos.x + (newPos.x - this.lastPos.x) * t;
                const interpY = this.lastPos.y + (newPos.y - this.lastPos.y) * t;
                this.checkPoint({x: interpX, y: interpY});
            }
        }
        this.lastPos = newPos;
        this.draw();
    }
    endDraw() { this.isDrawing = false; this.lastPos = null; }

    checkPoint(pos) {
        // Find active stroke
        const sIdx = this.strokeDone.findIndex(d => !d);
        if (sIdx === -1) return;

        const performCheck = (idx) => {
            const stroke = this.strokes[idx];
            const pIdx = this.strokeProgress[idx];
            const maxCheck = Math.min(pIdx + 3, stroke.length - 1);
            for (let i = pIdx; i <= maxCheck; i++) {
                const target = this.toPixels(stroke[i]);
                if (Math.hypot(pos.x - target.x, pos.y - target.y) < 45) {
                    this.strokeProgress[idx] = i + 1;
                    if (this.strokeProgress[idx] >= stroke.length) {
                        this.strokeDone[idx] = true;
                        this.checkWin();
                    }
                    return true;
                }
            }
            return false;
        };

        if (this.guidanceMode === 'loose') {
            this.strokes.forEach((_, idx) => { if(!this.strokeDone[idx]) performCheck(idx); });
        } else {
            performCheck(sIdx);
        }
    }

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

    drawPaperLines(ctx, w, h) {
        const top = this.toPixels({x:0, y:0}).y; const mid = this.toPixels({x:0, y:50}).y; const bot = this.toPixels({x:0, y:100}).y;
        ctx.beginPath(); ctx.strokeStyle = '#a3c4dc'; ctx.lineWidth = 2; ctx.moveTo(0, top); ctx.lineTo(w, top); ctx.stroke();
        ctx.beginPath(); ctx.strokeStyle = '#ffb7b2'; ctx.setLineDash([15, 15]); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.strokeStyle = '#a3c4dc'; ctx.moveTo(0, bot); ctx.lineTo(w, bot); ctx.stroke();
    }
    
    // SCALING LOGIC
    resize() { 
        if(!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect(); 
        this.canvas.width = rect.width; 
        this.canvas.height = rect.height; 
        this.draw(); 
    }
    
    toPixels(pt) {
        const w = this.canvas.width; 
        const h = this.canvas.height;
        // Fix for "Too Tall"
        const aspectRatio = 0.8; 
        const padding = 20;
        const availW = w - (padding * 2);
        const availH = h - (padding * 2);

        let boxH = availH * 0.7; 
        let boxW = boxH * aspectRatio;

        if (boxW > availW) {
            boxW = availW;
            boxH = boxW / aspectRatio;
        }
        const offsetX = (w - boxW) / 2;
        const offsetY = (h - boxH) / 2;
        return { x: offsetX + (pt.x / 100) * boxW, y: offsetY + (pt.y / 100) * boxH };
    }
    
    getPos(e) { const rect = this.canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
    
    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('pointerdown', (e) => this.startDraw(e));
        this.canvas.addEventListener('pointermove', (e) => this.moveDraw(e));
        this.canvas.addEventListener('pointerup', () => this.endDraw());
        this.canvas.addEventListener('pointerleave', () => this.endDraw());
    }
    
    createParticles(x, y) { for(let i=0; i<30; i++) { this.particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1.0, color: ['#ff0', '#f00', '#0f0', '#00f'][Math.floor(Math.random()*4)] }); } }
    
    updateParticles() {
        if (this.particles.length === 0) return;
        this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; p.vy += 0.2; this.ctx.globalAlpha = p.life; this.ctx.fillStyle = p.color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 5, 0, Math.PI*2); this.ctx.fill(); });
        this.ctx.globalAlpha = 1.0; this.particles = this.particles.filter(p => p.life > 0);
        if (this.particles.length > 0) requestAnimationFrame(() => this.draw());
    }
}

window.onload = () => new LetterGame();