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

        // Mobile Detection & Performance Config
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.targetFPS = this.isMobile ? 30 : 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.enableShadows = !this.isMobile;
        this.maxParticles = this.isMobile ? 30 : 100;

        // Log detection for debugging
        console.log('[Slots] Mobile detected:', this.isMobile);
        console.log('[Slots] User Agent:', navigator.userAgent);
        console.log('[Slots] Target FPS:', this.targetFPS);
        console.log('[Slots] Shadows enabled:', this.enableShadows);

        // Debug & Performance Tracking
        this.debugEnabled = false;
        this.frameCount = 0;
        this.fpsUpdateTime = Date.now();
        this.currentFPS = 0;

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

        // 3D Rendering State
        this.enable3D = true; // Toggle for 3D rendering
        this.reelRotations = [0, 0, 0, 0, 0]; // Rotation angles in radians
        this.reelAngularVelocity = [0, 0, 0, 0, 0]; // Rad/frame
        this.cylinderSegments = this.isMobile ? 4 : 8; // Number of visible faces per cylinder
        this.cylinderRadius = 50; // Will be updated after canvas resize
        this.lastTickAngles = [0, 0, 0, 0, 0]; // For tick sound timing
        this.reelStopTimes = [0, 0, 0, 0, 0]; // When each reel should start stopping

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
        this.cylinderRadius = this.rowHeight / 2; // Update cylinder radius
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
            // Increase from 7 to 12 symbols for better 3D cylinder coverage
            const symbolCount = this.enable3D ? 12 : 7;
            for(let j=0; j<symbolCount; j++) col.push(this.getRandomSymbol());
            this.reelData.push(col);
        }
    }

    spin() {
        if(this.isSpinning) {
            // Quick Stop - complete the spin instantly
            if (this.enable3D) {
                // Snap all reels to final positions
                for(let i = 0; i < 5; i++) {
                    this.snapReelToSymbol(i);
                    this.reelAngularVelocity[i] = 0;
                    if(this.audio) this.audio.playReelStop();
                }
            } else {
                // 2D mode - snap to aligned positions
                this.reelSpeeds.fill(0);
                this.reelOffsets.fill(0);
            }
            // End the spin immediately
            this.isSpinning = false;
            this.endSpin();
            return;
        }

        // Trigger lever pull animation
        const spinBtn = document.getElementById('spinButton');
        if(spinBtn) {
            spinBtn.classList.add('lever-pull');
            setTimeout(() => spinBtn.classList.remove('lever-pull'), 600);
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

        if (this.enable3D) {
            // Initialize 3D rotational animation
            this.reelAngularVelocity = [
                0.4 + Math.random() * 0.1,
                0.4 + Math.random() * 0.1,
                0.4 + Math.random() * 0.1,
                0.4 + Math.random() * 0.1,
                0.4 + Math.random() * 0.1
            ];
            // Stagger stop times (sequential stopping)
            this.reelStopTimes = [2000, 2200, 2400, 2600, 2800];
            this.lastTickAngles = [0, 0, 0, 0, 0];
        } else {
            // Original 2D animation
            this.reelSpeeds = this.reelSpeeds.map(() => 25 + Math.random() * 10);
        }

        this.generateReelData();
        this.spinStartTime = Date.now();

        if(this.audio) this.audio.playClick();
        this.animate();
    }

    animate() {
        const now = Date.now();
        const elapsed = now - this.lastFrameTime;

        // Throttle frame rate - skip frame if not enough time has passed
        if (elapsed < this.frameInterval) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.lastFrameTime = now - (elapsed % this.frameInterval);

        // FPS Tracking
        this.frameCount++;
        if (now - this.fpsUpdateTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = now;
            if (this.debugEnabled) this.updateDebugOverlay();
        }

        let active = false;

        for(let i=0; i<5; i++) {
            if (this.enable3D) {
                // 3D rotational animation
                if(this.reelAngularVelocity[i] > 0) {
                    if(now - this.spinStartTime > this.reelStopTimes[i]) {
                        // Apply deceleration
                        this.reelAngularVelocity[i] *= 0.90;

                        if(this.reelAngularVelocity[i] < 0.02) {
                            this.reelAngularVelocity[i] = 0;
                            this.snapReelToSymbol(i);
                            if(this.audio) this.audio.playReelStop(); // Mechanical stop sound
                        } else {
                            active = true;
                        }
                    } else {
                        active = true;
                    }

                    // Update rotation
                    this.reelRotations[i] += this.reelAngularVelocity[i];

                    // Cycle symbols when full rotation occurs
                    const symbolAngle = (Math.PI * 2) / this.reelData[i].length;
                    if(this.reelRotations[i] >= symbolAngle) {
                        this.reelRotations[i] -= symbolAngle;
                        this.reelData[i].unshift(this.getRandomSymbol());
                        this.reelData[i].pop();
                    }

                    // Play mechanical tick sound at intervals
                    if(this.shouldPlayTick(i)) {
                        if(this.audio) this.audio.playSpinTick(); // Mechanical tick sound
                    }
                }
            } else {
                // Original 2D offset animation
                if(this.reelSpeeds[i] > 0) {
                    if(now - this.spinStartTime > 2000 + (i*200)) {
                        this.reelSpeeds[i] *= 0.92;
                        if(this.reelSpeeds[i] < 0.5) {
                            this.reelSpeeds[i] = 0;
                            this.reelOffsets[i] = 0;
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
                const particleCount = this.isMobile ? 20 : 50;
                for(let k=0; k<particleCount; k++) this.particles.push(new Particle(240, 425, '#ffd700'));
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
        const freeSpinParticleCount = this.isMobile ? 30 : 100;
        for(let k=0; k<freeSpinParticleCount; k++) {
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
            const wildParticleCount = this.isMobile ? 15 : 30;
            for(let k=0; k<wildParticleCount; k++) {
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

        if (this.enable3D) {
            // 3D Cylinder Rendering
            this.draw3DReels();
        } else {
            // Original 2D flat rendering
            this.draw2DReels();
        }

    }

    drawWinLinesAndEffects() {
        // Win Lines (On Top) - Enhanced Animations with Left-to-Right Progress
        if(!this.isSpinning && this.winningLines.length > 0) {
            // Use simplified rendering on mobile for better performance
            if (this.isMobile) {
                this.drawWinLinesMobile();
            } else {
                this.drawWinLinesDesktop();
            }
        }

        // Symbol Text (only for 2D mode, 3D draws symbols directly)
        if (!this.enable3D) {
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
        }

        // Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }

    // === 3D CYLINDER RENDERING SYSTEM ===

    snapReelToSymbol(reelIndex) {
        // Snap rotation to nearest symbol position
        const symbolAngle = (Math.PI * 2) / this.reelData[reelIndex].length;
        const targetAngle = Math.round(this.reelRotations[reelIndex] / symbolAngle) * symbolAngle;
        this.reelRotations[reelIndex] = targetAngle;
    }

    shouldPlayTick(reelIndex) {
        // Play tick every 45 degrees of rotation
        const tickAngle = Math.PI / 4;
        const lastTick = this.lastTickAngles[reelIndex] || 0;
        const currentAngle = this.reelRotations[reelIndex];

        if (currentAngle - lastTick >= tickAngle) {
            this.lastTickAngles[reelIndex] = currentAngle;
            return true;
        }
        return false;
    }

    draw3DReels() {
        // Hybrid approach: Fixed 4-row grid with 3D rotation effects
        for (let x = 0; x < 5; x++) {
            // Draw cylinder background
            const gradient = this.ctx.createLinearGradient(
                x * this.colWidth, 0,
                (x + 1) * this.colWidth, 0
            );
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(0.5, '#2a2a2a');
            gradient.addColorStop(1, '#1a1a1a');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x * this.colWidth, 0, this.colWidth, this.canvas.height);

            const reelSymbols = this.reelData[x];
            const rotationAngle = this.reelRotations[x];
            const totalSymbols = reelSymbols.length;
            const anglePerSymbol = (Math.PI * 2) / totalSymbols;

            // Calculate rotation offset in symbol units
            const symbolOffset = rotationAngle / anglePerSymbol;

            // We want to display 4 visible rows (index 1-4, skipping 0 which is buffer)
            const visibleSymbols = [];

            for (let row = 1; row <= 4; row++) {
                // Calculate which symbol should be in this row
                const symbolIndex = Math.floor((row - symbolOffset) % totalSymbols);
                const normalizedIndex = symbolIndex >= 0 ? symbolIndex : symbolIndex + totalSymbols;

                const symbol = reelSymbols[normalizedIndex];
                if (!symbol) continue;

                // Calculate this symbol's angle on the cylinder
                const baseAngle = normalizedIndex * anglePerSymbol;
                const currentAngle = (rotationAngle + baseAngle) % (Math.PI * 2);
                const zDepth = Math.sin(currentAngle) * this.cylinderRadius;

                // Fixed grid position - matches 2D formula: (row * rowHeight) - rowHeight
                // When row=1: 1*212.5 - 212.5 = 0 (top of visible area)
                // When row=4: 4*212.5 - 212.5 = 637.5 (bottom row)
                const py = (row * this.rowHeight) - this.rowHeight;

                visibleSymbols.push({ symbol, row, zDepth, py });
            }

            // Sort by depth (back to front)
            visibleSymbols.sort((a, b) => a.zDepth - b.zDepth);

            // Draw symbols in depth order
            for (const item of visibleSymbols) {
                const px = x * this.colWidth;
                this.drawCylinder3D(item.symbol, px, item.py, x, item.row);
            }

            // Divider Lines between reels
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.colWidth, 0);
            this.ctx.lineTo(x * this.colWidth, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw win lines and particles on top
        this.drawWinLinesAndEffects();
    }

    draw2DReels() {
        // Original flat 2D rendering (fallback)
        for(let x=0; x<5; x++) {
            for(let y=0; y<5; y++) {
                if(this.reelData[x][y]) {
                    const s = this.reelData[x][y];
                    const px = x * this.colWidth;
                    const py = (y * this.rowHeight) + this.reelOffsets[x] - this.rowHeight;
                    const isWin = this.winningCells.has(`${x},${y-1}`);

                    this.drawCard(s, px, py, isWin);
                }
            }
            // Divider Lines
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(x*this.colWidth,0);
            this.ctx.lineTo(x*this.colWidth,850);
            this.ctx.stroke();
        }

        // Draw win lines and particles on top
        this.drawWinLinesAndEffects();
    }

    drawCylinder3D(symbol, x, y, reelIndex, row) {
        // In this hybrid approach, y is already the fixed grid position
        // row is the actual row index (1-4) passed from draw3DReels
        // We just need to calculate depth effects for this symbol

        const rotationAngle = this.reelRotations[reelIndex];
        const symbolsPerReel = this.reelData[reelIndex].length;
        const anglePerSymbol = (Math.PI * 2) / symbolsPerReel;

        // Calculate which "slot" this visible row maps to on the cylinder
        const symbolOffset = rotationAngle / anglePerSymbol;
        const symbolIndex = Math.floor((row - symbolOffset) % symbolsPerReel);
        const normalizedIndex = symbolIndex >= 0 ? symbolIndex : symbolIndex + symbolsPerReel;

        // Calculate this symbol's angle on the cylinder
        const baseAngle = normalizedIndex * anglePerSymbol;
        const currentAngle = (rotationAngle + baseAngle) % (Math.PI * 2);

        // Depth calculation
        const zDepth = Math.sin(currentAngle) * this.cylinderRadius;

        // No back-face culling in fixed grid mode - all 4 rows must always be visible

        // Enhanced perspective scaling based on depth
        const perspectiveFactor = 0.5; // Increased from 0.2 to 0.5 for more pronounced 3D effect
        const scale = 1 - (zDepth / this.cylinderRadius) * perspectiveFactor;

        // Calculate lighting (directional light from top-left)
        const lightAngle = Math.PI * 0.75;
        const lightIntensity = Math.max(0.3, Math.cos(currentAngle - lightAngle) * 0.7 + 0.5); // Increased contrast from 0.5 to 0.7

        // Draw at FIXED grid position (no yOffset)
        this.drawCylinderSegment(
            x,
            y,
            scale,
            symbol,
            lightIntensity,
            currentAngle
        );
    }

    drawWinLinesAndEffects() {
        // Win Lines (On Top) - Enhanced Animations with Left-to-Right Progress
        if(!this.isSpinning && this.winningLines.length > 0) {
            // Use simplified rendering on mobile for better performance
            if (this.isMobile) {
                this.drawWinLinesMobile();
            } else {
                this.drawWinLinesDesktop();
            }
        }

        // Symbol Text (only for 2D mode, 3D draws symbols directly)
        if (!this.enable3D) {
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
        }

        // Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }

    drawCylinderSegment(x, y, scale, symbol, lightIntensity, angle) {
        const p = 4; // Standard padding
        const w = this.colWidth - p * 2;
        const h = (this.rowHeight - p * 2) * scale; // Normal height, scaled
        const centerY = y + (this.rowHeight / 2);
        const scaledY = centerY - (h / 2);

        // Safety check for invalid values
        if (!isFinite(scaledY) || !isFinite(h) || h <= 0) {
            return;
        }

        // Add shadow for depth perception
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 4;
        this.ctx.shadowOffsetY = 4;

        // Metallic gradient background with enhanced contrast
        const gradient = this.ctx.createLinearGradient(x + p, scaledY, x + p + w, scaledY + h);

        // Base color influenced by light - increased dynamic range
        const baseGray = Math.floor(60 + lightIntensity * 140); // Changed from 80+120 to 60+140 for more contrast
        gradient.addColorStop(0, `rgb(${baseGray + 60}, ${baseGray + 60}, ${baseGray + 60})`); // Brighter highlights
        gradient.addColorStop(0.5, `rgb(${baseGray}, ${baseGray}, ${baseGray})`);
        gradient.addColorStop(1, `rgb(${baseGray - 50}, ${baseGray - 50}, ${baseGray - 50})`); // Darker shadows

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + p, scaledY, w, h);

        // Reset shadow for edge highlight
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Add stronger metallic edge highlight
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${lightIntensity * 0.5})`; // Increased from 0.3 to 0.5
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + p, scaledY, w, h);

        // Draw symbol with lighting
        this.drawSymbolOnCylinder(symbol, x, centerY, scale, lightIntensity);
    }

    drawSymbolOnCylinder(symbol, x, centerY, scale, lightIntensity) {
        const cx = x + this.colWidth / 2;

        this.ctx.save();
        this.ctx.translate(cx, centerY);
        this.ctx.scale(scale, scale);

        // Symbol brightness based on lighting
        this.ctx.globalAlpha = lightIntensity;
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#fff';

        // Add glow for special symbols
        if (this.enableShadows && (symbol.isWild || symbol.isScatter)) {
            this.ctx.shadowBlur = 15 * lightIntensity;
            this.ctx.shadowColor = symbol.isWild ? '#ff69b4' : '#ffd700';
        }

        this.ctx.fillText(symbol.name, 0, 0);

        if (this.enableShadows) {
            this.ctx.shadowBlur = 0;
        }

        this.ctx.restore();
        this.ctx.globalAlpha = 1.0;
    }

    // Simplified win line rendering for mobile (2 layers, no shadows)
    drawWinLinesMobile() {
        const pulseTime = Date.now() / 300;
        const pulse = Math.sin(pulseTime) * 0.3 + 1;

        this.winningLines.forEach((w, lineIndex) => {
            const linePoints = [];
            for(let c=0; c<5; c++) {
                const r = w.path[c];
                const cx = (c*this.colWidth) + this.colWidth/2;
                const cy = (r*this.rowHeight) + this.rowHeight/2;
                linePoints.push({x: cx, y: cy});
            }

            // Layer 1: Thick colored line
            this.ctx.beginPath();
            linePoints.forEach((pt, i) => {
                if(i===0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            });
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 10 * pulse;
            this.ctx.strokeStyle = w.color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.stroke();

            // Layer 2: Thin white center line
            this.ctx.beginPath();
            linePoints.forEach((pt, i) => {
                if(i===0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            });
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#fff';
            this.ctx.globalAlpha = 0.9;
            this.ctx.stroke();

            this.ctx.globalAlpha = 1.0;
        });
    }

    // Full desktop win line rendering with all effects
    drawWinLinesDesktop() {
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

                // Add sparkle particles along the animated portion (desktop only for performance)
                if(!this.isMobile && Math.random() < 0.2 && segmentsToShow > 0) {
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
            if (this.enableShadows) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#ff69b4';
            }
            this.ctx.strokeRect(x+p, y+p, w, h);
            if (this.enableShadows) {
                this.ctx.shadowBlur = 0;
            }
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
            if (this.enableShadows) {
                const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;
                this.ctx.shadowBlur = 15 + pulse * 10;
                this.ctx.shadowColor = s.isWild ? '#ff69b4' : '#ffd700';
            }
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
            if (this.enableShadows) {
                this.ctx.shadowBlur = 25;
                this.ctx.shadowColor = '#ff69b4';
            }
            this.ctx.fillText(s.name, 0, 0);
            this.ctx.restore();
        } else {
            if(this.winningLines.length > 0 && !this.isSpinning) this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(s.name, cx, cy);
            this.ctx.globalAlpha = 1.0;
        }

        if (this.enableShadows) {
            this.ctx.shadowBlur = 0;
        }
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

    toggleDebug() {
        this.debugEnabled = !this.debugEnabled;
        const overlay = document.getElementById('debugOverlay');
        const btn = document.getElementById('debugButton');
        if (this.debugEnabled) {
            overlay.style.display = 'block';
            btn.style.background = '#0f0';
            btn.style.color = '#000';
            this.updateDebugOverlay();
        } else {
            overlay.style.display = 'none';
            btn.style.background = '';
            btn.style.color = '';
        }
    }

    updateDebugOverlay() {
        if (!this.debugEnabled) return;
        const mode = document.getElementById('debugMode');
        const render3D = document.getElementById('debug3D');
        const fps = document.getElementById('debugFPS');
        const target = document.getElementById('debugTargetFPS');
        const shadows = document.getElementById('debugShadows');
        const particles = document.getElementById('debugParticles');
        const winLines = document.getElementById('debugWinLines');
        const spinning = document.getElementById('debugSpinning');

        if (mode) mode.textContent = this.isMobile ? 'Mobile' : 'Desktop';
        if (render3D) render3D.textContent = this.enable3D ? '3D' : '2D';
        if (fps) fps.textContent = this.currentFPS;
        if (target) target.textContent = this.targetFPS;
        if (shadows) shadows.textContent = this.enableShadows ? 'ON' : 'OFF';
        if (particles) particles.textContent = this.particles ? this.particles.length : 0;
        if (winLines) winLines.textContent = this.winningLines ? this.winningLines.length : 0;
        if (spinning) spinning.textContent = this.isSpinning ? 'YES' : 'NO';
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

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function initGame() {
    try {
        console.log('[Slots] Initializing game...');
        console.log('[Slots] Canvas element:', document.getElementById('slotCanvas'));
        game = new SlotMachine();
        console.log('[Slots] Game initialized successfully');
    } catch (error) {
        console.error('[Slots] Failed to initialize:', error);
        console.error('[Slots] Stack trace:', error.stack);
        alert('Failed to load game: ' + error.message);
    }
}

function spin() {
    if (!game) { console.error('[Slots] Game not initialized'); return; }
    game.spin();
}
function changeBet(v) {
    if (!game) return;
    game.changeBet(v);
}
function changePaylines(v) {
    if (!game) return;
    game.changePaylines(v);
}
function toggleRules() {
    if (!game) return;
    game.toggleRules();
}
function toggleAudio() {
    if (!game) return;
    game.toggleAudio();
}
function toggleDebug() {
    if (!game) return;
    game.toggleDebug();
}
function changeTheme(v) {
    if (!game) return;
    game.changeTheme(v);
}