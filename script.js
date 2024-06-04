// Function to create the Sudoku board
function createBoard() {
    const board = document.getElementById('sudoku-board');
    for (let i = 0; i < 9; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

// Functions for Sudoku solving
function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] == num || board[x][col] == num || board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] == num) {
            return false;
        }
    }
    return true;
}

function solveSudokuUtil(board) {
    let l = [0, 0];
    if (!findUnassignedLocation(board, l)) {
        return true;
    }
    let row = l[0];
    let col = l[1];
    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudokuUtil(board)) {
                return true;
            }
            board[row][col] = 0;
        }
    }
    return false;
}

function findUnassignedLocation(board, l) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] == 0) {
                l[0] = row;
                l[1] = col;
                return true;
            }
        }
    }
    return false;
}

// Function to solve the Sudoku puzzle
function solveSudoku() {
    const board = [];
    const inputs = document.querySelectorAll('input');
    for (let i = 0; i < 9; i++) {
        board[i] = [];
        for (let j = 0; j < 9; j++) {
            const value = inputs[i * 9 + j].value;
            board[i][j] = value ? parseInt(value) : 0;
        }
    }

    if (solveSudokuUtil(board)) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const input = inputs[i * 9 + j];
                if (input.value === '') {
                    input.value = board[i][j];
                    input.parentElement.classList.add('solved-cell');
                }
            }
        }
    } else {
        alert('No solution exists');
    }
}

// Function to clear the Sudoku board
function clearBoard() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.parentElement.classList.remove('generated-cell', 'solved-cell');
    });
}

// Function to generate a random Sudoku puzzle
function generatePuzzle() {
    clearBoard();
    const puzzle = generateSudoku();
    const inputs = document.querySelectorAll('input');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (puzzle[i][j] !== 0) {
                const input = inputs[i * 9 + j];
                input.value = puzzle[i][j];
                input.parentElement.classList.add('generated-cell');
            }
        }
    }
}

// Sudoku puzzle generator using a simple backtracking algorithm
function generateSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillDiagonalBoxes(board);
    solveSudokuUtil(board);
    removeRandomDigits(board);
    return board;
}

function fillDiagonalBoxes(board) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
}

function fillBox(board, row, col) {
    const numSet = new Set();
    while (numSet.size < 9) {
        const num = Math.floor(Math.random() * 9) + 1;
        numSet.add(num);
    }
    const numArray = Array.from(numSet);
    let k = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = numArray[k++];
        }
    }
}

function removeRandomDigits(board) {
    let count = 40; // Number of cells to remove
    while (count !== 0) {
        const cellId = Math.floor(Math.random() * 81);
        const i = Math.floor(cellId / 9);
        const j = cellId % 9;
        if (board[i][j] !== 0) {
            board[i][j] = 0;
            count--;
        }
    }
}

// Initialize the board on page load
window.onload = createBoard;