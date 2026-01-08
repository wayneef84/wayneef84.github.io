// Xiangqi Rules Engine - "The Referee"
// Validates all piece movements and game rules

const XiangqiRules = {
    /**
     * Main validation function - checks if a move is legal
     * @param {Array} board - 10x9 board array
     * @param {number} fromRow - Source row
     * @param {number} fromCol - Source column
     * @param {number} toRow - Destination row
     * @param {number} toCol - Destination column
     * @param {string} currentPlayer - 'red' or 'black'
     * @returns {boolean} - true if move is legal
     */
    isValidMove(board, fromRow, fromCol, toRow, toCol, currentPlayer) {
        // Bounds check
        if (toRow < 0 || toRow >= 10 || toCol < 0 || toCol >= 9) {
            return false;
        }

        const piece = board[fromRow][fromCol];
        if (!piece) return false;

        // Can't move if it's not your piece
        if (piece.player !== currentPlayer) {
            return false;
        }

        // Can't capture your own pieces
        const targetPiece = board[toRow][toCol];
        if (targetPiece && targetPiece.player === piece.player) {
            return false;
        }

        // Can't move to same position
        if (fromRow === toRow && fromCol === toCol) {
            return false;
        }

        // Check piece-specific movement rules
        let isValidPieceMove = false;
        switch (piece.type) {
            case 'general':
                isValidPieceMove = this.isValidGeneralMove(board, fromRow, fromCol, toRow, toCol, piece.player);
                break;
            case 'advisor':
                isValidPieceMove = this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.player);
                break;
            case 'elephant':
                isValidPieceMove = this.isValidElephantMove(board, fromRow, fromCol, toRow, toCol, piece.player);
                break;
            case 'horse':
                isValidPieceMove = this.isValidHorseMove(board, fromRow, fromCol, toRow, toCol);
                break;
            case 'chariot':
                isValidPieceMove = this.isValidChariotMove(board, fromRow, fromCol, toRow, toCol);
                break;
            case 'cannon':
                isValidPieceMove = this.isValidCannonMove(board, fromRow, fromCol, toRow, toCol, targetPiece);
                break;
            case 'soldier':
                isValidPieceMove = this.isValidSoldierMove(fromRow, fromCol, toRow, toCol, piece.player);
                break;
            default:
                return false;
        }

        if (!isValidPieceMove) {
            return false;
        }

        // Check Flying General rule (generals can't face each other)
        return this.checkFlyingGeneralRule(board, fromRow, fromCol, toRow, toCol);
    },

    /**
     * General (帥/將): Moves 1 step orthogonally within palace
     * Cannot face opponent's general directly
     */
    isValidGeneralMove(board, fromRow, fromCol, toRow, toCol, player) {
        // Must move exactly 1 step orthogonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
            return false;
        }

        // Must stay within palace
        return this.isInPalace(toRow, toCol, player);
    },

    /**
     * Advisor (仕/士): Moves 1 step diagonally within palace
     */
    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, player) {
        // Must move exactly 1 step diagonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (rowDiff !== 1 || colDiff !== 1) {
            return false;
        }

        // Must stay within palace
        return this.isInPalace(toRow, toCol, player);
    },

    /**
     * Elephant (相/象): Moves exactly 2 steps diagonally, cannot cross river, can be blocked
     */
    isValidElephantMove(board, fromRow, fromCol, toRow, toCol, player) {
        // Must move exactly 2 steps diagonally
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (rowDiff !== 2 || colDiff !== 2) {
            return false;
        }

        // Cannot cross river
        if (player === 'red' && toRow > 4) {
            return false; // Red elephant can't cross into rows 5-9
        }
        if (player === 'black' && toRow < 5) {
            return false; // Black elephant can't cross into rows 0-4
        }

        // Check if path is blocked (elephant eye)
        const midRow = fromRow + (toRow - fromRow) / 2;
        const midCol = fromCol + (toCol - fromCol) / 2;

        return !board[midRow][midCol]; // Path must be clear
    },

    /**
     * Horse (馬): Moves in "L" shape (1 step orthogonal + 1 step diagonal)
     * Can be blocked at the first step (hobbling the horse)
     */
    isValidHorseMove(board, fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        // Must move in L-shape: (2,1) or (1,2)
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;
        }

        // Check blocking position (the first orthogonal step)
        let blockRow, blockCol;

        if (rowDiff === 2) {
            // Moving 2 steps vertically, 1 step horizontally
            blockRow = fromRow + (toRow - fromRow) / 2;
            blockCol = fromCol;
        } else {
            // Moving 2 steps horizontally, 1 step vertically
            blockRow = fromRow;
            blockCol = fromCol + (toCol - fromCol) / 2;
        }

        return !board[blockRow][blockCol]; // Blocking position must be clear
    },

    /**
     * Chariot (車): Moves any distance in straight lines (orthogonally)
     * Cannot jump over pieces
     */
    isValidChariotMove(board, fromRow, fromCol, toRow, toCol) {
        // Must move in straight line (same row or same column)
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }

        // Check path is clear
        return this.isPathClear(board, fromRow, fromCol, toRow, toCol);
    },

    /**
     * Cannon (炮): Moves like chariot, but must jump exactly one piece to capture
     */
    isValidCannonMove(board, fromRow, fromCol, toRow, toCol, targetPiece) {
        // Must move in straight line
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }

        const piecesBetween = this.countPiecesBetween(board, fromRow, fromCol, toRow, toCol);

        if (targetPiece) {
            // Capturing: must jump exactly one piece
            return piecesBetween === 1;
        } else {
            // Moving (not capturing): path must be clear
            return piecesBetween === 0;
        }
    },

    /**
     * Soldier (兵/卒): Moves 1 step forward, can move sideways after crossing river
     */
    isValidSoldierMove(fromRow, fromCol, toRow, toCol, player) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        // Must move exactly 1 step
        if (Math.abs(rowDiff) + colDiff !== 1) {
            return false;
        }

        if (player === 'red') {
            // Red soldiers move up (increasing row)
            // Can only move forward before crossing river (row <= 4)
            if (fromRow <= 4) {
                return rowDiff === 1 && colDiff === 0;
            } else {
                // After crossing river, can move forward or sideways
                return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
            }
        } else {
            // Black soldiers move down (decreasing row)
            // Can only move forward before crossing river (row >= 5)
            if (fromRow >= 5) {
                return rowDiff === -1 && colDiff === 0;
            } else {
                // After crossing river, can move forward or sideways
                return (rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
            }
        }
    },

    /**
     * Flying General Rule: Generals cannot face each other on same column
     * with no pieces between them
     */
    checkFlyingGeneralRule(board, fromRow, fromCol, toRow, toCol) {
        // Create temporary board with the move applied
        const tempBoard = board.map(row => [...row]);
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;

        // Find both generals
        let redGeneralPos = null;
        let blackGeneralPos = null;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = tempBoard[row][col];
                if (piece && piece.type === 'general') {
                    if (piece.player === 'red') {
                        redGeneralPos = { row, col };
                    } else {
                        blackGeneralPos = { row, col };
                    }
                }
            }
        }

        // If both generals exist and are on same column
        if (redGeneralPos && blackGeneralPos && redGeneralPos.col === blackGeneralPos.col) {
            // Check if there are any pieces between them
            const minRow = Math.min(redGeneralPos.row, blackGeneralPos.row);
            const maxRow = Math.max(redGeneralPos.row, blackGeneralPos.row);
            const col = redGeneralPos.col;

            for (let row = minRow + 1; row < maxRow; row++) {
                if (tempBoard[row][col]) {
                    return true; // There's a piece between them, move is valid
                }
            }

            // No pieces between generals - Flying General violation
            return false;
        }

        return true; // Generals not facing, move is valid
    },

    /**
     * Helper: Check if position is within palace bounds
     */
    isInPalace(row, col, player) {
        // Palace columns are always 3, 4, 5
        if (col < 3 || col > 5) {
            return false;
        }

        if (player === 'red') {
            return row >= 0 && row <= 2; // Red palace: rows 0-2
        } else {
            return row >= 7 && row <= 9; // Black palace: rows 7-9
        }
    },

    /**
     * Helper: Check if path is clear between two positions (for Chariot)
     */
    isPathClear(board, fromRow, fromCol, toRow, toCol) {
        if (fromRow === toRow) {
            // Horizontal movement
            const minCol = Math.min(fromCol, toCol);
            const maxCol = Math.max(fromCol, toCol);

            for (let col = minCol + 1; col < maxCol; col++) {
                if (board[fromRow][col]) {
                    return false;
                }
            }
        } else {
            // Vertical movement
            const minRow = Math.min(fromRow, toRow);
            const maxRow = Math.max(fromRow, toRow);

            for (let row = minRow + 1; row < maxRow; row++) {
                if (board[row][fromCol]) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Helper: Count pieces between two positions (for Cannon)
     */
    countPiecesBetween(board, fromRow, fromCol, toRow, toCol) {
        let count = 0;

        if (fromRow === toRow) {
            // Horizontal movement
            const minCol = Math.min(fromCol, toCol);
            const maxCol = Math.max(fromCol, toCol);

            for (let col = minCol + 1; col < maxCol; col++) {
                if (board[fromRow][col]) {
                    count++;
                }
            }
        } else {
            // Vertical movement
            const minRow = Math.min(fromRow, toRow);
            const maxRow = Math.max(fromRow, toRow);

            for (let row = minRow + 1; row < maxRow; row++) {
                if (board[row][fromCol]) {
                    count++;
                }
            }
        }

        return count;
    }
};
