/**
 * DAD'S SLOTS - GAME ENGINE
 * Version: 1.0 (Gold Master)
 * * UPDATE NOTES (v1.0):
 * - Fixed Z-Index Rendering: Symbols are now drawn in two passes (Background then Text).
 * - Fixed Win Line Visibility: Lines are drawn ON TOP of the symbol backgrounds but BELOW the text.
 * - Added Particle System: Gold coins explode on big wins.
 * - Added Overlay System: CSS Glow effects are triggered via a top-level DIV.
 */

const GAME_CONFIG = {
    grid: { reels: 5, rows: 4, symbolSize: 100 },
    economy: { startingBalance: 100.00, minBet: 0.20, maxBet: 5.00, betIncrement: 0.20 },
    math: { baseWinChance: 50 } 
};

class SlotMachine {
    constructor() {
        this.canvas = document.getElementById('slotCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.playerBalance = GAME_CONFIG.economy.startingBalance;
        this.currentBet = 1.00;
        this.dadModeWinChance = GAME_CONFIG.math.baseWinChance;
        this.isSpinning = false;
        
        // --- DATA LOADING ---
        if (typeof THEME_LIBRARY !== 'undefined') {
            this.library = THEME_LIBRARY;
        } else {
            console.error("CRITICAL: themes.js not found! Loading backup data.");
            this.library = this.getBackupLibrary();
        }

        this.currentThemeKey = 'fantasy';
        this.reelOffsets = new Array(GAME_CONFIG.grid.reels).fill(0);
        this.reelSpeeds = new Array(GAME_CONFIG.grid.reels).fill(0);
        this.reelData = []; 
        
        // WIN STATE
        this.winningLines = []; 
        this.winningCells = new Set(); 
        this.particles = []; 
        this.animationFrameId = null; 
        this.winTimestamp = 0; 
        
        this.populateThemeDropdown();
        this.loadTheme(this.currentThemeKey);
        this.generateReelData(); 
        this.resizeCanvas();
        this.updateUI();
        
        window.addEventListener('resize', () => this.resizeCanvas());
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
    }

    changeTheme(newThemeKey) {
        this.loadTheme(newThemeKey);
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        this.generateReelData();
        this.drawGameFrame();
        this.showToast(`Theme: ${this.currentTheme.name}`, "info");
    }

    resetGame() {
        if (confirm("Reset your balance to $100.00?")) {
            this.playerBalance = 100.00;
            this.winningLines = [];
            this.winningCells.clear();
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
        if (this.isSpinning) {
            this.quickStop();
            return;
        }
        if (this.playerBalance < this.currentBet) {
            this.showToast("Not enough credits!", "error");
            return;
        }

        this.playerBalance -= this.currentBet;
        this.isSpinning = true;
        this.winningLines = [];
        this.winningCells.clear();
        this.particles = [];
        
        // Remove Overlay Glow
        const overlay = document.getElementById('winOverlay');
        if(overlay) overlay.classList.remove('active');
        
        this.updateUI(); 

        this.reelSpeeds = this.reelSpeeds.map(() => 20 + Math.random() * 10);
        this.generateReelData();
        this.spinStartTime = Date.now();
        
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
        this.evaluateWins();
        this.updateUI();
        if (this.winningLines.length > 0) {
            this.winTimestamp = Date.now(); 
            this.startWinAnimation();
        }
    }

    startWinAnimation() {
        const loop = () => {
            if (this.isSpinning) return; 
            this.drawGameFrame();
            
            // Update Particles
            if (this.particles.length > 0) {
                this.particles.forEach(p => p.update());
                this.particles = this.particles.filter(p => p.life > 0);
            }
            
            this.animationFrameId = requestAnimationFrame(loop);
        };
        loop();
    }

    evaluateWins() {
        let totalWin = 0;
        this.winningLines = [];
        this.winningCells.clear();

        for (let row = 0; row < GAME_CONFIG.grid.rows; row++) {
            // FIX: Alignment adjustment (+1) to match visual grid
            const rowSymbols = this.reelData.map(reel => reel[row + 1]);
            const matchData = this.checkLineMatch(rowSymbols);
            
            if (matchData.count >= 3) {
                const payout = matchData.symbol.value * matchData.count * (this.currentBet * 0.1);
                totalWin += payout;
                
                this.winningLines.push({
                    row: row,
                    count: matchData.count,
                    color: this.currentTheme.paylineColor || '#fff'
                });

                for(let i=0; i<matchData.count; i++) {
                    this.winningCells.add(`${i},${row}`);
                }
            }
        }

        if (totalWin > 0) {
            this.playerBalance += totalWin;
            const isBigWin = totalWin >= (this.currentBet * 10);
            
            const overlay = document.getElementById('winOverlay');
            if(overlay) overlay.classList.add('active');

            if (isBigWin) {
                this.showToast(`💎 BIG WIN: $${totalWin.toFixed(2)}!`, "win");
                this.triggerScreenFlash('big');
                this.spawnParticles(100); 
            } else {
                this.showToast(`WIN: $${totalWin.toFixed(2)}`, "win");
                this.triggerScreenFlash('small');
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

        // 1. DRAW BACKGROUNDS (Cards)
        for (let x = 0; x < GAME_CONFIG.grid.reels; x++) {
            for (let y = 0; y < GAME_CONFIG.grid.rows + 1; y++) {
                if (this.reelData[x] && this.reelData[x][y]) {
                    const symbol = this.reelData[x][y];
                    const xPos = x * this.colWidth;
                    // Safety check offset
                    const offset = this.reelOffsets[x] || 0;
                    const yPos = (y * this.rowHeight) + offset - this.rowHeight;
                    // Adjust y check for visual row
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

        // 2. DRAW SYMBOL TEXT (Middle Layer)
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

        // 3. DRAW WIN LINES (Top Layer)
        if (this.winningLines.length > 0 && !this.isSpinning) {
            this.drawPaylines();
        }

        // 4. DRAW PARTICLES (Overlay)
        this.particles.forEach(p => p.draw(this.ctx));
    }

    drawPaylines() {
        const time = Date.now() / 20; 
        
        this.winningLines.forEach(win => {
            const yCenter = (win.row * this.rowHeight) + (this.rowHeight / 2);
            const xEnd = (win.count - 1) * this.colWidth + (this.colWidth / 2);

            this.ctx.beginPath();
            this.ctx.moveTo(0, yCenter); 
            this.ctx.lineTo(xEnd + (this.colWidth/2), yCenter); 

            // Glow
            this.ctx.lineWidth = 12;
            this.ctx.strokeStyle = win.color; 
            this.ctx.globalAlpha = 0.5;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = win.color;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1.0;

            // Core Line
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
            this.ctx.globalAlpha = 0.3; // Dim losers
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
        if(coinEl) coinEl.textContent = `$${this.playerBalance.toFixed(2)}`;
        if(betEl) betEl.textContent = `$${this.currentBet.toFixed(2)}`;
        
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
    }

    changeBet(amount) {
        if (this.isSpinning) return;
        const newBet = this.currentBet + amount;
        if (newBet >= GAME_CONFIG.economy.minBet && newBet <= GAME_CONFIG.economy.maxBet) {
            this.currentBet = newBet;
            this.updateUI();
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

// --- PARTICLE SYSTEM CLASS ---
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

// ==========================================
// 4. GLOBAL BOOTSTRAP
// ==========================================
let game;

window.onload = () => { game = new SlotMachine(); };

function spin() { if(game) game.spin(); }
function changeBet(val) { if(game) game.changeBet(val); }
function changePaylines(val) { if(game) game.showToast("Lines fixed at 20!", "info"); }
function resetGame() { if(game) game.resetGame(); }
function changeTheme(val) { if(game) game.changeTheme(val); }
function toggleRules() { if(game) game.toggleRules(); }