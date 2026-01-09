/**
 * XIANGQI RULES ENGINE
 * File: js/rules.js
 */

const XiangqiRules = {
    // --- 1. GEOMETRY VALIDATION ---
    isValidMove(board, fromRow, fromCol, toRow, toCol, currentPlayer) {
        // Bounds Check
        if (toRow < 0 || toRow >= 10 || toCol < 0 || toCol >= 9) return false;
        
        const piece = board[fromRow][fromCol];
        const target = board[toRow][toCol];

        if (!piece || piece.player !== currentPlayer) return false;
        if (target && target.player === currentPlayer) return false; // Friendly Fire
        if (fromRow === toRow && fromCol === toCol) return false;

        // Piece Specific Rules
        switch (piece.type) {
            case 'soldier': return this.isValidSoldierMove(fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'chariot': return this.isValidChariotMove(board, fromRow, fromCol, toRow, toCol);
            case 'horse':   return this.isValidHorseMove(board, fromRow, fromCol, toRow, toCol);
            case 'cannon':  return this.isValidCannonMove(board, fromRow, fromCol, toRow, toCol, target);
            case 'advisor': return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'elephant': return this.isValidElephantMove(board, fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'general': return this.isValidGeneralMove(board, fromRow, fromCol, toRow, toCol, currentPlayer);
        }
        return false;
    },

    // --- 2. SAFETY CHECKS (Check & Flying General) ---

    // Would this move leave the player in Check?
    willMoveCauseCheck(board, fromRow, fromCol, toRow, toCol, player) {
        // 1. Simulate Move
        const simBoard = this.simulateMove(board, fromRow, fromCol, toRow, toCol);
        
        // 2. Check for Flying General (Kings Facing)
        if (this.isFlyingGeneral(simBoard)) return true;

        // 3. Check for Standard Check
        return this.isInCheck(simBoard, player);
    },

    isInCheck(board, player) {
        // Find General
        let gR = -1, gC = -1;
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p = board[r][c];
            if(p && p.type === 'general' && p.player === player) { gR = r; gC = c; break; }
        }
        if (gR === -1) return true; // General captured

        // Check attacks from enemy
        const enemy = player === 'red' ? 'black' : 'red';
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p = board[r][c];
            if(p && p.player === enemy) {
                // Can enemy hit General?
                if(this.isValidMove(board, r, c, gR, gC, enemy)) return true;
            }
        }
        return false;
    },

    isFlyingGeneral(board) {
        // Find Red General
        let rR = -1, rC = -1;
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p = board[r][c];
            if(p && p.type === 'general' && p.player === 'red') { rR = r; rC = c; break; }
        }
        // Find Black General
        let bR = -1, bC = -1;
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p = board[r][c];
            if(p && p.type === 'general' && p.player === 'black') { bR = r; bC = c; break; }
        }

        if (rR === -1 || bR === -1) return false;

        // Are they on the same column?
        if (rC !== bC) return false;

        // Are there pieces between them?
        // Red is Bottom (Higher Row), Black is Top (Lower Row)
        // Scan from Black+1 to Red-1
        const minR = Math.min(rR, bR);
        const maxR = Math.max(rR, bR);
        
        for(let r = minR + 1; r < maxR; r++) {
            if (board[r][rC]) return false; // Found a blocker
        }
        
        return true; // No blockers = Flying General!
    },

    isCheckmate(board, player) {
        // Try EVERY possible move to see if we can escape
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p = board[r][c];
            if(p && p.player === player) {
                for(let tr=0; tr<10; tr++) for(let tc=0; tc<9; tc++) {
                    if(this.isValidMove(board, r, c, tr, tc, player)) {
                        if(!this.willMoveCauseCheck(board, r, c, tr, tc, player)) {
                            return false; // Found a safe move
                        }
                    }
                }
            }
        }
        return true; // No safe moves
    },

    simulateMove(board, fr, fc, tr, tc) {
        const newBoard = board.map(row => row.map(cell => cell ? {...cell} : null));
        newBoard[tr][tc] = newBoard[fr][fc];
        newBoard[fr][fc] = null;
        return newBoard;
    },

    // --- 3. PIECE RULES ---

    isValidSoldierMove(r1, c1, r2, c2, player) {
        const dr = r2 - r1; 
        const dc = Math.abs(c2 - c1);
        if (player === 'red') {
            // RED (Bottom) moves UP (-1)
            const crossedRiver = r1 <= 4; // Past the river
            if (dr === -1 && dc === 0) return true; // Forward
            if (crossedRiver && dr === 0 && dc === 1) return true; // Side
        } else {
            // BLACK (Top) moves DOWN (+1)
            const crossedRiver = r1 >= 5; // Past the river
            if (dr === 1 && dc === 0) return true; // Forward
            if (crossedRiver && dr === 0 && dc === 1) return true; // Side
        }
        return false;
    },

    isValidElephantMove(board, r1, c1, r2, c2, player) {
        if (Math.abs(r2 - r1) !== 2 || Math.abs(c2 - c1) !== 2) return false;
        
        // Boundaries
        if (player === 'red' && r2 < 5) return false;   // Must stay Bottom (5-9)
        if (player === 'black' && r2 > 4) return false; // Must stay Top (0-4)

        // Eye Check
        const midR = (r1 + r2) / 2;
        const midC = (c1 + c2) / 2;
        return !board[midR][midC];
    },

    isValidAdvisorMove(r1, c1, r2, c2, player) {
        if (Math.abs(r2 - r1) !== 1 || Math.abs(c2 - c1) !== 1) return false;
        return this.isInPalace(r2, c2, player);
    },

    isValidGeneralMove(board, r1, c1, r2, c2, player) {
        if (Math.abs(r2 - r1) + Math.abs(c2 - c1) !== 1) return false;
        return this.isInPalace(r2, c2, player);
    },

    isValidChariotMove(board, r1, c1, r2, c2) {
        if (r1 !== r2 && c1 !== c2) return false;
        return this.countObstacles(board, r1, c1, r2, c2) === 0;
    },

    isValidCannonMove(board, r1, c1, r2, c2, target) {
        if (r1 !== r2 && c1 !== c2) return false;
        const obs = this.countObstacles(board, r1, c1, r2, c2);
        return target ? obs === 1 : obs === 0;
    },

    isValidHorseMove(board, r1, c1, r2, c2) {
        const dr = Math.abs(r2 - r1);
        const dc = Math.abs(c2 - c1);
        if (!((dr === 2 && dc === 1) || (dr === 1 && dc === 2))) return false;
        
        const legR = r1 + (r2 - r1 > 0 ? 1 : -1) * (dr===2?1:0);
        const legC = c1 + (c2 - c1 > 0 ? 1 : -1) * (dc===2?1:0);
        return !board[legR][legC];
    },

    countObstacles(board, r1, c1, r2, c2) {
        let count = 0;
        if (r1 === r2) {
            const min = Math.min(c1,c2)+1; const max = Math.max(c1,c2);
            for(let c=min; c<max; c++) if(board[r1][c]) count++;
        } else {
            const min = Math.min(r1,r2)+1; const max = Math.max(r1,r2);
            for(let r=min; r<max; r++) if(board[r][c1]) count++;
        }
        return count;
    },

    isInPalace(r, c, player) {
        if (c < 3 || c > 5) return false;
        return player === 'red' ? (r >= 7 && r <= 9) : (r >= 0 && r <= 2);
    }
};