# War Battle History Implementation Plan

**Date:** January 17, 2026
**Author:** Claude Sonnet 4.5
**Status:** Awaiting User Approval
**Estimated Tokens:** 25-35k tokens

---

## 📋 EXECUTIVE SUMMARY

Implement comprehensive battle-by-battle history tracking for War game with:
- Every card flip recorded as a "round"
- Priority-based storage (current match > recent > old)
- 250 round threshold (adjustable)
- Tab-based UI in History modal
- Shared card rendering with Blackjack

---

## 🎯 OBJECTIVES

### Primary Goals:
1. Track every single card flip (round) with full details
2. Show War sequences with all cards (including 3 hidden cards)
3. Store match metadata forever, prune round details when needed
4. Reuse Blackjack's card rendering logic
5. Tab-based UI: "Current Match" | "Previous Matches"

### Success Criteria:
- [x] Every flip creates a round entry
- [x] War sequences show all 8 cards (4 hidden + 4 flipped)
- [x] Current match always preserved (even if > 250 rounds)
- [x] Oldest match round history deleted first when threshold exceeded
- [x] Match metadata never deleted (winner, scores, count)
- [x] UI shows expandable/collapsible matches
- [x] localStorage persistence
- [x] Clear history button

---

## 📊 DATA STRUCTURES

### Match Object (Always Saved)
```javascript
{
    matchId: 3,                    // Unique ID
    timestamp: 1737158400000,      // Match start time
    winner: 'you',                 // 'you', 'opponent', or null (in progress)
    yourFinalScore: 28,            // Final point count
    oppFinalScore: 24,             // Final point count
    totalRounds: 52,               // Total rounds played
    hasRoundHistory: true,         // Flag: is round data available?
    isCurrentMatch: true,          // Flag: is this the active match?
    rounds: [/* Round objects */]  // Conditional - may be deleted
}
```

### Round Object (Conditionally Saved)
```javascript
{
    roundId: 45,                   // Sequential ID within match
    timestamp: 1737158450000,      // Round time
    yourCard: {                    // Card object
        suit: 'HEARTS',
        rank: 'KING'
    },
    oppCard: {
        suit: 'SPADES',
        rank: 'QUEEN'
    },
    winner: 'you',                 // 'you' or 'opponent'
    isWar: false                   // Is this a War round?
}
```

### War Round Object
```javascript
{
    roundId: 46,
    timestamp: 1737158455000,
    yourCard: { suit: 'HEARTS', rank: '7' },  // Tied card
    oppCard: { suit: 'CLUBS', rank: '7' },    // Tied card
    winner: 'you',
    isWar: true,
    warSequence: {
        yourHidden: [                          // 3 hidden cards
            { suit: 'SPADES', rank: '3' },
            { suit: 'DIAMONDS', rank: '5' },
            { suit: 'CLUBS', rank: '9' }
        ],
        yourFlipped: { suit: 'DIAMONDS', rank: 'ACE' },  // 4th card
        oppHidden: [
            { suit: 'HEARTS', rank: '2' },
            { suit: 'SPADES', rank: '8' },
            { suit: 'CLUBS', rank: 'JACK' }
        ],
        oppFlipped: { suit: 'SPADES', rank: 'KING' }
    },
    isNestedWar: false  // True if War happened during War
}
```

### Nested/Double War Object
```javascript
{
    roundId: 47,
    timestamp: 1737158460000,
    yourCard: { suit: 'HEARTS', rank: 'ACE' },
    oppCard: { suit: 'SPADES', rank: 'ACE' },
    winner: 'opponent',
    isWar: true,
    isNestedWar: true,  // This is a War within a War
    warSequence: {
        // First War
        war1: {
            yourHidden: [/* 3 cards */],
            yourFlipped: { suit: 'DIAMONDS', rank: '10' },
            oppHidden: [/* 3 cards */],
            oppFlipped: { suit: 'CLUBS', rank: '10' }  // Tied again!
        },
        // Second War
        war2: {
            yourHidden: [/* 3 cards */],
            yourFlipped: { suit: 'HEARTS', rank: 'QUEEN' },
            oppHidden: [/* 3 cards */],
            oppFlipped: { suit: 'SPADES', rank: 'KING' }  // Opponent wins
        }
    }
}
```

---

## 🔧 IMPLEMENTATION TASKS

### Task 1: Create Shared Card Rendering Utility (3-5k tokens)

**File:** `/games/cards/shared/card-utils.js` (NEW)

**Purpose:** Reusable card rendering for both Blackjack and War

**Functions:**
```javascript
var CardUtils = {
    // Render card as text: "K♥"
    renderCardText: function(card) {
        var rankSymbol = { 'ACE': 'A', 'KING': 'K', 'QUEEN': 'Q', 'JACK': 'J' };
        var suitSymbol = { 'HEARTS': '♥', 'DIAMONDS': '♦', 'CLUBS': '♣', 'SPADES': '♠' };
        return (rankSymbol[card.rank] || card.rank) + suitSymbol[card.suit];
    },

    // Render card as mini canvas element
    renderCardMini: function(card, size) {
        // Reuse CardAssets but at smaller scale
        // Returns canvas element
    },

    // Render multiple cards in a row: "K♥ Q♠ 7♦"
    renderCardList: function(cards) {
        return cards.map(this.renderCardText).join(' ');
    },

    // Get card color class for styling
    getCardColor: function(card) {
        return (card.suit === 'HEARTS' || card.suit === 'DIAMONDS') ? 'red' : 'black';
    }
};
```

**Changes to Existing Files:**
- Add `<script src="../shared/card-utils.js"></script>` to war/index.html
- Add to blackjack/index.html for future use

---

### Task 2: Add Match History Data Structure (2-3k tokens)

**File:** `games/cards/war/index.html`

**Changes to WarUI Constructor:**
```javascript
var WarUI = function() {
    // ... existing code ...

    // NEW: Battle history tracking
    this.matchHistory = [];              // Array of match objects
    this.currentMatchId = null;          // ID of active match
    this.roundHistoryThreshold = 250;    // Max rounds to store
    this.nextMatchId = 1;                // Auto-increment counter
};
```

**New Methods:**
```javascript
// Initialize a new match
WarUI.prototype._startNewMatch = function() {
    var match = {
        matchId: this.nextMatchId++,
        timestamp: Date.now(),
        winner: null,
        yourFinalScore: this.player1Points,
        oppFinalScore: this.player2Points,
        totalRounds: 0,
        hasRoundHistory: true,
        isCurrentMatch: true,
        rounds: []
    };

    // Mark previous match as not current
    if (this.matchHistory.length > 0) {
        var lastMatch = this.matchHistory[this.matchHistory.length - 1];
        lastMatch.isCurrentMatch = false;
    }

    this.matchHistory.push(match);
    this.currentMatchId = match.matchId;
    this._saveMatchHistory();
};

// Get current match object
WarUI.prototype._getCurrentMatch = function() {
    for (var i = 0; i < this.matchHistory.length; i++) {
        if (this.matchHistory[i].matchId === this.currentMatchId) {
            return this.matchHistory[i];
        }
    }
    return null;
};

// End current match
WarUI.prototype._endCurrentMatch = function(winner) {
    var match = this._getCurrentMatch();
    if (match) {
        match.winner = winner;
        match.yourFinalScore = this.player1Points;
        match.oppFinalScore = this.player2Points;
        match.isCurrentMatch = false;
        this._saveMatchHistory();
    }
};
```

---

### Task 3: Implement Round Tracking (5-8k tokens)

**File:** `games/cards/war/index.html`

**New Method:**
```javascript
WarUI.prototype._addRoundEntry = function(roundData) {
    var currentMatch = this._getCurrentMatch();
    if (!currentMatch) {
        // No current match - start one
        this._startNewMatch();
        currentMatch = this._getCurrentMatch();
    }

    // Add round to current match
    roundData.roundId = currentMatch.rounds.length + 1;
    roundData.timestamp = Date.now();
    currentMatch.rounds.push(roundData);
    currentMatch.totalRounds++;

    // Check if we need to prune old match histories
    this._pruneRoundHistoryIfNeeded();

    // Save to localStorage
    this._saveMatchHistory();
};
```

**Call Sites (where to add round tracking):**

1. **In `_flip()` method** - After cards are compared:
```javascript
// After determining winner
var roundData = {
    yourCard: this.currentPlayer1Card,
    oppCard: this.currentPlayer2Card,
    winner: winner,  // 'you' or 'opponent'
    isWar: false
};
this._addRoundEntry(roundData);
```

2. **In War handling** - After War is resolved:
```javascript
// When War happens
var roundData = {
    yourCard: tiedCard1,
    oppCard: tiedCard2,
    winner: warWinner,
    isWar: true,
    warSequence: {
        yourHidden: [card1, card2, card3],
        yourFlipped: yourWarFlip,
        oppHidden: [card1, card2, card3],
        oppFlipped: oppWarFlip
    },
    isNestedWar: isNestedWar  // Track if this was War during War
};
this._addRoundEntry(roundData);
```

**Challenge:** War card tracking requires capturing cards BEFORE they're moved to graveyard. Need to modify War handling logic to store cards first.

---

### Task 4: Implement Pruning Logic (3-5k tokens)

**File:** `games/cards/war/index.html`

**New Methods:**
```javascript
// Calculate total rounds across all matches
WarUI.prototype._getTotalRoundCount = function() {
    var total = 0;
    for (var i = 0; i < this.matchHistory.length; i++) {
        if (this.matchHistory[i].hasRoundHistory && this.matchHistory[i].rounds) {
            total += this.matchHistory[i].rounds.length;
        }
    }
    return total;
};

// Prune oldest match histories to stay under threshold
WarUI.prototype._pruneRoundHistoryIfNeeded = function() {
    var totalRounds = this._getTotalRoundCount();

    // If under threshold, nothing to do
    if (totalRounds <= this.roundHistoryThreshold) {
        return;
    }

    console.log('[PRUNE] Total rounds:', totalRounds, '> threshold:', this.roundHistoryThreshold);

    // Delete oldest match round histories (but NOT current match)
    for (var i = 0; i < this.matchHistory.length; i++) {
        var match = this.matchHistory[i];

        // Skip current match - always keep it
        if (match.isCurrentMatch) {
            continue;
        }

        // Delete this match's round history
        if (match.hasRoundHistory) {
            console.log('[PRUNE] Deleting match', match.matchId, 'rounds:', match.rounds.length);
            delete match.rounds;
            match.hasRoundHistory = false;

            // Recalculate total
            totalRounds = this._getTotalRoundCount();

            // If now under threshold, stop
            if (totalRounds <= this.roundHistoryThreshold) {
                console.log('[PRUNE] Now under threshold:', totalRounds);
                break;
            }
        }
    }
};
```

**Edge Cases:**
- Current match has 300 rounds, threshold is 250 → Keep all 300, delete all other histories
- Only 1 match exists (current) with 400 rounds → Keep all 400
- 10 matches, each 30 rounds (300 total) → Delete oldest 2 matches (60 rounds)

---

### Task 5: localStorage Integration (2-3k tokens)

**File:** `games/cards/war/index.html`

**New Methods:**
```javascript
WarUI.prototype._saveMatchHistory = function() {
    try {
        var json = JSON.stringify(this.matchHistory);
        localStorage.setItem('war_match_history', json);
    } catch(e) {
        console.error('[SAVE] Failed to save match history:', e);
    }
};

WarUI.prototype._loadMatchHistory = function() {
    try {
        var json = localStorage.getItem('war_match_history');
        if (json) {
            this.matchHistory = JSON.parse(json);

            // Find highest match ID for auto-increment
            for (var i = 0; i < this.matchHistory.length; i++) {
                if (this.matchHistory[i].matchId >= this.nextMatchId) {
                    this.nextMatchId = this.matchHistory[i].matchId + 1;
                }

                // Set current match ID
                if (this.matchHistory[i].isCurrentMatch) {
                    this.currentMatchId = this.matchHistory[i].matchId;
                }
            }
        }
    } catch(e) {
        console.error('[LOAD] Failed to load match history:', e);
        this.matchHistory = [];
    }
};

WarUI.prototype._clearAllMatchHistory = function() {
    if (confirm('Clear ALL match history? This cannot be undone.')) {
        this.matchHistory = [];
        this.currentMatchId = null;
        this.nextMatchId = 1;
        this._saveMatchHistory();
        this._updateHistoryDisplay();
    }
};

WarUI.prototype._clearCurrentMatch = function() {
    if (confirm('Clear current match history? Stats will be reset.')) {
        var currentMatch = this._getCurrentMatch();
        if (currentMatch) {
            // Remove from history
            for (var i = 0; i < this.matchHistory.length; i++) {
                if (this.matchHistory[i].matchId === this.currentMatchId) {
                    this.matchHistory.splice(i, 1);
                    break;
                }
            }
        }

        // Start fresh match
        this._startNewMatch();
        this._saveMatchHistory();
        this._updateHistoryDisplay();
    }
};
```

**Call Sites:**
- Load on init: `this._loadMatchHistory();` in constructor
- Save after every round added
- Save when match ends
- Save when pruning happens

---

### Task 6: UI - Tab System (4-6k tokens)

**File:** `games/cards/war/index.html`

**HTML Changes:**
```html
<div id="historyModal" class="modal-overlay hidden">
    <div class="modal">
        <h2>Game History</h2>

        <!-- NEW: Tab Navigation -->
        <div class="tab-nav">
            <button id="tabCurrentMatch" class="tab-btn active">Current Match</button>
            <button id="tabPreviousMatches" class="tab-btn">Previous Matches</button>
        </div>

        <!-- Tab Content Areas -->
        <div id="currentMatchTab" class="tab-content active">
            <div class="current-match-header">
                <h3>Current Match (<span id="currentMatchRounds">0</span> rounds)</h3>
                <button id="btnClearCurrentMatch" class="secondary-btn">Clear</button>
            </div>
            <div id="currentMatchRounds" class="rounds-list"></div>
        </div>

        <div id="previousMatchesTab" class="tab-content hidden">
            <!-- Statistics (keep existing) -->
            <div class="history-stats">
                <h3>Statistics</h3>
                <div class="stat-row">
                    <div class="stat-item">
                        <div class="stat-value" id="totalWins">0</div>
                        <div class="stat-label">Wins</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="totalLosses">0</div>
                        <div class="stat-label">Losses</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="winRate">0%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                </div>
            </div>

            <!-- Match List -->
            <div id="historyList" class="history-list"></div>

            <button id="btnClearHistory" class="full-btn close-btn">Clear All History</button>
        </div>

        <button id="btnCloseHistory" class="full-btn primary-btn">Close</button>
    </div>
</div>
```

**CSS Changes:**
```css
.tab-nav {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 2px solid rgba(255,215,0,0.2);
}

.tab-btn {
    flex: 1;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border: none;
    border-bottom: 3px solid transparent;
    color: #ccc;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn.active {
    border-bottom-color: #ffd700;
    background: rgba(255,215,0,0.1);
    color: #ffd700;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.current-match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.rounds-list {
    max-height: 400px;
    overflow-y: auto;
}

.round-entry {
    background: rgba(255,255,255,0.05);
    padding: 12px;
    border-radius: 8px;
    margin: 8px 0;
    font-size: 0.9em;
}

.round-entry.war {
    border-left: 4px solid #ef4444;
    background: rgba(239,68,68,0.1);
}

.round-cards {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
}

.round-winner {
    color: #4ade80;
    font-weight: bold;
}

.war-sequence {
    margin-top: 8px;
    padding: 8px;
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
    font-size: 0.85em;
}

.match-entry {
    background: rgba(255,255,255,0.05);
    padding: 12px;
    border-radius: 8px;
    margin: 8px 0;
    cursor: pointer;
}

.match-entry.expanded {
    background: rgba(255,255,255,0.08);
}

.match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.match-rounds {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
}

.no-history {
    color: #999;
    font-style: italic;
    font-size: 0.9em;
}
```

**JavaScript Tab Switching:**
```javascript
WarUI.prototype._bindEvents = function() {
    var self = this;

    // ... existing bindings ...

    // Tab switching
    this.el.tabCurrentMatch.onclick = function() {
        self._switchTab('current');
    };
    this.el.tabPreviousMatches.onclick = function() {
        self._switchTab('previous');
    };

    // Clear buttons
    this.el.btnClearCurrentMatch.onclick = function() {
        self._clearCurrentMatch();
    };
    this.el.btnClearHistory.onclick = function() {
        self._clearAllMatchHistory();
    };
};

WarUI.prototype._switchTab = function(tab) {
    if (tab === 'current') {
        this.el.tabCurrentMatch.classList.add('active');
        this.el.tabPreviousMatches.classList.remove('active');
        this.el.currentMatchTab.classList.add('active');
        this.el.previousMatchesTab.classList.remove('active');
    } else {
        this.el.tabCurrentMatch.classList.remove('active');
        this.el.tabPreviousMatches.classList.add('active');
        this.el.currentMatchTab.classList.remove('active');
        this.el.previousMatchesTab.classList.add('active');
    }
};
```

---

### Task 7: UI - Display Round History (6-10k tokens)

**File:** `games/cards/war/index.html`

**New Method:**
```javascript
WarUI.prototype._updateHistoryDisplay = function() {
    // Update both tabs
    this._renderCurrentMatchTab();
    this._renderPreviousMatchesTab();
};

WarUI.prototype._renderCurrentMatchTab = function() {
    var currentMatch = this._getCurrentMatch();
    if (!currentMatch || !currentMatch.rounds || currentMatch.rounds.length === 0) {
        this.el.currentMatchRoundsList.innerHTML = '<p class="no-history">No rounds played yet.</p>';
        this.el.currentMatchRoundsCount.textContent = '0';
        return;
    }

    this.el.currentMatchRoundsCount.textContent = currentMatch.rounds.length;

    var html = '';

    // Show rounds in reverse order (newest first)
    for (var i = currentMatch.rounds.length - 1; i >= 0; i--) {
        var round = currentMatch.rounds[i];
        html += this._renderRoundEntry(round);
    }

    this.el.currentMatchRoundsList.innerHTML = html;
};

WarUI.prototype._renderRoundEntry = function(round) {
    var html = '<div class="round-entry' + (round.isWar ? ' war' : '') + '">';

    // Round header
    html += '<div class="round-header">';
    html += '<span class="round-id">#' + round.roundId + '</span>';
    html += '<span class="round-time">' + this._formatTime(round.timestamp) + '</span>';
    html += '</div>';

    // Cards
    html += '<div class="round-cards">';
    html += '<span class="your-card">You: ' + CardUtils.renderCardText(round.yourCard) + '</span>';
    html += '<span class="vs">vs</span>';
    html += '<span class="opp-card">Opp: ' + CardUtils.renderCardText(round.oppCard) + '</span>';
    html += '</div>';

    // War sequence (if applicable)
    if (round.isWar && round.warSequence) {
        html += '<div class="war-sequence">';
        html += '<strong>WAR!</strong><br>';
        html += 'You: ' + CardUtils.renderCardList(round.warSequence.yourHidden);
        html += ' → ' + CardUtils.renderCardText(round.warSequence.yourFlipped) + '<br>';
        html += 'Opp: ' + CardUtils.renderCardList(round.warSequence.oppHidden);
        html += ' → ' + CardUtils.renderCardText(round.warSequence.oppFlipped);
        html += '</div>';
    }

    // Winner
    html += '<div class="round-winner">';
    html += '→ ' + (round.winner === 'you' ? 'You Win' : 'Opponent Wins');
    html += '</div>';

    html += '</div>';
    return html;
};

WarUI.prototype._renderPreviousMatchesTab = function() {
    // Keep existing stats calculation
    this._updateStats();

    // Render match list (excluding current match)
    var html = '';

    for (var i = this.matchHistory.length - 1; i >= 0; i--) {
        var match = this.matchHistory[i];

        // Skip current match
        if (match.isCurrentMatch) {
            continue;
        }

        html += this._renderMatchEntry(match, i);
    }

    if (html === '') {
        html = '<p class="no-history">No previous matches yet.</p>';
    }

    this.el.historyList.innerHTML = html;
};

WarUI.prototype._renderMatchEntry = function(match, index) {
    var matchDate = new Date(match.timestamp).toLocaleString();
    var winnerText = match.winner === 'you' ? 'You Won' : 'Opponent Won';

    var html = '<div class="match-entry" id="match-' + match.matchId + '">';

    // Match header (always visible)
    html += '<div class="match-header" onclick="warUI._toggleMatchExpand(' + match.matchId + ')">';
    html += '<div>';
    html += '<strong>Match #' + match.matchId + '</strong> - ' + matchDate + '<br>';
    html += '<span style="color: ' + (match.winner === 'you' ? '#4ade80' : '#ef4444') + '">';
    html += winnerText + '</span>';
    html += ' | ' + match.totalRounds + ' rounds';
    html += ' | You ' + match.yourFinalScore + ' - Opp ' + match.oppFinalScore;
    html += '</div>';
    html += '<span class="expand-icon">▶</span>';
    html += '</div>';

    // Match rounds (collapsible)
    if (match.hasRoundHistory && match.rounds) {
        html += '<div class="match-rounds" id="match-rounds-' + match.matchId + '" style="display: none;">';
        for (var r = 0; r < match.rounds.length; r++) {
            html += this._renderRoundEntry(match.rounds[r]);
        }
        html += '</div>';
    } else {
        html += '<div class="match-rounds" id="match-rounds-' + match.matchId + '" style="display: none;">';
        html += '<p class="no-history">Round history unavailable (pruned to save space)</p>';
        html += '</div>';
    }

    html += '</div>';
    return html;
};

WarUI.prototype._toggleMatchExpand = function(matchId) {
    var matchDiv = document.getElementById('match-' + matchId);
    var roundsDiv = document.getElementById('match-rounds-' + matchId);
    var expandIcon = matchDiv.querySelector('.expand-icon');

    if (roundsDiv.style.display === 'none') {
        roundsDiv.style.display = 'block';
        expandIcon.textContent = '▼';
        matchDiv.classList.add('expanded');
    } else {
        roundsDiv.style.display = 'none';
        expandIcon.textContent = '▶';
        matchDiv.classList.remove('expanded');
    }
};

WarUI.prototype._formatTime = function(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleTimeString();
};
```

**Global Access:**
```javascript
// Make warUI accessible for onclick handlers
var warUI;
window.addEventListener('DOMContentLoaded', function() {
    warUI = new WarUI();
});
```

---

### Task 8: Integration with Game Flow (3-5k tokens)

**File:** `games/cards/war/index.html`

**Changes Needed:**

1. **Start match on game init:**
```javascript
WarUI.prototype._initGame = function() {
    // ... existing code ...

    // Start new match if needed
    if (!this._getCurrentMatch() || !this._getCurrentMatch().isCurrentMatch) {
        this._startNewMatch();
    }
};
```

2. **End match when game ends (non-endless mode):**
```javascript
WarUI.prototype._handleGameOver = function() {
    // ... existing code to determine winner ...

    // End current match
    this._endCurrentMatch(winner === 'player1' ? 'you' : 'opponent');

    // Start new match for next game
    setTimeout(function() {
        self._startNewMatch();
    }, 2000);
};
```

3. **Track rounds in _flip() method:**
```javascript
WarUI.prototype._flip = function() {
    // ... existing flip logic ...

    // After determining winner, add round entry
    if (!isWar) {
        this._addRoundEntry({
            yourCard: this.currentPlayer1Card,
            oppCard: this.currentPlayer2Card,
            winner: winner === 'player1' ? 'you' : 'opponent',
            isWar: false
        });
    }
};
```

4. **Track War rounds:**
This is the COMPLEX part - need to capture War cards before they're moved to graveyard.

**Challenge:** War handling in ruleset.js moves cards immediately. Need to:
- Capture cards in UI before calling engine
- Pass to _addRoundEntry after War resolves
- Handle nested Wars (War during War)

**Solution:** Listen to engine events or modify War flow to return card data.

---

## 🧪 TESTING PLAN

### Test Case 1: Basic Round Tracking
1. Start War game
2. Play 10 normal rounds (no Wars)
3. Open History → Current Match tab
4. Verify: 10 rounds displayed, newest first
5. Verify: Each round shows correct cards and winner

### Test Case 2: War Sequence Tracking
1. Play until War occurs (tied cards)
2. Complete War (3 hidden + 1 flipped each)
3. Open History → Current Match tab
4. Verify: War round shows all 8 cards (4 yours, 4 opponent's)
5. Verify: Hidden cards are revealed with values

### Test Case 3: Nested War
1. Trigger War
2. Trigger second War during first War (tied war flips)
3. Verify: Round entry shows both War sequences
4. Verify: All cards tracked correctly

### Test Case 4: Pruning Logic
1. Play 260 rounds in current match
2. Play and complete another match (30 rounds)
3. Start third match
4. Add 1 round to third match
5. Verify: Total rounds > 250
6. Verify: Second match rounds deleted (hasRoundHistory = false)
7. Verify: Current match (260 rounds) still fully preserved
8. Verify: First match metadata still exists

### Test Case 5: localStorage Persistence
1. Play 50 rounds
2. Refresh page
3. Open History → Current Match
4. Verify: All 50 rounds still there
5. Verify: Correct match continues

### Test Case 6: Match End (Non-Endless)
1. Turn off Auto-Shuffle
2. Play until one player wins
3. Verify: Match ends, winner recorded
4. Verify: New match starts
5. Open History → Previous Matches
6. Verify: Completed match listed with final scores

### Test Case 7: Clear Functions
1. Play some rounds
2. Click "Clear" on Current Match tab
3. Verify: Current match cleared, new one started
4. Verify: Stats reset
5. Play more, end match
6. Click "Clear All History"
7. Verify: Everything deleted

---

## 📝 FILES TO CREATE/MODIFY

### New Files:
1. `/games/cards/shared/card-utils.js` - Shared card rendering utility

### Modified Files:
1. `/games/cards/war/index.html` - Main implementation (400+ lines added)
   - Data structures
   - Round tracking logic
   - Pruning logic
   - localStorage methods
   - Tab UI HTML
   - Tab UI CSS
   - Tab UI JavaScript
   - Display rendering

### Integration Points:
- Load card-utils.js script
- Initialize match history on load
- Start match on game init
- Track rounds on flip
- End match on game over
- Update display when History modal opens

---

## ⚠️ RISKS & CHALLENGES

### High Risk:
1. **War Card Capture** - Capturing War sequence cards before they're moved to graveyard
   - Mitigation: Modify _flip() to store cards temporarily
   - May need to refactor War handling flow

2. **Nested War Complexity** - Tracking multiple War sequences in one round
   - Mitigation: Recursive data structure, test thoroughly
   - May need iteration to get right

### Medium Risk:
3. **localStorage Quota** - 250 rounds * card data = ~100KB, may hit 5MB limit with many matches
   - Mitigation: Threshold is adjustable, can lower if needed
   - Monitor localStorage usage in console

4. **Performance** - Rendering 250+ round entries in UI
   - Mitigation: Collapsible matches, only render when expanded
   - Virtual scrolling if needed (future enhancement)

### Low Risk:
5. **Safari Compatibility** - Must use var, no arrow functions, no modern JS
   - Mitigation: Following existing codebase patterns
   - Test in Safari after implementation

---

## 📊 TOKEN ESTIMATE BREAKDOWN

| Task | Estimated Tokens | Complexity |
|------|-----------------|------------|
| 1. Shared card-utils.js | 3-5k | Low |
| 2. Data structures | 2-3k | Low |
| 3. Round tracking | 5-8k | High (War cards) |
| 4. Pruning logic | 3-5k | Medium |
| 5. localStorage | 2-3k | Low |
| 6. Tab UI (HTML/CSS/JS) | 4-6k | Medium |
| 7. Display rendering | 6-10k | High (complex HTML) |
| 8. Game flow integration | 3-5k | Medium (War capture) |
| **TOTAL** | **28-45k** | - |

**Conservative Estimate:** 30k tokens
**Realistic Estimate:** 35k tokens
**Maximum Estimate:** 45k tokens (if War tracking requires significant refactoring)

---

## ✅ APPROVAL CHECKLIST

Before proceeding, confirm:
- [ ] Data structures match user expectations
- [ ] Pruning logic is correct (current match always preserved)
- [ ] UI layout is acceptable (tabs, collapsible matches)
- [ ] 250 round threshold is appropriate
- [ ] Token estimate is within remaining budget (~96k)
- [ ] Scope is clear and achievable

---

## 🚀 EXECUTION PLAN

If approved, implement in this order:

1. **Create card-utils.js** (quick win, low risk)
2. **Add data structures** (foundation for everything else)
3. **Implement localStorage** (save/load methods)
4. **Add basic round tracking** (non-War rounds first)
5. **Add tab UI** (HTML/CSS/JavaScript)
6. **Add display rendering** (show rounds/matches)
7. **Implement pruning logic** (threshold management)
8. **Add War round tracking** (complex, save for last)
9. **Test and debug**
10. **Commit changes**

---

**Status:** ⏳ Awaiting user approval to proceed

**Questions for User:**
1. Does the 250 round threshold seem reasonable? Should it be higher/lower?
2. Are you OK with War card tracking being the most complex part (may require some iteration)?
3. Should threshold be user-adjustable in Settings, or keep it hard-coded?
4. Any concerns about the scope or token estimate?
