let board = Array(9).fill().map(() => Array(9).fill(0));
let originalBoard = Array(9).fill().map(() => Array(9).fill(0));
let solution = Array(9).fill().map(() => Array(9).fill(0));
let selectedCell = null;
let mistakes = 0;
let timer = 0;
let timerInterval;

function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-item';
            cell.id = `cell-${i}-${j}`;
            cell.onclick = () => selectCell(i, j);
            grid.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    if (originalBoard[row][col] !== 0) return;
    
    if (selectedCell) {
        document.getElementById(`cell-${selectedCell.row}-${selectedCell.col}`).classList.remove('selected');
    }
    
    selectedCell = { row, col };
    document.getElementById(`cell-${row}-${col}`).classList.add('selected');
}

function setNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    
    if (isValid(row, col, num)) {
        board[row][col] = num;
        updateCell(row, col);
        if (isBoardComplete()) {
            endGame();
        }
    } else {
        mistakes++;
        document.getElementById('mistakes').textContent = mistakes;
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.classList.add('error');
        setTimeout(() => cell.classList.remove('error'), 1000);
    }
}

function isValid(row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === num) return false;
    }
    
    for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][col] === num) return false;
    }
    
    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (boxRow + i !== row && boxCol + j !== col && 
                board[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

function generatePuzzle() {
    generateSolution(0, 0);
    solution = board.map(row => [...row]);
    
    let cellsToRemove = 40;
    while (cellsToRemove > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            cellsToRemove--;
        }
    }
    
    originalBoard = board.map(row => [...row]);
}

function generateSolution(row, col) {
    if (col === 9) {
        row++;
        col = 0;
    }
    if (row === 9) return true;
    
    if (board[row][col] !== 0) return generateSolution(row, col + 1);
    
    let nums = [1,2,3,4,5,6,7,8,9];
    nums.sort(() => Math.random() - 0.5);
    
    for (let num of nums) {
        if (isValid(row, col, num)) {
            board[row][col] = num;
            if (generateSolution(row, col + 1)) return true;
            board[row][col] = 0;
        }
    }
    
    return false;
}

function updateBoard() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            updateCell(i, j);
        }
    }
}

function updateCell(row, col) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    cell.textContent = board[row][col] || '';
    cell.className = 'grid-item';
    if (originalBoard[row][col] !== 0) {
        cell.classList.add('original');
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function newGame() {
    board = Array(9).fill().map(() => Array(9).fill(0));
    mistakes = 0;
    document.getElementById('mistakes').textContent = '0';
    document.getElementById('message').textContent = '';
    selectedCell = null;
    generatePuzzle();
    updateBoard();
    startTimer();
}

function showSolution() {
    clearInterval(timerInterval);
    board = solution.map(row => [...row]);
    updateBoard();
    document.getElementById('message').textContent = 'Solution shown';
}

function clearBoard() {
    if (selectedCell) {
        const { row, col } = selectedCell;
        if (originalBoard[row][col] === 0) {
            board[row][col] = 0;
            updateCell(row, col);
        }
    }
}

function isBoardComplete() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return false;
        }
    }
    return true;
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById('message').textContent = 'Congratulations! Puzzle completed!';
}

createGrid();
newGame();

document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        setNumber(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        clearBoard();
    }
});