/**
 * XIANGQI AI ENGINE
 * File: js/ai.js
 */

const XiangqiAI = {
    PIECE_VALUES: {
        'general': 10000, 'advisor': 20, 'elephant': 20,
        'horse': 40, 'chariot': 90, 'cannon': 45, 'soldier': 10
    },

    // POSITIONAL TABLES (Standard: Optimized for "Moving Down" / Top Player)
    POSITION_TABLES: {
        'soldier': [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 6, 9, 12, 15, 12, 9, 6, 3], // Row 3
            [3, 6, 9, 12, 15, 12, 9, 6, 3],
            [4, 8, 12, 16, 20, 16, 12, 8, 4], // Row 5 (River Crossed)
            [4, 8, 12, 18, 24, 18, 12, 8, 4],
            [5, 10, 15, 20, 25, 20, 15, 10, 5],
            [5, 10, 15, 20, 25, 20, 15, 10, 5],
            [6, 12, 18, 24, 30, 24, 18, 12, 6]
        ],
        'horse': [
            [0, -4, 0, 0, 0, 0, 0, -4, 0],
            [0, 2, 4, 4, 4, 4, 4, 2, 0],
            [4, 2, 8, 8, 8, 8, 8, 2, 4],
            [2, 6, 8, 6, 10, 6, 8, 6, 2],
            [4, 12, 16, 14, 12, 14, 16, 12, 4],
            [4, 10, 28, 16, 8, 16, 28, 10, 4],
            [4, 8, 16, 12, 4, 12, 16, 8, 4],
            [2, 6, 8, 6, 10, 6, 8, 6, 2],
            [4, 2, 8, 8, 8, 8, 8, 2, 4],
            [0, -4, 0, 0, 0, 0, 0, -4, 0]
        ],
        'chariot': [
            [-2, 10, 6, 14, 12, 14, 6, 10, -2],
            [8, 4, 8, 16, 8, 16, 8, 4, 8],
            [4, 8, 6, 14, 12, 14, 6, 8, 4],
            [6, 10, 8, 14, 14, 14, 8, 10, 6],
            [12, 16, 14, 20, 20, 20, 14, 16, 12],
            [12, 14, 12, 18, 18, 18, 12, 14, 12],
            [12, 18, 16, 22, 22, 22, 16, 18, 12],
            [12, 12, 12, 18, 18, 18, 12, 12, 12],
            [16, 20, 18, 24, 26, 24, 18, 20, 16],
            [14, 14, 12, 18, 16, 18, 12, 14, 14]
        ],
        'cannon': [
            [0, 0, 2, 6, 6, 6, 2, 0, 0],
            [0, 2, 4, 6, 6, 6, 4, 2, 0],
            [4, 0, 8, 6, 10, 6, 8, 0, 4],
            [0, 0, 0, 2, 4, 2, 0, 0, 0],
            [2, 2, 0, -4, -8, -4, 0, 2, 2],
            [2, 2, 0, -4, -8, -4, 0, 2, 2],
            [0, 0, 0, 2, 4, 2, 0, 0, 0],
            [4, 0, 8, 6, 10, 6, 8, 0, 4],
            [0, 2, 4, 6, 6, 6, 4, 2, 0],
            [0, 0, 2, 6, 6, 6, 2, 0, 0]
        ]
    },

    // --- EVALUATION ENGINE ---
    
    getBestMove(board, player, difficulty) {
        // Level 1: Random (Easy)
        if (difficulty === 1) {
            const moves = this.getAllMoves(board, player);
            if (!moves.length) return null;
            // Try to capture if possible
            const captures = moves.filter(m => board[m.to.row][m.to.col]);
            if (captures.length) return captures[Math.floor(Math.random() * captures.length)];
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // Level 2/3: Evaluation based
        const moves = this.getAllMoves(board, player);
        if (!moves.length) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        // Shuffle moves to add randomness to equal choices
        moves.sort(() => Math.random() - 0.5);

        for (let move of moves) {
            let score = this.evaluateMove(board, move, player);
            
            // Lookahead (Level 3) - Very basic implementation (Minimax Lite)
            if (difficulty >= 3) {
                 // Subtract the opponent's best response value?
                 // For now, let's stick to deep static evaluation to keep it fast
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    },

    evaluateMove(board, move, player) {
        const piece = board[move.from.row][move.from.col];
        const target = board[move.to.row][move.to.col];
        
        // 1. Material Gain (Capture)
        let score = target ? this.PIECE_VALUES[target.type] : 0;
        
        // 2. Positional Gain (Moving to a better spot)
        // We compare the value of the NEW square vs the OLD square
        const currentPosValue = this.getPositionalValue(piece, move.from.row, move.from.col, player);
        const newPosValue = this.getPositionalValue(piece, move.to.row, move.to.col, player);
        
        score += (newPosValue - currentPosValue);

        // 3. Threat detection (Simple)
        // If we move to a spot where we can capture a General, that's huge
        // (Handled by checking next moves roughly)

        return score;
    },

    getPositionalValue(piece, row, col, player) {
        const table = this.POSITION_TABLES[piece.type];
        if (!table) return 0;

        if (player === 'black') {
            // Black (Top) moves DOWN. The table is designed for moving down (increasing indices).
            return table[row][col];
        } else {
            // Red (Bottom) moves UP. We must mirror the table vertically.
            return table[9 - row][col];
        }
    },

    getAllMoves(board, player) {
        let moves = [];
        for(let r=0; r<10; r++) {
            for(let c=0; c<9; c++) {
                const p = board[r][c];
                if(p && p.player === player) {
                    for(let tr=0; tr<10; tr++) {
                        for(let tc=0; tc<9; tc++) {
                            if(XiangqiRules.isValidMove(board, r, c, tr, tc, player)) {
                                moves.push({ from: {row:r, col:c}, to: {row:tr, col:tc} });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
};