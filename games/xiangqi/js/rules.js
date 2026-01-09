/**
 * XIANGQI RULES (Standard: Red Bottom, Black Top)
 * File: js/rules.js
 */

const XiangqiRules = {
    isValidMove(board, fromRow, fromCol, toRow, toCol, currentPlayer) {
        if (toRow < 0 || toRow >= 10 || toCol < 0 || toCol >= 9) return false;
        
        const piece = board[fromRow][fromCol];
        const target = board[toRow][toCol];

        if (!piece || piece.player !== currentPlayer) return false;
        if (target && target.player === currentPlayer) return false;
        if (fromRow === toRow && fromCol === toCol) return false;

        switch (piece.type) {
            case 'soldier': return this.isValidSoldierMove(fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'chariot': return this.isValidChariotMove(board, fromRow, fromCol, toRow, toCol);
            case 'horse':   return this.isValidHorseMove(board, fromRow, fromCol, toRow, toCol);
            case 'cannon':  return this.isValidCannonMove(board, fromRow, fromCol, toRow, toCol, target);
            case 'advisor': return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'elephant': return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, currentPlayer);
            case 'general': return this.isValidGeneralMove(board, fromRow, fromCol, toRow, toCol, currentPlayer);
        }
        return false;
    },

    // --- SOLDIER LOGIC ---
    isValidSoldierMove(r1, c1, r2, c2, player) {
        const dr = r2 - r1; 
        const dc = Math.abs(c2 - c1);

        if (player === 'red') {
            // RED (Bottom) moves UP (-1)
            const crossedRiver = r1 <= 4; // 0-4 is Enemy Side
            
            if (dr === -1 && dc === 0) return true; // Forward
            if (crossedRiver && dr === 0 && dc === 1) return true; // Side
        } else {
            // BLACK (Top) moves DOWN (+1)
            const crossedRiver = r1 >= 5; // 5-9 is Enemy Side
            
            if (dr === 1 && dc === 0) return true; // Forward
            if (crossedRiver && dr === 0 && dc === 1) return true; // Side
        }
        return false;
    },

    isValidElephantMove(r1, c1, r2, c2, player) {
        if (Math.abs(r2 - r1) !== 2 || Math.abs(c2 - c1) !== 2) return false;
        
        // Red must stay Bottom (5-9)
        if (player === 'red' && r2 < 5) return false;
        // Black must stay Top (0-4)
        if (player === 'black' && r2 > 4) return false;

        return true; 
    },

    isValidAdvisorMove(r1, c1, r2, c2, player) {
        if (Math.abs(r2 - r1) !== 1 || Math.abs(c2 - c1) !== 1) return false;
        return this.isInPalace(r2, c2, player);
    },

    isValidGeneralMove(board, r1, c1, r2, c2, player) {
        const dr = Math.abs(r2 - r1);
        const dc = Math.abs(c2 - c1);
        if (dr + dc !== 1) return false; 
        return this.isInPalace(r2, c2, player);
    },

    isInPalace(row, col, player) {
        if (col < 3 || col > 5) return false;
        // Red Palace (Bottom)
        if (player === 'red') return row >= 7 && row <= 9;
        // Black Palace (Top)
        return row >= 0 && row <= 2;
    },

    isValidChariotMove(board, r1, c1, r2, c2) {
        if (r1 !== r2 && c1 !== c2) return false;
        return this.countObstacles(board, r1, c1, r2, c2) === 0;
    },

    isValidCannonMove(board, r1, c1, r2, c2, target) {
        if (r1 !== r2 && c1 !== c2) return false;
        const obstacles = this.countObstacles(board, r1, c1, r2, c2);
        if (!target) return obstacles === 0;
        return obstacles === 1;
    },

    isValidHorseMove(board, r1, c1, r2, c2) {
        const dr = Math.abs(r2 - r1);
        const dc = Math.abs(c2 - c1);
        if (!((dr === 2 && dc === 1) || (dr === 1 && dc === 2))) return false;
        const legRow = r1 + (r2 - r1 > 0 ? 1 : -1) * (dr === 2 ? 1 : 0);
        const legCol = c1 + (c2 - c1 > 0 ? 1 : -1) * (dc === 2 ? 1 : 0);
        if (board[legRow][legCol]) return false;
        return true;
    },

    countObstacles(board, r1, c1, r2, c2) {
        let count = 0;
        if (r1 === r2) {
            const min = Math.min(c1, c2) + 1;
            const max = Math.max(c1, c2);
            for (let c = min; c < max; c++) if (board[r1][c]) count++;
        } else {
            const min = Math.min(r1, r2) + 1;
            const max = Math.max(r1, r2);
            for (let r = min; r < max; r++) if (board[r][c1]) count++;
        }
        return count;
    }
};