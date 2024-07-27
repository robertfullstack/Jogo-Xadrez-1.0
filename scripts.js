const board = document.getElementById('chessBoard');

const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};

const initialBoard = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
];

let selectedPiece = null;
let isWhiteTurn = true;

function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = initialBoard[row][col];
            if (piece) {
                square.textContent = pieces[piece];
                square.dataset.piece = piece;
            }

            square.addEventListener('click', onSquareClick);

            board.appendChild(square);
        }
    }
}

function onSquareClick(event) {
    const square = event.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = square.dataset.piece;

    if (selectedPiece) {
        movePiece(selectedPiece, row, col);
    } else if (piece && isPieceColor(piece, isWhiteTurn ? 'white' : 'black')) {
        selectPiece(square);
    }
}

function selectPiece(square) {
    deselectPiece();
    selectedPiece = square;
    square.classList.add('highlight');
}

function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('highlight');
        selectedPiece = null;
    }
}

function movePiece(square, row, col) {
    const piece = square.dataset.piece;
    const targetPiece = initialBoard[row][col];

    if (isValidMove(piece, parseInt(square.dataset.row), parseInt(square.dataset.col), row, col)) {
        initialBoard[square.dataset.row][square.dataset.col] = '';
        initialBoard[row][col] = piece;
        deselectPiece();
        isWhiteTurn = !isWhiteTurn;
        createBoard();
        if (!isWhiteTurn) {
            setTimeout(botMove, 500);
        }
    }
}

function isPieceColor(piece, color) {
    return color === 'white' ? piece === piece.toLowerCase() : piece === piece.toUpperCase();
}

function botMove() {
    const moves = getAllPossibleMoves('black');
    if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        movePiece(document.querySelector(`[data-row="${randomMove.fromRow}"][data-col="${randomMove.fromCol}"]`), randomMove.toRow, randomMove.toCol);
    }
}

function getAllPossibleMoves(color) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoard[row][col];
            if (piece && isPieceColor(piece, color === 'white' ? 'white' : 'black')) {
                const possibleMoves = getPossibleMovesForPiece(piece, row, col);
                possibleMoves.forEach(move => moves.push({ fromRow: row, fromCol: col, toRow: move[0], toCol: move[1] }));
            }
        }
    }
    return moves;
}

function getPossibleMovesForPiece(piece, row, col) {
    const moves = [];
    switch (piece.toLowerCase()) {
        case 'p':
            moves.push(...getPawnMoves(piece, row, col));
            break;
        case 'r':
            moves.push(...getRookMoves(row, col));
            break;
        case 'n':
            moves.push(...getKnightMoves(row, col));
            break;
        case 'b':
            moves.push(...getBishopMoves(row, col));
            break;
        case 'q':
            moves.push(...getQueenMoves(row, col));
            break;
        case 'k':
            moves.push(...getKingMoves(row, col));
            break;
    }
    return moves;
}

function getPawnMoves(piece, row, col) {
    const moves = [];
    const direction = isPieceColor(piece, 'white') ? -1 : 1;
    const startRow = isPieceColor(piece, 'white') ? 6 : 1;

    // Move forward
    if (initialBoard[row + direction][col] === '') {
        moves.push([row + direction, col]);
        // Move two squares forward from starting position
        if (row === startRow && initialBoard[row + 2 * direction][col] === '') {
            moves.push([row + 2 * direction, col]);
        }
    }

    // Capture diagonally
    for (let i = -1; i <= 1; i += 2) {
        if (col + i >= 0 && col + i < 8) {
            const targetPiece = initialBoard[row + direction][col + i];
            if (targetPiece && isPieceColor(targetPiece, isPieceColor(piece, 'white') ? 'black' : 'white')) {
                moves.push([row + direction, col + i]);
            }
        }
    }

    return moves;
}

function getRookMoves(row, col) {
    const moves = [];
    for (let i = -1; i <= 1; i += 2) {
        for (let j = 1; j < 8; j++) {
            if (row + j * i >= 0 && row + j * i < 8) {
                if (initialBoard[row + j * i][col] === '') {
                    moves.push([row + j * i, col]);
                } else {
                    if (!isPieceColor(initialBoard[row + j * i][col], isPieceColor(initialBoard[row][col], 'white') ? 'white' : 'black')) {
                        moves.push([row + j * i, col]);
                    }
                    break;
                }
            }
        }
        for (let j = 1; j < 8; j++) {
            if (col + j * i >= 0 && col + j * i < 8) {
                if (initialBoard[row][col + j * i] === '') {
                    moves.push([row, col + j * i]);
                } else {
                    if (!isPieceColor(initialBoard[row][col + j * i], isPieceColor(initialBoard[row][col], 'white') ? 'white' : 'black')) {
                        moves.push([row, col + j * i]);
                    }
                    break;
                }
            }
        }
    }
    return moves;
}

function getKnightMoves(row, col) {
    const moves = [];
    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];

    knightMoves.forEach(move => {
        const newRow = row + move[0];
        const newCol = col + move[1];
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = initialBoard[newRow][newCol];
            if (!targetPiece || !isPieceColor(targetPiece, isPieceColor(initialBoard[row][col], 'white') ? 'white' : 'black')) {
                moves.push([newRow, newCol]);
            }
        }
    });

    return moves;
}

function getBishopMoves(row, col) {
    const moves = [];
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = 1; k < 8; k++) {
                const newRow = row + k * i;
                const newCol = col + k * j;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (initialBoard[newRow][newCol] === '') {
                        moves.push([newRow, newCol]);
                    } else {
                        if (!isPieceColor(initialBoard[newRow][newCol], isPieceColor(initialBoard[row][col], 'white') ? 'white' : 'black')) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                }
            }
        }
    }
    return moves;
}

function getQueenMoves(row, col) {
    return getRookMoves(row, col).concat(getBishopMoves(row, col));
}

function getKingMoves(row, col) {
    const moves = [];
    const kingMoves = [
        [1, 0], [1, 1], [1, -1],
        [-1, 0], [-1, 1], [-1, -1],
        [0, 1], [0, -1]
    ];

    kingMoves.forEach(move => {
        const newRow = row + move[0];
        const newCol = col + move[1];
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = initialBoard[newRow][newCol];
            if (!targetPiece || !isPieceColor(targetPiece, isPieceColor(initialBoard[row][col], 'white') ? 'white' : 'black')) {
                moves.push([newRow, newCol]);
            }
        }
    });

    return moves;
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const possibleMoves = getPossibleMovesForPiece(piece, fromRow, fromCol);
    return possibleMoves.some(move => move[0] === toRow && move[1] === toCol);
}


// ... (código anterior permanece o mesmo)

function movePiece(square, row, col) {
    const piece = square.dataset.piece;
    const targetPiece = initialBoard[row][col];

    if (isValidMove(piece, parseInt(square.dataset.row), parseInt(square.dataset.col), row, col)) {
        const fromRow = parseInt(square.dataset.row);
        const fromCol = parseInt(square.dataset.col);

        // Move a peça
        initialBoard[fromRow][fromCol] = '';
        initialBoard[row][col] = piece;

        // Verificar xeque e xeque-mate
        if (isInCheck(isWhiteTurn ? 'white' : 'black')) {
            alert(`${isWhiteTurn ? 'Brancas' : 'Pretas'} estão em xeque!`);
            if (isCheckmate(isWhiteTurn ? 'white' : 'black')) {
                alert(`Xeque-mate! ${isWhiteTurn ? 'Pretas' : 'Brancas'} ganham!`);
            }
        }

        deselectPiece();
        isWhiteTurn = !isWhiteTurn;
        createBoard();
        if (!isWhiteTurn) {
            setTimeout(botMove, 500);
        }
    }
}

function isInCheck(color) {
    const kingPosition = findKing(color);
    const opponentColor = color === 'white' ? 'black' : 'white';
    const opponentMoves = getAllPossibleMoves(opponentColor);

    return opponentMoves.some(move => move.toRow === kingPosition[0] && move.toCol === kingPosition[1]);
}

function isCheckmate(color) {
    if (!isInCheck(color)) return false;

    const allMoves = getAllPossibleMoves(color);
    for (const move of allMoves) {
        const fromRow = move.fromRow;
        const fromCol = move.fromCol;
        const toRow = move.toRow;
        const toCol = move.toCol;

        // Tentar o movimento
        const piece = initialBoard[fromRow][fromCol];
        const targetPiece = initialBoard[toRow][toCol];

        initialBoard[fromRow][fromCol] = '';
        initialBoard[toRow][toCol] = piece;

        const isStillInCheck = isInCheck(color);

        // Reverter o movimento
        initialBoard[fromRow][fromCol] = piece;
        initialBoard[toRow][toCol] = targetPiece;

        if (!isStillInCheck) return false;
    }
    return true;
}

function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoard[row][col];
            if (piece && isPieceColor(piece, color) && piece.toLowerCase() === 'k') {
                return [row, col];
            }
        }
    }
}
function botMove() {
    const bestMove = getBestMove('black');
    if (bestMove) {
        movePiece(document.querySelector(`[data-row="${bestMove.fromRow}"][data-col="${bestMove.fromCol}"]`), bestMove.toRow, bestMove.toCol);
    }
}

function getBestMove(color) {
    const moves = getAllPossibleMoves(color);
    let bestMove = null;
    let bestValue = -Infinity;

    moves.forEach(move => {
        const fromRow = move.fromRow;
        const fromCol = move.fromCol;
        const toRow = move.toRow;
        const toCol = move.toCol;

        // Realizar o movimento
        const piece = initialBoard[fromRow][fromCol];
        const targetPiece = initialBoard[toRow][toCol];

        initialBoard[fromRow][fromCol] = '';
        initialBoard[toRow][toCol] = piece;

        const boardValue = minimax(initialBoard, 3, false); // Profundidade de 3

        // Reverter o movimento
        initialBoard[fromRow][fromCol] = piece;
        initialBoard[toRow][toCol] = targetPiece;

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    });

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const color = isMaximizing ? 'black' : 'white';
    if (depth === 0 || isCheckmate(color) || isCheckmate(color === 'black' ? 'white' : 'black')) {
        return evaluateBoard(board);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        const moves = getAllPossibleMoves('black');

        for (const move of moves) {
            const fromRow = move.fromRow;
            const fromCol = move.fromCol;
            const toRow = move.toRow;
            const toCol = move.toCol;

            // Realizar o movimento
            const piece = initialBoard[fromRow][fromCol];
            const targetPiece = initialBoard[toRow][toCol];

            initialBoard[fromRow][fromCol] = '';
            initialBoard[toRow][toCol] = piece;

            const eval = minimax(board, depth - 1, false);

            // Reverter o movimento
            initialBoard[fromRow][fromCol] = piece;
            initialBoard[toRow][toCol] = targetPiece;

            maxEval = Math.max(maxEval, eval);
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        const moves = getAllPossibleMoves('white');

        for (const move of moves) {
            const fromRow = move.fromRow;
            const fromCol = move.fromCol;
            const toRow = move.toRow;
            const toCol = move.toCol;

            // Realizar o movimento
            const piece = initialBoard[fromRow][fromCol];
            const targetPiece = initialBoard[toRow][toCol];

            initialBoard[fromRow][fromCol] = '';
            initialBoard[toRow][toCol] = piece;

            const eval = minimax(board, depth - 1, true);

            // Reverter o movimento
            initialBoard[fromRow][fromCol] = piece;
            initialBoard[toRow][toCol] = targetPiece;

            minEval = Math.min(minEval, eval);
        }
        return minEval;
    }
}

function evaluateBoard(board) {
    let value = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                value += getPieceValue(piece);
            }
        }
    }
    return value;
}

function getPieceValue(piece) {
    switch (piece.toLowerCase()) {
        case 'p':
            return piece === piece.toLowerCase() ? 10 : -10;
        case 'r':
            return piece === piece.toLowerCase() ? 50 : -50;
        case 'n':
            return piece === piece.toLowerCase() ? 30 : -30;
        case 'b':
            return piece === piece.toLowerCase() ? 30 : -30;
        case 'q':
            return piece === piece.toLowerCase() ? 90 : -90;
        case 'k':
            return piece === piece.toLowerCase() ? 900 : -900;
        default:
            return 0;
    }
}

// Resto do código permanece o mesmo...
createBoard();

