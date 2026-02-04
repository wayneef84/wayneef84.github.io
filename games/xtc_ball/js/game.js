/**
 * * MAGIC XTC BALL - GAME ENGINE
 * =====================================================================================
 * * CHANGELOG
 * -------------------------------------------------------------------------------------
 * v1.2 - THE "X" BALL UPDATE (Current)
 * - Logic: Added dynamic font sizing for 3-digit labels (e.g., "10", "15").
 * - Logic: Added dynamic font sizing for long answers (e.g., "Concentrate and ask again").
 * - Data: Integrated with updated config.js containing full 1-15 pool ball set.
 * * v1.1 - CUSTOMIZATION UPDATE
 * - Feature: Added CRUD (Create, Read, Update, Delete) for custom balls.
 * - Storage: Implemented localStorage to persist custom balls between sessions.
 * - UI: Added Table generation for managing answers and weights.
 * * v1.0 - CORE ENGINE
 * - Physics: Implemented 'Shake to Reveal' using DeviceMotion API.
 * - Logic: Implemented Weighted RNG for answer selection.
 * - Visuals: Linked DOM elements to CSS 3D transforms.
 */

/**
 * MAGIC XTC BALL - GAME ENGINE (v1.4)
 * =====================================================================================
 * v1.4 - UI OVERHAUL
 * - Added 'updatePreview' to handle mini-ball visualization in modal.
 * - Added 'Select & Play' button logic for preset balls.
 */
/**
 * MAGIC XTC BALL - GAME ENGINE (v1.7)
 * =====================================================================================
 * CHANGELOG
 * -------------------------------------------------------------------------------------
 * v1.7 - SOUND & VIBRATION UPDATE (Current)
 * - Juice: Added SoundManager for synthesized audio effects (Shake/Reveal).
 * - UI: Added Mute and Vibrate toggle buttons with persistence.
 * * v1.6 - AUTO-EXPANDING INPUTS
 * - Juice: Added auto-resize logic to answer textareas so they grow with content.
 * * v1.5 - MULTI-LINE SUPPORT
 * - Fix: Swapped input for textarea to allow newlines.
 * * v1.4 - UI OVERHAUL
 * - Feature: Split-View Modal, Liquid Color, Live Preview.
 * * v1.3 - REBRAND & LOGIC
 * - Renamed to Magic XTC Ball.
 */

const ICON_SOUND_ON = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

class OracleGame {
    constructor() {
        this.state = {
            currentBallId: "8",     
            isShaking: false,       
            isRevealed: false,      
            shakeVelocity: 0,       
            lastShakeTime: 0,       
            presets: ORACLE_CONFIG.balls 
        };

        this.soundManager = new SoundManager();

        this.dom = {
            ball: document.getElementById('oracleBall'),
            label: document.getElementById('ballLabel'),
            name: document.getElementById('ballName'),
            answerText: document.getElementById('answerText'),
            root: document.documentElement, 

            muteBtn: document.getElementById('muteBtn'),
            vibrateBtn: document.getElementById('vibrateBtn'),
            settingsModal: document.getElementById('settingsModal'),
            ballSelector: document.getElementById('ballSelector'),
            
            // Editor & Preview
            miniBall: document.getElementById('miniBall'),
            miniLabel: document.getElementById('miniLabel'),
            
            editName: document.getElementById('editName'),
            editColor: document.getElementById('editColor'),
            editLiquidColor: document.getElementById('editLiquidColor'), 
            editLabel: document.getElementById('editLabel'),
            
            answersList: document.getElementById('answersList'),
            lockedMsg: document.getElementById('lockedMessage'),
            editControls: document.getElementById('editControls'),
            deleteBtn: document.getElementById('deleteBallBtn'),
            saveBallBtn: document.getElementById('saveBallBtn'),
            selectBallBtn: document.getElementById('selectBallBtn')
        };

        this.init();
    }

    init() {
        this.loadCustomData();
        const params = new URLSearchParams(window.location.search);
        const urlBall = params.get('ball');
        
        if (urlBall && this.getBallData(urlBall)) {
            this.state.currentBallId = urlBall;
        } else {
            this.state.currentBallId = "8";
        }

        this.loadBall(this.state.currentBallId);
        this.bindEvents();
        this.setupMotion();
        this.populateSettings();

        // Initialize Mute Button State
        if(this.soundManager.isMuted()) {
            this.dom.muteBtn.innerHTML = ICON_SOUND_OFF;
            this.dom.muteBtn.style.opacity = '0.5';
        } else {
            this.dom.muteBtn.innerHTML = ICON_SOUND_ON;
            this.dom.muteBtn.style.opacity = '1';
        }

        // Initialize Vibrate Button State
        const vibrateSetting = localStorage.getItem('oracle_vibration');
        this.state.vibrationEnabled = vibrateSetting === null ? true : (vibrateSetting === 'true');

        if(this.state.vibrationEnabled) {
            this.dom.vibrateBtn.style.opacity = '1';
        } else {
            this.dom.vibrateBtn.style.opacity = '0.5';
        }
    }

    loadCustomData() {
        try {
            const saved = localStorage.getItem('oracle_custom_balls');
            this.customBalls = saved ? JSON.parse(saved) : {};
        } catch (e) {
            this.customBalls = {};
        }
    }

    getBallData(id) {
        return this.state.presets[id] || this.customBalls[id];
    }

    loadBall(id) {
        const data = this.getBallData(id);
        if(!data) return; 

        this.state.currentBallId = id;
        this.dom.label.textContent = data.label;
        this.dom.name.textContent = data.name || "Magic XTC Ball";
        
        this.dom.root.style.setProperty('--ball-color', data.color);
        this.dom.root.style.setProperty('--liquid-color', data.liquidColor || '#100060');

        if (data.label.length > 2) {
            this.dom.label.style.fontSize = '50px'; 
        } else if (data.label.length === 2) {
            this.dom.label.style.fontSize = '65px'; 
        } else {
            this.dom.label.style.fontSize = '80px'; 
        }

        this.reset();
    }

    bindEvents() {
        this.dom.ball.addEventListener('click', () => this.handleInteract());

        this.dom.muteBtn.addEventListener('click', () => {
            this.soundManager.init(); // Ensure context is ready
            const isMuted = this.soundManager.toggleMute();
            this.dom.muteBtn.innerHTML = isMuted ? ICON_SOUND_OFF : ICON_SOUND_ON;
            this.dom.muteBtn.style.opacity = isMuted ? '0.5' : '1';
        });

        this.dom.vibrateBtn.addEventListener('click', () => {
            this.state.vibrationEnabled = !this.state.vibrationEnabled;
            localStorage.setItem('oracle_vibration', this.state.vibrationEnabled);
            this.dom.vibrateBtn.style.opacity = this.state.vibrationEnabled ? '1' : '0.5';
            // Provide immediate tactile feedback if enabling
            if(this.state.vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.soundManager.init(); // Ensure context is ready
            this.populateSettings(); 
            this.loadEditor(this.state.currentBallId); 
            this.dom.settingsModal.classList.remove('hidden');
        });
        document.getElementById('closeModal').addEventListener('click', () => {
            this.dom.settingsModal.classList.add('hidden');
        });

        this.dom.ballSelector.addEventListener('change', (e) => this.loadEditor(e.target.value));
        document.getElementById('createNewBtn').addEventListener('click', () => this.prepareNewBall());
        document.getElementById('addAnswerBtn').addEventListener('click', () => this.addAnswerRow("", 1));

        this.dom.saveBallBtn.addEventListener('click', () => this.saveCustomBall());
        this.dom.deleteBtn.addEventListener('click', () => this.deleteCustomBall());
        
        this.dom.selectBallBtn.addEventListener('click', () => {
            this.loadBall(this.dom.ballSelector.value);
            this.dom.settingsModal.classList.add('hidden');
        });

        this.dom.editColor.addEventListener('input', () => this.updatePreview());
        this.dom.editLabel.addEventListener('input', () => this.updatePreview());
    }

    handleInteract() {
        this.soundManager.init();
        if (this.state.isRevealed) {
            this.reset();
            return;
        }
        if (this.state.isShaking) {
            this.revealAnswer(true); 
            return;
        }
        this.startShake();
    }

    startShake() {
        this.state.isShaking = true;
        this.dom.ball.classList.add('shaking');
        this.soundManager.playShake();
        if (this.state.vibrationEnabled && navigator.vibrate) navigator.vibrate(200);
        this.shakeTimer = setTimeout(() => this.revealAnswer(), 2000); 
    }

    revealAnswer(immediate = false) {
        if (!this.state.isShaking) return;
        clearTimeout(this.shakeTimer);
        this.dom.ball.classList.remove('shaking');
        this.soundManager.playReveal();
        
        const data = this.getBallData(this.state.currentBallId);
        const answer = this.pickWeightedAnswer(data.answers);
        this.dom.answerText.innerHTML = answer.text.replace(/\n/g, '<br>');

        const charCount = answer.text.length;
        if (charCount > 20) this.dom.answerText.style.fontSize = '9px'; 
        else if (charCount > 12) this.dom.answerText.style.fontSize = '11px'; 
        else this.dom.answerText.style.fontSize = '13px'; 

        setTimeout(() => {
            this.dom.ball.classList.add('revealed');
            this.state.isRevealed = true;
            this.state.isShaking = false;
            if (this.state.vibrationEnabled && navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }, immediate ? 0 : 200);
    }

    reset() {
        this.dom.ball.classList.remove('revealed', 'shaking');
        this.state.isRevealed = false;
        this.state.isShaking = false;
    }

    pickWeightedAnswer(answers) {
        if (!answers || answers.length === 0) return { text: "TRY\nAGAIN", weight: 1 };
        const lottery = [];
        answers.forEach(ans => {
            const count = Math.floor((ans.weight || 1) * 10);
            for(let i=0; i<count; i++) lottery.push(ans);
        });
        if (lottery.length === 0) return answers[0];
        return lottery[Math.floor(Math.random() * lottery.length)];
    }

    populateSettings() {
        const select = this.dom.ballSelector;
        select.innerHTML = '';
        
        const groupStandard = document.createElement('optgroup');
        groupStandard.label = "Pool Balls (Standard)";
        const sortedIds = Object.keys(this.state.presets).sort((a,b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (isNaN(numA)) return 1; 
            if (isNaN(numB)) return -1;
            return numA - numB;
        });
        sortedIds.forEach(id => {
            const ball = this.state.presets[id];
            const opt = document.createElement('option');
            opt.value = ball.id;
            opt.textContent = ball.name;
            groupStandard.appendChild(opt);
        });
        select.appendChild(groupStandard);

        if (Object.keys(this.customBalls).length > 0) {
            const groupCustom = document.createElement('optgroup');
            groupCustom.label = "My Custom Balls";
            Object.values(this.customBalls).forEach(ball => {
                const opt = document.createElement('option');
                opt.value = ball.id;
                opt.textContent = ball.name;
                groupCustom.appendChild(opt);
            });
            select.appendChild(groupCustom);
        }
    }

    loadEditor(id) {
        this.dom.ballSelector.value = id;
        const data = this.getBallData(id);
        const isCustom = !!this.customBalls[id];

        this.dom.editName.value = data.name;
        this.dom.editLabel.value = data.label;
        this.dom.editColor.value = data.color;
        this.dom.editLiquidColor.value = data.liquidColor || '#100060';

        this.dom.answersList.innerHTML = '';
        data.answers.forEach(ans => this.addAnswerRow(ans.text, ans.weight, isCustom));

        this.updatePreview();

        if (isCustom) {
            this.dom.editName.disabled = false;
            this.dom.editLabel.disabled = false;
            this.dom.editColor.disabled = false;
            this.dom.editLiquidColor.disabled = false;
            
            document.getElementById('addAnswerBtn').classList.remove('hidden');
            this.dom.lockedMsg.classList.add('hidden');
            
            this.dom.saveBallBtn.classList.remove('hidden');
            this.dom.deleteBtn.classList.remove('hidden');
            this.dom.selectBallBtn.classList.add('hidden');
            
            this.dom.deleteBtn.dataset.targetId = id; 
        } else {
            this.dom.editName.disabled = true;
            this.dom.editLabel.disabled = true;
            this.dom.editColor.disabled = true;
            this.dom.editLiquidColor.disabled = true;
            
            document.getElementById('addAnswerBtn').classList.add('hidden');
            this.dom.lockedMsg.classList.remove('hidden');
            
            this.dom.selectBallBtn.classList.remove('hidden');
            this.dom.saveBallBtn.classList.add('hidden');
            this.dom.deleteBtn.classList.add('hidden');
        }
    }

    updatePreview() {
        const color = this.dom.editColor.value;
        const label = this.dom.editLabel.value;
        
        this.dom.miniBall.style.setProperty('--preview-color', color);
        this.dom.miniLabel.textContent = label;
        
        if (label.length > 2) this.dom.miniLabel.style.fontSize = '12px';
        else if (label.length === 2) this.dom.miniLabel.style.fontSize = '16px';
        else this.dom.miniLabel.style.fontSize = '20px';
    }

    addAnswerRow(text, weight, isEditable = true) {
        const tr = document.createElement('tr');
        
        const tdText = document.createElement('td');
        
        // --- NEW AUTO-RESIZING TEXTAREA ---
        const inpText = document.createElement('textarea');
        inpText.value = text;
        inpText.className = 'ans-text';
        inpText.disabled = !isEditable;
        inpText.rows = 1;
        
        // The Logic: Reset height to auto, then set to scrollHeight
        const autoResize = () => {
            inpText.style.height = 'auto';
            inpText.style.height = inpText.scrollHeight + 'px';
        };
        
        // Listen for typing
        inpText.addEventListener('input', autoResize);
        
        // Trigger once immediately (in case loaded text is long)
        // We use setTimeout to ensure it runs after append
        setTimeout(autoResize, 0);

        tdText.appendChild(inpText);

        const tdWeight = document.createElement('td');
        const inpWeight = document.createElement('input');
        inpWeight.type = 'number';
        inpWeight.step = '0.1';
        inpWeight.value = weight;
        inpWeight.className = 'ans-weight';
        inpWeight.disabled = !isEditable;
        tdWeight.appendChild(inpWeight);

        const tdAct = document.createElement('td');
        if (isEditable) {
            const delBtn = document.createElement('button');
            delBtn.textContent = '×';
            delBtn.className = 'row-del-btn';
            delBtn.onclick = () => tr.remove();
            tdAct.appendChild(delBtn);
        }

        tr.appendChild(tdText);
        tr.appendChild(tdWeight);
        tr.appendChild(tdAct);
        this.dom.answersList.appendChild(tr);
    }

    prepareNewBall() {
        this.dom.ballSelector.value = "";
        this.dom.editName.value = "New Ball";
        this.dom.editName.disabled = false;
        
        this.dom.editLabel.value = "?";
        this.dom.editLabel.disabled = false;
        this.dom.editColor.value = "#555555";
        this.dom.editColor.disabled = false;
        this.dom.editLiquidColor.value = "#100060";
        this.dom.editLiquidColor.disabled = false;

        this.dom.answersList.innerHTML = '';
        ORACLE_CONFIG.defaultAnswers.forEach(ans => this.addAnswerRow(ans.text, ans.weight, true));

        this.updatePreview();

        document.getElementById('addAnswerBtn').classList.remove('hidden');
        this.dom.lockedMsg.classList.add('hidden');
        
        this.dom.saveBallBtn.classList.remove('hidden');
        this.dom.selectBallBtn.classList.add('hidden');
        this.dom.deleteBtn.classList.add('hidden');
        
        this.dom.saveBallBtn.dataset.mode = 'create';
    }

    saveCustomBall() {
        const isCreate = this.dom.saveBallBtn.dataset.mode === 'create';
        let id = this.dom.ballSelector.value;
        
        if (isCreate || !id || this.state.presets[id]) {
            id = "custom_" + Date.now();
        }

        const answers = [];
        const rows = this.dom.answersList.querySelectorAll('tr');
        rows.forEach(row => {
            const txt = row.querySelector('.ans-text').value;
            const wgt = parseFloat(row.querySelector('.ans-weight').value) || 1;
            if (txt.trim()) answers.push({ text: txt, weight: wgt });
        });

        if (answers.length === 0) {
            alert("You need at least one answer!");
            return;
        }

        const newBall = {
            id: id,
            name: this.dom.editName.value || "Unnamed Ball",
            label: this.dom.editLabel.value || "?",
            color: this.dom.editColor.value,
            liquidColor: this.dom.editLiquidColor.value,
            answers: answers
        };

        this.customBalls[id] = newBall;
        localStorage.setItem('oracle_custom_balls', JSON.stringify(this.customBalls));
        
        this.dom.saveBallBtn.dataset.mode = '';
        this.populateSettings();
        
        this.dom.settingsModal.classList.add('hidden');
        this.loadBall(id);
    }

    deleteCustomBall() {
        const id = this.dom.deleteBtn.dataset.targetId;
        if (!id || !this.customBalls[id]) return;

        if (confirm(`Delete "${this.customBalls[id].name}"? This cannot be undone.`)) {
            delete this.customBalls[id];
            localStorage.setItem('oracle_custom_balls', JSON.stringify(this.customBalls));
            
            this.populateSettings();
            this.loadBall("8");
            this.dom.settingsModal.classList.add('hidden');
        }
    }

    setupMotion() {
        const btn = document.getElementById('motionPermBtn');
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            btn.classList.remove('hidden');
            btn.addEventListener('click', () => {
                DeviceMotionEvent.requestPermission().then(r => {
                    if (r === 'granted') {
                        this.startMotionListener();
                        btn.classList.add('hidden');
                    }
                });
            });
        } else if (typeof DeviceMotionEvent !== 'undefined') {
            this.startMotionListener();
        }
    }

    startMotionListener() {
        window.addEventListener('devicemotion', (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;
            if ((Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z)) > 15) {
                const now = Date.now();
                if (now - this.state.lastShakeTime > 1000) {
                    this.state.lastShakeTime = now;
                    if (this.state.isRevealed) this.reset();
                    else if (!this.state.isShaking) this.handleInteract();
                }
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => new OracleGame());