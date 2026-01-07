/**
 * DAD'S SLOTS - GAME ENGINE
 * File: js/slots.js
 * Version: 2.0 (Audio + Persistence)
 */

const GAME_CONFIG = {
    grid: { reels: 5, rows: 4, symbolSize: 100 },
    economy: { startingBalance: 100.00, minBet: 0.20, maxBet: 5.00, betIncrement: 0.20 },
    math: { baseWinChance: 50 },
    storage: { key: 'dadsSlots_saveData' }
};

class SlotMachine {
    constructor() {
        this.canvas = document.getElementById('slotCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize audio (requires user interaction to fully enable)
        this.audio = typeof slotAudio !== 'undefined' ? slotAudio : null;
        
        // Load saved data or use defaults
        const savedData = this.loadGame();
        this.playerBalance = savedData.balance ?? GAME_CONFIG.economy.startingBalance;
        this.currentBet = savedData.bet ?? 1.00;
        this.activePaylinesCount = savedData.paylines ?? 20;
        this.currentThemeKey = savedData.theme ?? 'fantasy';
        this.audioEnabled = savedData.audioEnabled ?? true;
        this.totalSpins = savedData.totalSpins ?? 0;
        this.totalWon = savedData.totalWon ?? 0;
        this.biggestWin = savedData.biggestWin ?? 0;
        
        this.dadModeWinChance = GAME_CONFIG.math.baseWinChance;
        this.isSpinning = false;
        
        // PAYLINE SETUP
        this.paylinePatterns = this.generatePaylines();
        
        // LOAD LIBRARY
        if (typeof THEME_LIBRARY !== 'undefined') {
            this.library = THEME_LIBRARY;
        } else {
            console.error("CRITICAL: themes.js not found!");
            this.library = this.getBackupLibrary();
        }

        this.reelOffsets = new Array(GAME_CONFIG.grid.reels).fill(0);
        this.reelSpeeds = new Array(GAME_CONFIG.grid.reels).fill(0);
        this.reelData = [];
        this.reelsStoppedCount = 0;
        
        this.winningLines = [];
        this.winningCells = new Set();
        this.particles = [];
        this.animationFrameId = null;
        this.winTimestamp = 0;
        this.spinTickInterval = null;
        
        this.populateThemeDropdown();
        this.loadTheme(this.currentThemeKey);
        this.generateReelData();
        this.resizeCanvas();
        this.updateUI();
        this.updateAudioButton();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.saveGame());
        
        console.log("🎰 Dad's Slots v2.0 loaded!");
        if (savedData.balance) {
            console.log(`💰 Restored balance: $${this.playerBalance.toFixed(2)}`);
        }
    }

    // --- PERSISTENCE ---
    saveGame() {
        const data = {
            balance: this.playerBalance,
            bet: this.currentBet,
            paylines: this.activePaylinesCount,
            theme: this.currentThemeKey,
            audioEnabled: this.audioEnabled,
            totalSpins: this.totalSpins,
            totalWon: this.totalWon,
            biggestWin: this.biggestWin,
            lastSaved: new Date().toISOString()
        };
        try {
            localStorage.setItem(GAME_CONFIG.storage.key, JSON.stringify(data));
        } catch (e) {
            console.warn("Could not save game:", e);
        }
    }

    loadGame() {
        try {
            const raw = localStorage.getItem(GAME_CONFIG.storage.key);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn("Could not load save data:", e);
        }
        return {};
    }

    clearSaveData() {
        try {
            localStorage.removeItem(GAME_CONFIG.storage.key);
        } catch (e) {
            console.warn("Could not clear save:", e);
        }
    }

    // --- PAYLINE DEFINITIONS (5x4 Grid) ---
    generatePaylines() {
        return [
            { id: 1, path: [0,0,0,0,0] },
            { id: 2, path: [1,1,1,1,1] },
            { id: 3, path: [2,2,2,2,2] },
            { id: 4, path: [3,3,3,3,3] },
            { id: 5, path: [0,1,2,1,0] },
            { id: 6, path: [3,2,1,2,3] },
            { id: 7, path: [0,1,0,1,0] },
            { id: 8, path: [3,2,3,2,3] },
            { id: 9, path: [0,1,2,3,3] },
            { id: 10, path: [3,2,1,0,0] },
            { id: 11, path: [1,2,1,2,1] },
            { id: 12, path: [2,1,2,1,2] },
            { id: 13, path: [1,0,1,0,1] },
            { id: 14, path: [2,3,2,3,2] },
            { id: 15, path: [0,1,1,1,0] },
            { id: 16, path: [3,2,2,2,3] },
            { id: 17, path: [1,2,3,2,1] },
            { id: 18, path: [2,1,0,1,2] },
            { id: 19, path: [0,0,1,0,0] },
            { id: 20, path: [3,3,2,3,3] }
        ];
    }

    getBackupLibrary() {
        return {
            'fantasy': {
                name: 'Backup Theme',
                paylineColor: '#ffd700',
                symbols: [{ id: '1', name: '?', value: 5, weight: 100, color: '#555' }]
            }
        };
    }

    populateThemeDropdown() {
        const selector = document.getElementById('themeSelector');
        if(!selector) return;
        selector.innerHTML = '';
        for (const [key, data] of Object.entries(this.library)) {
            const option = document.createElement('option');
            option.value = key;
            const icon = data.symbols && data.symbols[6] ? data.symbols[6].name : '🎰';
            option.textContent = `${icon} ${data.name}`;
            selector.appendChild(option);
        }
    }

    loadTheme(themeKey) {
        if (!this.library[themeKey]) themeKey = Object.keys(this.library)[0];
        this.currentThemeKey = themeKey;
        this.currentTheme = this.library[themeKey];
        if (!this.currentTheme || !this.currentTheme.symbols) {
            this.currentTheme = this.getBackupLibrary()['fantasy'];
        }
        this.activeSymbols = this.currentTheme.symbols;
        this.generatePaytableHTML();
        const selector = document.getElementById('themeSelector');
        if (selector) selector.value = themeKey;
    }

    generatePaytableHTML() {
        const container = document.getElementById('paytableContent');
        if (!container) return;
        let html = '';
        const sortedSyms = [...this.activeSymbols].reverse();
        sortedSyms.forEach(sym => {
            if (sym.value > 0) {
                html += `<div class="pay-row"><div class="pay-icon">${sym.name}</div><div class="pay-info"><span class="pay-val">5x: ${(sym.value * 5).toFixed(0)}</span><span class="pay-val">4x: ${(sym.value * 3).toFixed(0)}</span><span class="pay-val">3x: ${(sym.value).toFixed(0)}</span></div></div>`;
            } else if (sym.isWild) {
                html += `<div class="pay-row"><div class="pay-icon">${sym.name}</div><div class="pay-info">WILD: Substitutes for all symbols</div></div>`;
            } else if (sym.isScatter) {
                html += `<div class="pay-row"><div class="pay-icon">${sym.name}</div><div class="pay-info">SCATTER: Pays in any position</div></div>`;
            }
        });
        container.innerHTML = html;
    }

    toggleRules() {
        const modal = document.getElementById('rulesModal');
        modal.classList.toggle('active');
        if (this.audio) {
            this.audio.init();
            this.audio.playClick();
        }
    }

    changeTheme(newThemeKey) {
        this.loadTheme(newThemeKey);
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        this.generateReelData();
        this.drawGameFrame();
        this.showToast(`Theme: ${this.currentTheme.name}`, "info");
        this.saveGame();
        if (this.audio) this.audio.playClick();
    }

    toggleAudio() {
        if (this.audio) {
            this.audio.init();
            this.audioEnabled = this.audio.toggle();
            this.updateAudioButton();
            this.saveGame();
            if (this.audioEnabled) this.audio.playClick();
        }
    }

    updateAudioButton() {
        const btn = document.getElementById('audioButton');
        if (btn) {
            btn.textContent = this.audioEnabled ? '🔊' : '🔇';
            btn.title = this.audioEnabled ? 'Sound On' : 'Sound Off';
        }
    }

    resetGame() {
        if (this.audio) this.audio.playClick();
        if (confirm("Reset your balance to $100.00?\n\nThis will also reset your stats.")) {
            this.playerBalance = 100.00;
            this.totalSpins = 0;
            this.totalWon = 0;
            this.biggestWin = 0;
            this.winningLines = [];
            this.winningCells.clear();
            this.clearSaveData();
            this.updateUI();
            this.showToast("Balance Reset!", "info");
            this.drawGameFrame();
        }
    }

    getRandomSymbol() {
        const isLuckySpin = Math.random() * 100 < this.dadModeWinChance;
        let validSymbols = this.activeSymbols;
        if (isLuckySpin && Math.random() > 0.5) validSymbols = this.activeSymbols.filter(s => s.value > 10 || s.isWild);
        const localTotalWeight = validSymbols.reduce((acc, sym) => acc + sym.weight, 0);
        let randomPointer = Math.random() * localTotalWeight;
        for (let symbol of validSymbols) {
            if (randomPointer < symbol.weight) return symbol;
            randomPointer -= symbol.weight;
        }
        return validSymbols[0];
    }

    generateReelData() {
        this.reelData = [];
        for (let i = 0; i < GAME_CONFIG.grid.reels; i++) {
            const strip = [];
            for (let j = 0; j < GAME_CONFIG.grid.rows + 3; j++) {
                strip.push(this.getRandomSymbol());
            }
            this.reelData.push(strip);
        }
    }

    spin() {
        // Initialize audio on first interaction
        if (this.audio) this.audio.init();
        
        if (this.isSpinning) {
            this.quickStop();
            return;
        }
        
        if (this.playerBalance < this.currentBet) {
            this.showToast("Not enough credits!", "error");
            if (this.audio) this.audio.playError();
            return;
        }

        this.playerBalance -= this.currentBet;
        this.totalSpins++;
        this.isSpinning = true;
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        this.reelsStoppedCount = 0;
        
        const overlay = document.getElementById('winOverlay');
        if(overlay) overlay.classList.remove('active');
        
        this.updateUI();
        
        if (this.audio) this.audio.playClick();

        this.reelSpeeds = this.reelSpeeds.map(() => 20 + Math.random() * 10);
        this.generateReelData();
        this.spinStartTime = Date.now();
        
        // Start spin tick sound
        if (this.audio && this.audioEnabled) {
            this.spinTickInterval = setInterval(() => {
                if (this.isSpinning && this.audio) {
                    this.audio.playSpinTick();
                }
            }, 80);
        }
        
        if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animate();
    }

    quickStop() {
        this.reelSpeeds.fill(0);
        this.reelOffsets.fill(0);
    }

    animate() {
        const now = Date.now();
        const duration = 2000;
        let stillSpinning = false;

        for (let i = 0; i < GAME_CONFIG.grid.reels; i++) {
            if (this.reelSpeeds[i] > 0) {
                if (now - this.spinStartTime > duration + (i * 300)) {
                    this.reelSpeeds[i] *= 0.90;
                    if (this.reelSpeeds[i] < 0.5) {
                        this.reelSpeeds[i] = 0;
                        this.reelOffsets[i] = 0;
                        
                        // Play reel stop sound
                        this.reelsStoppedCount++;
                        if (this.audio) this.audio.playReelStop();
                    } else {
                        stillSpinning = true;
                    }
                } else {
                    stillSpinning = true;
                }
                this.reelOffsets[i] += this.reelSpeeds[i];
                if (this.reelOffsets[i] > GAME_CONFIG.grid.symbolSize) {
                    this.reelOffsets[i] -= GAME_CONFIG.grid.symbolSize;
                    this.reelData[i].unshift(this.getRandomSymbol());
                    this.reelData[i].pop();
                }
            }
        }

        this.drawGameFrame();

        if (stillSpinning) {
            this.isSpinning = true;
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } else {
            this.endSpin();
        }
    }

    endSpin() {
        this.isSpinning = false;
        
        // Stop spin tick sound
        if (this.spinTickInterval) {
            clearInterval(this.spinTickInterval);
            this.spinTickInterval = null;
        }
        
        this.evaluateWins();
        this.updateUI();
        this.saveGame();
        
        if (this.winningLines.length > 0) {
            this.winTimestamp = Date.now();
            this.startWinAnimation();
        } else {
            // Small delay then play no-win sound
            setTimeout(() => {
                if (this.audio) this.audio.playNoWin();
            }, 200);
        }
    }

    startWinAnimation() {
        const loop = () => {
            if (this.isSpinning) return;
            this.drawGameFrame();
            
            if (this.particles.length > 0) {
                this.particles.forEach(p => p.update());
                this.particles = this.particles.filter(p => p.life > 0);
            }
            
            this.animationFrameId = requestAnimationFrame(loop);
        };
        loop();
    }

    // --- COMPLEX WIN EVALUATION ---
    evaluateWins() {
        let totalWin = 0;
        this.winningLines = [];
        this.winningCells.clear();

        for (let i = 0; i < this.activePaylinesCount; i++) {
            const pattern = this.paylinePatterns[i];
            
            // Gather symbols (+1 offset for visual alignment)
            const lineSymbols = [];
            for(let col=0; col < GAME_CONFIG.grid.reels; col++) {
                const row = pattern.path[col];
                lineSymbols.push(this.reelData[col][row + 1]);
            }

            const matchData = this.checkLineMatch(lineSymbols);
            
            if (matchData.count >= 3) {
                const payout = matchData.symbol.value * matchData.count * (this.currentBet * 0.1);
                totalWin += payout;
                
                this.winningLines.push({
                    patternIndex: i,
                    path: pattern.path,
                    count: matchData.count,
                    color: this.currentTheme.paylineColor || '#fff'
                });

                for(let col=0; col<matchData.count; col++) {
                    const row = pattern.path[col];
                    this.winningCells.add(`${col},${row}`);
                }
            }
        }

        if (totalWin > 0) {
            this.playerBalance += totalWin;
            this.totalWon += totalWin;
            if (totalWin > this.biggestWin) {
                this.biggestWin = totalWin;
            }
            
            const isJackpot = totalWin >= (this.currentBet * 50);
            const isBigWin = totalWin >= (this.currentBet * 10);
            
            const overlay = document.getElementById('winOverlay');
            if(overlay) overlay.classList.add('active');

            if (isJackpot) {
                this.showToast(`🎉 JACKPOT: $${totalWin.toFixed(2)}!`, "win");
                this.triggerScreenFlash('big');
                this.spawnParticles(150);
                if (this.audio) this.audio.playJackpot();
            } else if (isBigWin) {
                this.showToast(`💎 BIG WIN: $${totalWin.toFixed(2)}!`, "win");
                this.triggerScreenFlash('big');
                this.spawnParticles(100);
                if (this.audio) this.audio.playWinBig();
            } else {
                this.showToast(`WIN: $${totalWin.toFixed(2)}`, "win");
                this.triggerScreenFlash('small');
                if (this.audio) this.audio.playWinSmall();
            }
        }
    }

    triggerScreenFlash(type) {
        const overlay = document.getElementById('winOverlay');
        if (!overlay) return;
        overlay.classList.remove('flash-small', 'flash-big');
        void overlay.offsetWidth;
        if (type === 'big') overlay.classList.add('flash-big');
        else overlay.classList.add('flash-small');
        setTimeout(() => { overlay.classList.remove('flash-small', 'flash-big'); }, 1000);
    }

    spawnParticles(count) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(centerX, centerY, this.currentTheme.paylineColor));
        }
    }

    checkLineMatch(rowSymbols) {
        if (rowSymbols.length === 0) return { count: 0 };
        const firstSym = rowSymbols[0];
        let count = 1;
        for (let i = 1; i < rowSymbols.length; i++) {
            const current = rowSymbols[i];
            if (current.id === firstSym.id || current.isWild || firstSym.isWild) {
                count++;
            } else { break; }
        }
        return { count, symbol: firstSym };
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.colWidth = this.canvas.width / GAME_CONFIG.grid.reels;
            this.rowHeight = this.canvas.height / GAME_CONFIG.grid.rows;
            this.drawGameFrame();
        }
    }

    drawGameFrame() {
        if (!this.reelData || this.reelData.length === 0) return;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. BACKGROUNDS
        for (let x = 0; x < GAME_CONFIG.grid.reels; x++) {
            for (let y = 0; y < GAME_CONFIG.grid.rows + 1; y++) {
                if (this.reelData[x] && this.reelData[x][y]) {
                    const symbol = this.reelData[x][y];
                    const xPos = x * this.colWidth;
                    const offset = this.reelOffsets[x] || 0;
                    const yPos = (y * this.rowHeight) + offset - this.rowHeight;
                    const isWinner = this.winningCells.has(`${x},${y - 1}`) && !this.isSpinning;
                    this.drawSymbolBackground(symbol, xPos, yPos, isWinner);
                }
            }
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.colWidth, 0);
            this.ctx.lineTo(x * this.colWidth, this.canvas.height);
            this.ctx.stroke();
        }

        // 2. LINES (ON TOP)
        if (this.winningLines.length > 0 && !this.isSpinning) {
            this.drawPaylines();
        }

        // 3. TEXT (ON TOP OF LINES)
        for (let x = 0; x < GAME_CONFIG.grid.reels; x++) {
            for (let y = 0; y < GAME_CONFIG.grid.rows + 1; y++) {
                if (this.reelData[x] && this.reelData[x][y]) {
                    const symbol = this.reelData[x][y];
                    const xPos = x * this.colWidth;
                    const offset = this.reelOffsets[x] || 0;
                    const yPos = (y * this.rowHeight) + offset - this.rowHeight;
                    const isWinner = this.winningCells.has(`${x},${y - 1}`) && !this.isSpinning;
                    this.drawSymbolText(symbol, xPos, yPos, isWinner);
                }
            }
        }

        // 4. PARTICLES
        this.particles.forEach(p => p.draw(this.ctx));
    }

    drawPaylines() {
        const time = Date.now() / 20;
        
        this.winningLines.forEach(win => {
            this.ctx.beginPath();
            
            for(let col=0; col < win.count; col++) {
                const row = win.path[col];
                const x = (col * this.colWidth) + (this.colWidth / 2);
                const y = (row * this.rowHeight) + (this.rowHeight / 2);
                
                if (col === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }

            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";

            // Glow
            this.ctx.lineWidth = 12;
            this.ctx.strokeStyle = win.color;
            this.ctx.globalAlpha = 0.5;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;

            // Core
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#fff';
            this.ctx.setLineDash([20, 20]);
            this.ctx.lineDashOffset = -time;
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }

    drawSymbolBackground(symbol, x, y, isWinner) {
        const padding = 8;
        let w = this.colWidth - (padding * 2);
        let h = this.rowHeight - (padding * 2);
        let drawX = x + padding;
        let drawY = y + padding;

        if (isWinner) {
            const scale = 1 + Math.sin((Date.now() - this.winTimestamp) / 100) * 0.10;
            const centerX = x + this.colWidth / 2;
            const centerY = y + this.rowHeight / 2;
            w *= scale;
            h *= scale;
            drawX = centerX - (w / 2);
            drawY = centerY - (h / 2);
        } else if (this.winningLines.length > 0 && !this.isSpinning) {
            this.ctx.globalAlpha = 0.3;
        }

        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(drawX, drawY, w, h);
        
        this.ctx.strokeStyle = isWinner ? '#fff' : symbol.color;
        this.ctx.lineWidth = isWinner ? 4 : 2;
        this.ctx.strokeRect(drawX, drawY, w, h);
        
        this.ctx.globalAlpha = 1.0;
    }

    drawSymbolText(symbol, x, y, isWinner) {
        const padding = 8;
        let w = this.colWidth - (padding * 2);
        let h = this.rowHeight - (padding * 2);
        let drawX = x + padding;
        let drawY = y + padding;

        if (isWinner) {
            const scale = 1 + Math.sin((Date.now() - this.winTimestamp) / 100) * 0.10;
            const centerX = x + this.colWidth / 2;
            const centerY = y + this.rowHeight / 2;
            w *= scale;
            h *= scale;
            drawX = centerX - (w / 2);
            drawY = centerY - (h / 2);
        } else if (this.winningLines.length > 0 && !this.isSpinning) {
            this.ctx.globalAlpha = 0.3;
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${Math.min(w, h) * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (isWinner) {
            this.ctx.shadowColor = "#000";
            this.ctx.shadowBlur = 4;
        }
        
        this.ctx.fillText(symbol.name, drawX + (w/2), drawY + (h/2));
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
    }

    updateUI() {
        const coinEl = document.getElementById('coinCount');
        const betEl = document.getElementById('betAmount');
        const winEl = document.getElementById('totalBet');
        
        if(coinEl) coinEl.textContent = `$${this.playerBalance.toFixed(2)}`;
        if(betEl) betEl.textContent = `$${this.currentBet.toFixed(2)}`;
        if(winEl) winEl.textContent = `$${this.totalWon.toFixed(2)}`;
        
        const btn = document.getElementById('spinButton');
        if(btn) {
            if (this.isSpinning) {
                btn.textContent = "STOP";
                btn.disabled = false;
            } else {
                btn.textContent = "SPIN";
                btn.disabled = false;
            }
        }
        const linesEl = document.getElementById('paylineCount');
        if(linesEl) linesEl.textContent = this.activePaylinesCount;
    }

    changeBet(amount) {
        if (this.isSpinning) return;
        const newBet = this.currentBet + amount;
        if (newBet >= GAME_CONFIG.economy.minBet && newBet <= GAME_CONFIG.economy.maxBet) {
            this.currentBet = newBet;
            this.updateUI();
            this.saveGame();
            if (this.audio) this.audio.playClick();
        }
    }

    changePaylines(amount) {
        if (this.isSpinning) return;
        const newCount = this.activePaylinesCount + amount;
        if (newCount >= 1 && newCount <= 20) {
            this.activePaylinesCount = newCount;
            this.updateUI();
            this.saveGame();
            this.showToast(`Active Lines: ${this.activePaylinesCount}`, "info");
            if (this.audio) this.audio.playClick();
        }
    }

    showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || '#ffd700';
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.8;
        this.life = 1.0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let game;
window.onload = () => { game = new SlotMachine(); };
function spin() { if(game) game.spin(); }
function changeBet(val) { if(game) game.changeBet(val); }
function changePaylines(val) { if(game) game.changePaylines(val); }
function resetGame() { if(game) game.resetGame(); }
function changeTheme(val) { if(game) game.changeTheme(val); }
function toggleRules() { if(game) game.toggleRules(); }
function toggleAudio() { if(game) game.toggleAudio(); }
