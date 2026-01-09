/**
 * DAD'S SLOTS - GAME ENGINE
 * File: js/slots.js
 * Version: 3.0 (Scale Manager & Layout Fix)
 */

const GAME_CONFIG = {
    grid: { reels: 5, rows: 4, symbolSize: 100 },
    economy: { startingBalance: 100.00, minBet: 0.50, maxBet: 5.00, betIncrement: 0.50 },
    math: { baseWinChance: 50 },
    design: { width: 480, height: 850 } // The Reference Resolution
};

class SlotMachine {
    constructor() {
        this.canvas = document.getElementById('slotCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Audio Link
        this.audio = typeof SlotAudio !== 'undefined' ? new SlotAudio() : null;
        if(this.audio) this.audio.init();

        // Defaults
        const saved = this.loadGame();
        this.playerBalance = saved.balance;
        this.currentBet = saved.bet;
        this.activePaylinesCount = 20;
        this.currentThemeKey = saved.theme;
        this.totalWon = 0;
        this.dadModeWinChance = GAME_CONFIG.math.baseWinChance;
        
        // Load Data
        if (typeof THEME_LIBRARY !== 'undefined') {
            this.library = THEME_LIBRARY;
        } else {
            console.error("Themes not loaded");
            this.library = this.getBackupLibrary();
        }

        // Animation State
        this.isSpinning = false;
        this.reelOffsets = [0,0,0,0,0];
        this.reelSpeeds = [0,0,0,0,0];
        this.reelData = [];
        this.winningLines = [];
        this.winningCells = new Set();
        this.particles = [];
        this.winTimestamp = 0;
        this.winAnimationActive = false;

        // Bonus System
        this.bonusMode = null; // 'freespins', 'expandingwilds', or null
        this.freeSpinsRemaining = 0;
        this.freeSpinsMultiplier = 1;
        this.cascadeActive = false;
        this.cascadeMultiplier = 1;
        this.expandedWildReels = new Set();
        this.bonusTriggered = false;

        // Init
        this.initScaleManager(); // START THE SCALER
        this.initTouchFeedback(); // Add touch feedback
        this.populateThemeDropdown();
        this.loadTheme(this.currentThemeKey);
        this.generateReelData();
        this.updateUI();
    }

    // --- Touch Feedback Enhancement ---
    initTouchFeedback() {
        // Add visual feedback for all buttons
        const buttons = document.querySelectorAll('button, .circle-btn, .spin-btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                // Haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Very short vibration
                }
                // Add pressed class for visual feedback
                btn.classList.add('touch-active');
            }, { passive: true });

            btn.addEventListener('touchend', () => {
                btn.classList.remove('touch-active');
            }, { passive: true });

            btn.addEventListener('touchcancel', () => {
                btn.classList.remove('touch-active');
            }, { passive: true });
        });

        // Prevent pull-to-refresh on the game container
        document.body.addEventListener('touchmove', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // --- 1. SCALE MANAGER (The Fix for Mobile Jank) ---
    initScaleManager() {
        window.addEventListener('resize', () => this.autoResize());
        this.autoResize(); // Initial call
    }

    autoResize() {
        const scaler = document.getElementById('gameScaler');
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const baseW = GAME_CONFIG.design.width;
        const baseH = GAME_CONFIG.design.height;

        // Calculate scale to fit CONTAIN (Always visible)
        const scaleX = winW / baseW;
        const scaleY = winH / baseH;
        let scale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave a tiny margin

        // Adjust for landscape mode on mobile
        if (window.matchMedia("(orientation: landscape)").matches && winH < 600) {
            scale = Math.min(scaleX, scaleY) * 0.9; // More aggressive scaling in landscape
        }

        scaler.style.transform = `scale(${scale})`;
        scaler.style.transformOrigin = 'center center';

        // Force Canvas Resize
        this.resizeCanvas();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        // Set display size (CSS pixels)
        const displayWidth = container.clientWidth;
        const displayHeight = container.clientHeight;

        // Set actual canvas size (device pixels) for retina displays
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;

        // Use setTransform to reset and scale (prevents compound scaling)
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Set canvas display size
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        this.colWidth = displayWidth / GAME_CONFIG.grid.reels;
        this.rowHeight = displayHeight / GAME_CONFIG.grid.rows;
        this.drawGameFrame();
    }

    // --- 2. LOGIC ---
    getBackupLibrary() {
        return { 'fantasy': { name: 'Backup', paylineColor: '#ffd700', symbols: [{id:'1', name:'?', value:5}] } };
    }

    populateThemeDropdown() {
        const selector = document.getElementById('themeSelector');
        if(!selector) return;
        selector.innerHTML = '';
        for (const [key, data] of Object.entries(this.library)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = data.name;
            selector.appendChild(option);
        }
        selector.value = this.currentThemeKey;
    }

    loadTheme(key) {
        if (!this.library[key]) key = Object.keys(this.library)[0];
        this.currentThemeKey = key;
        this.currentTheme = this.library[key];
        this.activeSymbols = this.currentTheme.symbols;
        this.saveGame();

        // Load background music for this theme
        if (slotAudio && this.currentTheme.bgMusic) {
            slotAudio.loadBackgroundMusic(this.currentTheme.bgMusic);
        }

        // Update Paytable HTML
        const tbl = document.getElementById('paytableContent');
        if(tbl) {
            let html = '';
            [...this.activeSymbols].reverse().forEach(s => {
                if(s.value > 0) html += `<div class="pay-row"><div class="pay-icon">${s.name}</div><div class="pay-info">5x: ${(s.value*5)} | 3x: ${s.value}</div></div>`;
                else html += `<div class="pay-row"><div class="pay-icon">${s.name}</div><div class="pay-info">${s.isWild?'WILD':'SCATTER'}</div></div>`;
            });
            tbl.innerHTML = html;
        }
    }

    changeTheme(key) {
        this.loadTheme(key);
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        this.generateReelData();
        this.drawGameFrame();
    }

    getRandomSymbol() {
        const lucky = Math.random() * 100 < this.dadModeWinChance;
        let pool = this.activeSymbols;
        if(lucky && Math.random() > 0.5) pool = this.activeSymbols.filter(s => s.value > 10 || s.isWild);
        
        const totalW = pool.reduce((a,b) => a + b.weight, 0);
        let r = Math.random() * totalW;
        for(let s of pool) {
            if(r < s.weight) return s;
            r -= s.weight;
        }
        return pool[0];
    }

    generateReelData() {
        this.reelData = [];
        for(let i=0; i<5; i++) {
            const col = [];
            for(let j=0; j<7; j++) col.push(this.getRandomSymbol());
            this.reelData.push(col);
        }
    }

    spin() {
        if(this.isSpinning) {
            this.reelSpeeds.fill(0); this.reelOffsets.fill(0); // Quick Stop
            return;
        }

        // Check if we're in free spins mode
        const isFreeSpins = this.freeSpinsRemaining > 0;

        if(!isFreeSpins && this.playerBalance < this.currentBet) {
            this.showToast("Not enough cash!", "error");
            if(this.audio) this.audio.playError();
            return;
        }

        // Deduct bet only if not in free spins
        if(!isFreeSpins) {
            this.playerBalance -= this.currentBet;
        } else {
            this.freeSpinsRemaining--;
        }

        this.isSpinning = true;
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        this.cascadeMultiplier = 1; // Reset cascade multiplier
        this.bonusTriggered = false;

        const overlay = document.getElementById('winOverlay');
        if(overlay) overlay.classList.remove('active');

        this.updateUI();
        this.saveGame();

        this.reelSpeeds = this.reelSpeeds.map(() => 25 + Math.random() * 10);
        this.generateReelData();
        this.spinStartTime = Date.now();

        if(this.audio) this.audio.playClick();
        this.animate();
    }

    animate() {
        const now = Date.now();
        let active = false;

        for(let i=0; i<5; i++) {
            if(this.reelSpeeds[i] > 0) {
                if(now - this.spinStartTime > 2000 + (i*200)) {
                    this.reelSpeeds[i] *= 0.92;
                    if(this.reelSpeeds[i] < 0.5) {
                        this.reelSpeeds[i] = 0;
                        this.reelOffsets[i] = 0;
                        // if(this.audio) this.audio.playClick(); // Tick sound
                    } else active = true;
                } else active = true;

                this.reelOffsets[i] += this.reelSpeeds[i];
                if(this.reelOffsets[i] > this.rowHeight) {
                    this.reelOffsets[i] -= this.rowHeight;
                    this.reelData[i].unshift(this.getRandomSymbol());
                    this.reelData[i].pop();
                }
            }
        }

        this.drawGameFrame();

        if(active) requestAnimationFrame(() => this.animate());
        else this.endSpin();
    }

    endSpin() {
        this.isSpinning = false;
        this.checkExpandingWilds(); // Check for expanding wilds first
        this.evaluateWins();
        this.updateUI();
        this.saveGame();

        if(this.winningLines.length > 0) {
            this.winTimestamp = Date.now();
            this.startWinAnimation();
            // After win animation, check for cascades
            setTimeout(() => this.checkCascade(), 2000);
        } else {
            if(this.audio) this.audio.playNoWin();
            this.checkBonusEnd();
        }
    }

    checkBonusEnd() {
        // Check if free spins ended
        if(this.freeSpinsRemaining === 0 && this.bonusMode === 'freespins') {
            this.bonusMode = null;
            this.freeSpinsMultiplier = 1;
            this.showToast("🦄 Free Spins Complete! 🦄", "win");
        }
    }

    // --- WIN LOGIC ---
    evaluateWins() {
        let winAmount = 0;
        this.winningLines = [];
        this.winningCells.clear();

        // Check for scatter bonus (Free Spins)
        const scatterCount = this.countScatters();
        if(scatterCount >= 3 && !this.bonusTriggered) {
            this.triggerFreeSpins(scatterCount);
            this.bonusTriggered = true;
        }

        // 20 Lines Logic
        const patterns = [
            [0,0,0,0,0], [1,1,1,1,1], [2,2,2,2,2], [3,3,3,3,3], // Rows
            [0,1,2,1,0], [3,2,1,2,3], // V shapes
            [0,1,2,3,3], [3,2,1,0,0], // Diagonals
            [1,0,1,2,1], [2,3,2,1,2], // ZigZags
            [0,0,1,2,3], [3,3,2,1,0], [1,2,3,2,1], [2,1,0,1,2], // More patterns
            [0,1,1,1,0], [3,2,2,2,3], [1,1,2,2,2], [2,2,1,1,1],
            [0,0,0,1,2], [3,3,3,2,1]
        ];

        for(let i=0; i< Math.min(this.activePaylinesCount, patterns.length); i++) {
            const path = patterns[i];
            const symbols = [];
            for(let c=0; c<5; c++) symbols.push(this.reelData[c][path[c] + 1]); // +1 visual offset

            const match = this.checkMatch(symbols);
            if(match.count >= 3) {
                let prize = match.symbol.value * match.count * (this.currentBet * 0.1);

                // Apply bonus multipliers
                if(this.freeSpinsRemaining > 0) {
                    prize *= this.freeSpinsMultiplier;
                }
                if(this.cascadeMultiplier > 1) {
                    prize *= this.cascadeMultiplier;
                }

                winAmount += prize;
                this.winningLines.push({ path: path, color: this.currentTheme.paylineColor });
                for(let c=0; c<match.count; c++) this.winningCells.add(`${c},${path[c]}`);
            }
        }

        if(winAmount > 0) {
            this.playerBalance += winAmount;
            this.totalWon += winAmount;

            const isBig = winAmount > this.currentBet * 10;
            const overlay = document.getElementById('winOverlay');
            if(overlay) overlay.classList.add('active');

            let msg = `WIN: $${winAmount.toFixed(2)}`;
            if(this.cascadeMultiplier > 1) msg = `💫 ${this.cascadeMultiplier}x CASCADE: $${winAmount.toFixed(2)}`;
            if(this.freeSpinsRemaining > 0) msg = `🦄 FREE SPIN WIN: $${winAmount.toFixed(2)}`;
            if(isBig) msg = `💎 BIG WIN: $${winAmount.toFixed(2)}`;

            this.showToast(msg, "win");
            if(this.audio) isBig ? this.audio.playBigWin() : this.audio.playWin(winAmount);

            if(isBig) {
                for(let k=0; k<50; k++) this.particles.push(new Particle(240, 425, '#ffd700'));
            }
        }
    }

    countScatters() {
        let count = 0;
        for(let x=0; x<5; x++) {
            for(let y=1; y<5; y++) { // Only visible rows
                if(this.reelData[x][y] && this.reelData[x][y].isScatter) {
                    count++;
                }
            }
        }
        return count;
    }

    triggerFreeSpins(scatterCount) {
        const spins = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 20;
        const multiplier = scatterCount === 3 ? 2 : scatterCount === 4 ? 3 : 5;

        this.freeSpinsRemaining += spins;
        this.freeSpinsMultiplier = multiplier;
        this.bonusMode = 'freespins';

        this.showToast(`🌟 ${spins} FREE SPINS! ${multiplier}x WINS! 🌟`, "win");
        if(this.audio) this.audio.playBigWin();

        // Particle explosion
        for(let k=0; k<100; k++) {
            this.particles.push(new Particle(240, 425, '#ffd700'));
            this.particles.push(new SparkleParticle(240, 425, '#ff69b4'));
        }
    }

    checkMatch(syms) {
        if(!syms[0]) return { count: 0 };
        let first = syms[0];
        let count = 1;
        for(let i=1; i<5; i++) {
            if(syms[i].id === first.id || syms[i].isWild || first.isWild) count++;
            else break;
        }
        return { count: count, symbol: first };
    }

    // --- EXPANDING WILDS BONUS ---
    checkExpandingWilds() {
        this.expandedWildReels.clear();
        let wildCount = 0;

        // Count wilds on screen
        for(let x=0; x<5; x++) {
            for(let y=1; y<5; y++) {
                if(this.reelData[x][y] && this.reelData[x][y].isWild) {
                    wildCount++;
                    this.expandedWildReels.add(x);
                }
            }
        }

        // Trigger if 2+ wilds (more likely during free spins)
        if(wildCount >= 2) {
            this.bonusMode = 'expandingwilds';
            this.expandWilds();
            this.showToast(`🦄 EXPANDING WILDS! 🦄`, "win");

            // Visual effects
            for(let k=0; k<30; k++) {
                this.particles.push(new SparkleParticle(240, 425, '#ff69b4'));
            }
        }
    }

    expandWilds() {
        // Find wild symbol from theme
        const wildSymbol = this.activeSymbols.find(s => s.isWild);
        if(!wildSymbol) return;

        // Expand wilds to fill entire reel
        this.expandedWildReels.forEach(reelIndex => {
            for(let y=1; y<5; y++) {
                this.reelData[reelIndex][y] = wildSymbol;
            }
        });
    }

    // --- CASCADE/AVALANCHE BONUS ---
    checkCascade() {
        if(this.winningCells.size === 0) {
            this.checkBonusEnd();
            return;
        }

        // Remove winning symbols
        this.winningCells.forEach(cellKey => {
            const [x, y] = cellKey.split(',').map(Number);
            // Mark as null to remove
            this.reelData[x][y + 1] = null;
        });

        // Drop symbols down
        this.dropSymbols();

        // Fill empty spaces with new symbols
        this.fillEmptySpaces();

        // Increase cascade multiplier
        this.cascadeMultiplier++;

        // Clear previous win state
        this.winningLines = [];
        this.winningCells.clear();

        // Evaluate new wins with increased multiplier
        setTimeout(() => {
            this.evaluateWins();
            if(this.winningLines.length > 0) {
                this.winTimestamp = Date.now();
                this.startWinAnimation();
                setTimeout(() => this.checkCascade(), 2000); // Continue cascading
            } else {
                this.cascadeMultiplier = 1;
                this.checkBonusEnd();
            }
        }, 500);

        // Redraw
        this.drawGameFrame();
    }

    dropSymbols() {
        for(let x=0; x<5; x++) {
            // Start from bottom, move symbols down
            for(let y=4; y>=1; y--) {
                if(this.reelData[x][y] === null) {
                    // Find symbol above
                    for(let above=y-1; above>=0; above--) {
                        if(this.reelData[x][above] !== null) {
                            this.reelData[x][y] = this.reelData[x][above];
                            this.reelData[x][above] = null;
                            break;
                        }
                    }
                }
            }
        }
    }

    fillEmptySpaces() {
        for(let x=0; x<5; x++) {
            for(let y=0; y<7; y++) {
                if(this.reelData[x][y] === null) {
                    this.reelData[x][y] = this.getRandomSymbol();
                }
            }
        }
    }

    startWinAnimation() {
        if(this.winAnimationActive) return;
        this.winAnimationActive = true;

        const loop = () => {
            if(this.isSpinning) {
                this.winAnimationActive = false;
                return;
            }

            this.drawGameFrame();

            // Particles
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.life > 0);

            if(this.winningLines.length > 0 || this.particles.length > 0) {
                requestAnimationFrame(loop);
            } else {
                this.winAnimationActive = false;
            }
        };
        loop();
    }

    drawGameFrame() {
        if(!this.reelData[0]) return;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        // 1. Symbol Backgrounds
        for(let x=0; x<5; x++) {
            for(let y=0; y<5; y++) {
                if(this.reelData[x][y]) {
                    const s = this.reelData[x][y];
                    const px = x * this.colWidth;
                    const py = (y * this.rowHeight) + this.reelOffsets[x] - this.rowHeight;
                    const isWin = this.winningCells.has(`${x},${y-1}`); // Visual offset check
                    
                    this.drawCard(s, px, py, isWin);
                }
            }
            // Divider Lines
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.beginPath(); this.ctx.moveTo(x*this.colWidth,0); this.ctx.lineTo(x*this.colWidth,850); this.ctx.stroke();
        }

        // 2. Win Lines (On Top) - Enhanced Animations with Left-to-Right Progress
        if(!this.isSpinning && this.winningLines.length > 0) {
            const time = Date.now()/20;
            const pulseTime = Date.now() / 300;
            const pulse = Math.sin(pulseTime) * 0.3 + 1;
            const glowPulse = Math.sin(pulseTime * 2) * 0.4 + 0.6;

            // Calculate animation progress (0 to 1) - loops every 2 seconds
            const animTime = (Date.now() - this.winTimestamp) % 2000;
            const progress = animTime / 2000;

            this.winningLines.forEach((w, lineIndex) => {
                const linePoints = [];
                for(let c=0; c<5; c++) {
                    const r = w.path[c];
                    const cx = (c*this.colWidth) + this.colWidth/2;
                    const cy = (r*this.rowHeight) + this.rowHeight/2;
                    linePoints.push({x: cx, y: cy});
                }

                // Calculate which segments to draw based on progress
                const totalSegments = linePoints.length - 1;
                const currentProgress = (progress + (lineIndex * 0.1)) % 1; // Stagger each line
                const segmentsToShow = currentProgress * (totalSegments + 2); // +2 for smooth loop

                // Draw full line background (subtle)
                this.ctx.beginPath();
                linePoints.forEach((pt, i) => {
                    if(i===0) this.ctx.moveTo(pt.x, pt.y);
                    else this.ctx.lineTo(pt.x, pt.y);
                });
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.lineWidth = 8;
                this.ctx.strokeStyle = w.color;
                this.ctx.globalAlpha = 0.2;
                this.ctx.stroke();

                // Draw animated portion (left to right)
                if(segmentsToShow > 0) {
                    const endSegment = Math.min(Math.floor(segmentsToShow), totalSegments);
                    const partialProgress = segmentsToShow % 1;

                    // Layer 1: Outer glow
                    this.ctx.beginPath();
                    this.ctx.moveTo(linePoints[0].x, linePoints[0].y);
                    for(let i = 1; i <= endSegment; i++) {
                        this.ctx.lineTo(linePoints[i].x, linePoints[i].y);
                    }
                    // Partial segment
                    if(endSegment < totalSegments && partialProgress > 0) {
                        const pt1 = linePoints[endSegment];
                        const pt2 = linePoints[endSegment + 1];
                        const px = pt1.x + (pt2.x - pt1.x) * partialProgress;
                        const py = pt1.y + (pt2.y - pt1.y) * partialProgress;
                        this.ctx.lineTo(px, py);
                    }
                    this.ctx.lineWidth = 18 * pulse;
                    this.ctx.strokeStyle = w.color;
                    this.ctx.globalAlpha = 0.3 * glowPulse;
                    this.ctx.shadowBlur = 30;
                    this.ctx.shadowColor = w.color;
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;

                    // Layer 2: Main line
                    this.ctx.beginPath();
                    this.ctx.moveTo(linePoints[0].x, linePoints[0].y);
                    for(let i = 1; i <= endSegment; i++) {
                        this.ctx.lineTo(linePoints[i].x, linePoints[i].y);
                    }
                    if(endSegment < totalSegments && partialProgress > 0) {
                        const pt1 = linePoints[endSegment];
                        const pt2 = linePoints[endSegment + 1];
                        const px = pt1.x + (pt2.x - pt1.x) * partialProgress;
                        const py = pt1.y + (pt2.y - pt1.y) * partialProgress;
                        this.ctx.lineTo(px, py);
                    }
                    this.ctx.lineWidth = 10 * pulse;
                    this.ctx.strokeStyle = w.color;
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = w.color;
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;

                    // Layer 3: Bright center line
                    this.ctx.beginPath();
                    this.ctx.moveTo(linePoints[0].x, linePoints[0].y);
                    for(let i = 1; i <= endSegment; i++) {
                        this.ctx.lineTo(linePoints[i].x, linePoints[i].y);
                    }
                    if(endSegment < totalSegments && partialProgress > 0) {
                        const pt1 = linePoints[endSegment];
                        const pt2 = linePoints[endSegment + 1];
                        const px = pt1.x + (pt2.x - pt1.x) * partialProgress;
                        const py = pt1.y + (pt2.y - pt1.y) * partialProgress;
                        this.ctx.lineTo(px, py);
                    }
                    this.ctx.lineWidth = 4;
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.globalAlpha = 0.95;
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = '#fff';
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;

                    // Rainbow shimmer trail
                    this.ctx.beginPath();
                    this.ctx.moveTo(linePoints[0].x, linePoints[0].y);
                    for(let i = 1; i <= endSegment; i++) {
                        this.ctx.lineTo(linePoints[i].x, linePoints[i].y);
                    }
                    if(endSegment < totalSegments && partialProgress > 0) {
                        const pt1 = linePoints[endSegment];
                        const pt2 = linePoints[endSegment + 1];
                        const px = pt1.x + (pt2.x - pt1.x) * partialProgress;
                        const py = pt1.y + (pt2.y - pt1.y) * partialProgress;
                        this.ctx.lineTo(px, py);
                    }
                    this.ctx.lineWidth = 2;
                    const hue = ((time * 2) + lineIndex * 60) % 360;
                    this.ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.setLineDash([10, 10]);
                    this.ctx.lineDashOffset = -time;
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);

                    // Glowing endpoint
                    if(endSegment < totalSegments || partialProgress > 0) {
                        let endX, endY;
                        if(partialProgress > 0 && endSegment < totalSegments) {
                            const pt1 = linePoints[endSegment];
                            const pt2 = linePoints[endSegment + 1];
                            endX = pt1.x + (pt2.x - pt1.x) * partialProgress;
                            endY = pt1.y + (pt2.y - pt1.y) * partialProgress;
                        } else {
                            endX = linePoints[endSegment].x;
                            endY = linePoints[endSegment].y;
                        }

                        // Draw glowing circle at endpoint
                        const endPulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
                        this.ctx.beginPath();
                        this.ctx.arc(endX, endY, 15 * endPulse, 0, Math.PI * 2);
                        this.ctx.fillStyle = w.color;
                        this.ctx.globalAlpha = 0.6;
                        this.ctx.shadowBlur = 30;
                        this.ctx.shadowColor = w.color;
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;

                        this.ctx.beginPath();
                        this.ctx.arc(endX, endY, 8, 0, Math.PI * 2);
                        this.ctx.fillStyle = '#fff';
                        this.ctx.globalAlpha = 0.9;
                        this.ctx.fill();
                    }
                }

                this.ctx.globalAlpha = 1.0;

                // Add sparkle particles along the animated portion
                if(Math.random() < 0.2 && segmentsToShow > 0) {
                    const randomSegment = Math.random() * segmentsToShow;
                    const segIdx = Math.floor(randomSegment);
                    if(segIdx < linePoints.length - 1) {
                        const pt1 = linePoints[segIdx];
                        const pt2 = linePoints[segIdx + 1];
                        const t = randomSegment % 1;
                        const sparkleX = pt1.x + (pt2.x - pt1.x) * t;
                        const sparkleY = pt1.y + (pt2.y - pt1.y) * t;
                        this.particles.push(new SparkleParticle(sparkleX, sparkleY, w.color));
                    }
                }
            });
        }

        // 3. Symbol Text (On Top of Lines)
        for(let x=0; x<5; x++) {
            for(let y=0; y<5; y++) {
                if(this.reelData[x][y]) {
                    const s = this.reelData[x][y];
                    const px = x * this.colWidth;
                    const py = (y * this.rowHeight) + this.reelOffsets[x] - this.rowHeight;
                    const isWin = this.winningCells.has(`${x},${y-1}`);
                    this.drawText(s, px, py, isWin);
                }
            }
        }

        // 4. Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }

    drawCard(s, x, y, win) {
        const p = 4;
        let w = this.colWidth - p*2;
        let h = this.rowHeight - p*2;

        // Check if this is on an expanded wild reel
        const reelIndex = Math.floor(x / this.colWidth);
        const isExpandedWild = this.expandedWildReels.has(reelIndex);

        if(isExpandedWild && s.isWild) {
            // Special glow for expanded wilds
            const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
            this.ctx.fillStyle = '#2d0052';
            this.ctx.fillRect(x+p, y+p, w, h);
            this.ctx.strokeStyle = `rgba(255, 105, 180, ${0.8 + pulse * 0.2})`;
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#ff69b4';
            this.ctx.strokeRect(x+p, y+p, w, h);
            this.ctx.shadowBlur = 0;
        } else if(win) {
            const scale = 1 + Math.sin((Date.now()-this.winTimestamp)/100)*0.05;
            // Background Highlight
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x+p, y+p, w, h);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x+p, y+p, w, h);
        } else if (this.winningLines.length > 0 && !this.isSpinning) {
            this.ctx.globalAlpha = 0.3; // Dim
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(x+p, y+p, w, h);
            this.ctx.globalAlpha = 1.0;
        } else {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(x+p, y+p, w, h);
            this.ctx.strokeStyle = '#444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x+p, y+p, w, h);
        }
    }

    drawText(s, x, y, win) {
        const cx = x + this.colWidth/2;
        const cy = y + this.rowHeight/2;

        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Special effects for wilds and scatters
        const reelIndex = Math.floor(x / this.colWidth);
        const isExpandedWild = this.expandedWildReels.has(reelIndex);

        if(s.isWild || s.isScatter) {
            const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;
            this.ctx.shadowBlur = 15 + pulse * 10;
            this.ctx.shadowColor = s.isWild ? '#ff69b4' : '#ffd700';
        }

        if(win) {
            const scale = 1 + Math.sin((Date.now()-this.winTimestamp)/100)*0.1;
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(scale, scale);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(s.name, 0, 0);
            this.ctx.restore();
        } else if(isExpandedWild && s.isWild) {
            // Expanded wilds get extra large and glowing
            const scale = 1 + Math.sin(Date.now() / 200) * 0.15;
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(scale, scale);
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#ff69b4';
            this.ctx.fillText(s.name, 0, 0);
            this.ctx.restore();
        } else {
            if(this.winningLines.length > 0 && !this.isSpinning) this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(s.name, cx, cy);
            this.ctx.globalAlpha = 1.0;
        }

        this.ctx.shadowBlur = 0;
    }

    // --- PERSISTENCE ---
    saveGame() {
        const data = {
            balance: this.playerBalance,
            bet: this.currentBet,
            theme: this.currentThemeKey
        };
        localStorage.setItem('dadsSlotsSave', JSON.stringify(data));
    }

    loadGame() {
        const saved = localStorage.getItem('dadsSlotsSave');
        if(saved) return JSON.parse(saved);
        return { balance: 100, bet: 1.0, theme: 'fantasy' };
    }

    // UI Helpers
    toggleAudio() {
        if(this.audio) {
            const state = this.audio.toggle();
            document.getElementById('audioButton').textContent = state ? '🔊' : '🔇';
        }
    }
    updateUI() {
        document.getElementById('coinCount').textContent = `$${this.playerBalance.toFixed(2)}`;
        document.getElementById('betAmount').textContent = `$${this.currentBet.toFixed(2)}`;
        document.getElementById('totalWon').textContent = `$${this.totalWon.toFixed(2)}`;

        const btn = document.getElementById('spinButton');
        if(this.freeSpinsRemaining > 0) {
            btn.textContent = `FREE (${this.freeSpinsRemaining})`;
            btn.style.background = 'radial-gradient(circle at 30% 30%, #ffd700, #ff69b4, #9333ea)';
        } else {
            btn.textContent = this.isSpinning ? 'STOP' : 'SPIN';
            btn.style.background = '';
        }

        // Update bonus indicator if it exists
        const bonusIndicator = document.getElementById('bonusIndicator');
        if(bonusIndicator) {
            if(this.freeSpinsRemaining > 0) {
                bonusIndicator.textContent = `🦄 ${this.freeSpinsRemaining} FREE SPINS (${this.freeSpinsMultiplier}x) 🦄`;
                bonusIndicator.style.display = 'block';
            } else if(this.cascadeMultiplier > 1) {
                bonusIndicator.textContent = `💫 CASCADE ${this.cascadeMultiplier}x MULTIPLIER 💫`;
                bonusIndicator.style.display = 'block';
            } else {
                bonusIndicator.style.display = 'none';
            }
        }
    }
    changeBet(d) {
        if(this.isSpinning) return;
        const n = this.currentBet + d;
        if(n>=0.5 && n<=5) { this.currentBet = n; this.updateUI(); }
    }
    changePaylines(d) {
        if(this.isSpinning) return;
        const n = this.activePaylinesCount + d;
        if(n>=1 && n<=20) { this.activePaylinesCount = n; document.getElementById('paylineCount').textContent = n; }
    }
    showToast(msg, type) {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        document.getElementById('toastContainer').appendChild(t);
        setTimeout(()=>t.classList.add('show'),10);
        setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.remove(),500)}, 2000);
    }
    toggleRules() { document.getElementById('rulesModal').classList.toggle('active'); }
}

class Particle {
    constructor(x,y,c) {
        this.x=x; this.y=y; this.c=c;
        const a=Math.random()*Math.PI*2; const s=Math.random()*10+5;
        this.vx=Math.cos(a)*s; this.vy=Math.sin(a)*s;
        this.life=1.0;
    }
    update() { this.x+=this.vx; this.y+=this.vy; this.vy+=0.8; this.life-=0.03; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.life); ctx.fillStyle=this.c;
        ctx.beginPath(); ctx.arc(this.x,this.y,6,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
}

class SparkleParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 1.0;
        this.size = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2 - 1; // Slight upward bias
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Slight gravity
        this.rotation += this.rotationSpeed;
        this.life -= 0.04;
    }
    draw(ctx) {
        if(this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw star/sparkle shape
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        for(let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2);
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Cross pattern
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();

        ctx.restore();
    }
}

let game;
window.onload = () => { game = new SlotMachine(); };
function spin() { game.spin(); }
function changeBet(v) { game.changeBet(v); }
function changePaylines(v) { game.changePaylines(v); }
function toggleRules() { game.toggleRules(); }
function toggleAudio() { game.toggleAudio(); }
function changeTheme(v) { game.changeTheme(v); }