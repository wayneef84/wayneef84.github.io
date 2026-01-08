// Xiangqi AI Engine - "The Brain"
// Implements Minimax algorithm with alpha-beta pruning

const XiangqiAI = {
    // Piece values for board evaluation
    PIECE_VALUES: {
        'general': 10000,
        'advisor': 20,
        'elephant': 20,
        'horse': 40,
        'chariot': 90,
        'cannon': 45,
        'soldier': 10
    },

    // Positional bonus tables (row-indexed for red's perspective)
    // Black's positions are mirrored
    POSITION_TABLES: {
        'soldier': [
            [0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 0
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 6, 9, 12, 15, 12, 9, 6, 3], // Row 3 - soldiers
            [3, 6, 9, 12, 15, 12, 9, 6, 3],
            [4, 8, 12, 16, 20, 16, 12, 8, 4], // Row 5 - crossed river
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

    /**
     * Main entry point - gets best move for AI
     * @param {Array} board - Current board state
     * @param {string} player - 'red' or 'black'
     * @param {number} difficulty - 1, 2, or 3
     * @returns {Object} - {from: {row, col}, to: {row, col}}
     */
    getBestMove(board, player, difficulty) {
        const depth = this.getDifficultyDepth(difficulty);
        const moves = this.getAllLegalMoves(board, player);

        if (moves.length === 0) {
            return null; // No legal moves (game over)
        }

        let bestMove = null;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Evaluate each move
        for (const move of moves) {
            const tempBoard = this.applyMove(board, move);
            const score = -this.minimax(
                tempBoard,
                depth - 1,
                -beta,
                -alpha,
                player === 'red' ? 'black' : 'red',
                player
            );

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            alpha = Math.max(alpha, score);
            if (alpha >= beta) {
                break; // Alpha-beta pruning
            }
        }

        return bestMove;
    },

    /**
     * Minimax algorithm with alpha-beta pruning
     */
    minimax(board, depth, alpha, beta, currentPlayer, aiPlayer) {
        if (depth === 0) {
            return this.evaluateBoard(board, aiPlayer);
        }

        const moves = this.getAllLegalMoves(board, currentPlayer);

        if (moves.length === 0) {
            // No legal moves - game over
            // If it's AI's turn and no moves, AI loses (very bad)
            // If it's opponent's turn and no moves, AI wins (very good)
            return currentPlayer === aiPlayer ? -100000 : 100000;
        }

        let maxScore = -Infinity;

        for (const move of moves) {
            const tempBoard = this.applyMove(board, move);
            const score = -this.minimax(
                tempBoard,
                depth - 1,
                -beta,
                -alpha,
                currentPlayer === 'red' ? 'black' : 'red',
                aiPlayer
            );

            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);

            if (alpha >= beta) {
                break; // Beta cutoff
            }
        }

        return maxScore;
    },

    /**
     * Evaluate board position from AI's perspective
     */
    evaluateBoard(board, aiPlayer) {
        let score = 0;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = board[row][col];
                if (!piece) continue;

                // Material value
                let pieceScore = this.PIECE_VALUES[piece.type];

                // Positional bonus
                const posTable = this.POSITION_TABLES[piece.type];
                if (posTable) {
                    const posRow = piece.player === 'red' ? row : (9 - row);
                    pieceScore += posTable[posRow][col];
                }

                // Add or subtract based on piece owner
                if (piece.player === aiPlayer) {
                    score += pieceScore;
                } else {
                    score -= pieceScore;
                }
            }
        }

        return score;
    },

    /**
     * Get all legal moves for a player
     */
    getAllLegalMoves(board, player) {
        const moves = [];

        for (let fromRow = 0; fromRow < 10; fromRow++) {
            for (let fromCol = 0; fromCol < 9; fromCol++) {
                const piece = board[fromRow][fromCol];
                if (!piece || piece.player !== player) continue;

                // Try all possible destinations
                for (let toRow = 0; toRow < 10; toRow++) {
                    for (let toCol = 0; toCol < 9; toCol++) {
                        if (XiangqiRules.isValidMove(board, fromRow, fromCol, toRow, toCol, player)) {
                            moves.push({
                                from: { row: fromRow, col: fromCol },
                                to: { row: toRow, col: toCol }
                            });
                        }
                    }
                }
            }
        }

        return moves;
    },

    /**
     * Apply a move to the board (returns new board, doesn't mutate original)
     */
    applyMove(board, move) {
        const newBoard = board.map(row => [...row]);
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
        newBoard[move.from.row][move.from.col] = null;
        return newBoard;
    },

    /**
     * Convert difficulty level to search depth
     */
    getDifficultyDepth(difficulty) {
        switch (difficulty) {
            case 1: return 1; // Easy - greedy
            case 2: return 2; // Medium - thinks 1 move ahead
            case 3: return 4; // Hard - thinks 2 moves ahead
            default: return 2;
        }
    }
};
