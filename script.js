const SIZE = 9;

let board;            // current player board
let givens;           // boolean matrix: true if cell is pre-filled
let solution;         // solved board (for "Show Solution")
let selected = { r: 0, c: 0 };

let mistakes = 0;
let seconds = 0;
let timerId = null;

// ---------- Bootstrapping ----------
createGrid();
newGame();
attachKeyboardHandlers();

// ---------- Grid / Rendering ----------
function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-item';
      cell.id = `cell-${r}-${c}`;
      cell.onclick = () => selectCell(r, c);
      grid.appendChild(cell);
    }
  }
}

function renderCell(r, c) {
  const el = document.getElementById(`cell-${r}-${c}`);
  el.textContent = board[r][c] === 0 ? '' : String(board[r][c]);

  // preserve highlight: rebuild classes intentionally
  el.classList.remove('original', 'selected', 'error');
  if (givens[r][c]) el.classList.add('original');
  if (selected.r === r && selected.c === c) el.classList.add('selected');
}

function renderBoard() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      renderCell(r, c);
    }
  }
}

function selectCell(r, c) {
  // remove previous selection highlight
  const prev = document.getElementById(`cell-${selected.r}-${selected.c}`);
  if (prev) prev.classList.remove('selected');

  selected = { r, c };

  // highlight new selection
  const el = document.getElementById(`cell-${r}-${c}`);
  if (el) el.classList.add('selected');
}

// ---------- Game Flow ----------
function newGame() {
  // reset UI
  mistakes = 0;
  seconds = 0;
  updateMistakes();
  updateMessage('');
  resetTimer();

  // fresh empty board
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  solution = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  givens  = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

  // create a solved board, copy as solution, then punch holes
  const full = generateSolvedBoard();
  copyInto(solution, full);

  const puzzle = removeCells(full, 40); // remove ~40 cells
  copyInto(board, puzzle);

  // set givens
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      givens[r][c] = board[r][c] !== 0;
    }
  }

  // choose a sensible starting selection (first editable cell)
  const first = findFirstEditable();
  selected = first || { r: 0, c: 0 };

  renderBoard();
  // ensure selection highlight exists
  selectCell(selected.r, selected.c);

  startTimer();
}

function showSolution() {
  stopTimer();
  copyInto(board, solution);
  renderBoard();
  updateMessage('✅ Solution shown');
}

function clearBoard() {
  // clear the currently selected cell only (keeps givens locked)
  const { r, c } = selected;
  if (givens[r][c]) return;
  board[r][c] = 0;
  renderCell(r, c);
  updateMessage('');
}

// ---------- Input / Validation ----------
function setNumber(n) {
  const { r, c } = selected;
  if (givens[r][c]) return; // cannot edit pre-filled cells

  if (n < 1 || n > 9) return; // ignore invalid

  if (isValid(board, r, c, n)) {
    board[r][c] = n;
    renderCell(r, c);
    updateMessage('');

    if (isBoardComplete(board)) {
      stopTimer();
      updateMessage('🎉 Congratulations! Puzzle completed!');
    }
  } else {
    // flash error without placing number
    mistakes++;
    updateMistakes();
    const el = document.getElementById(`cell-${r}-${c}`);
    el.classList.add('error');
    setTimeout(() => el.classList.remove('error'), 180);
  }
}

function attachKeyboardHandlers() {
  document.addEventListener('keydown', (e) => {
    const key = e.key;

    // movement
    if (key === 'ArrowUp')    { moveSelection(-1,  0); return; }
    if (key === 'ArrowDown')  { moveSelection( 1,  0); return; }
    if (key === 'ArrowLeft')  { moveSelection( 0, -1); return; }
    if (key === 'ArrowRight') { moveSelection( 0,  1); return; }

    // digits (top row & numpad)
    if (/^[1-9]$/.test(key)) {
      setNumber(parseInt(key, 10));
      return;
    }

    // clear with 0, Backspace, or Delete
    if (key === '0' || key === 'Backspace' || key === 'Delete') {
      clearBoard();
      return;
    }
  });
}

function moveSelection(dr, dc) {
  const r = (selected.r + dr + SIZE) % SIZE;
  const c = (selected.c + dc + SIZE) % SIZE;
  selectCell(r, c);
}

function isValid(grid, r, c, val) {
  // row
  for (let j = 0; j < SIZE; j++) {
    if (j !== c && grid[r][j] === val) return false;
  }
  // col
  for (let i = 0; i < SIZE; i++) {
    if (i !== r && grid[i][c] === val) return false;
  }
  // box
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if ((i !== r || j !== c) && grid[i][j] === val) return false;
    }
  }
  return true;
}

function isBoardComplete(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  // Optional: final validity check
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (!isValid(grid, r, c, val)) return false;
    }
  }
  return true;
}

// ---------- Generator / Solver ----------
function generateSolvedBoard() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  solveBacktrack(grid);
  return grid;
}

function solveBacktrack(grid) {
  const pos = findEmpty(grid);
  if (!pos) return true;
  const [r, c] = pos;

  const nums = [1,2,3,4,5,6,7,8,9];
  shuffle(nums);
  for (const n of nums) {
    if (isValid(grid, r, c, n)) {
      grid[r][c] = n;
      if (solveBacktrack(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

function findEmpty(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function removeCells(fullGrid, toRemove = 40) {
  // copy full solution
  const puzzle = fullGrid.map(row => row.slice());

  // knock out random cells — simple approach (not uniqueness-checked)
  let removed = 0;
  while (removed < toRemove) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return puzzle;
}

// ---------- Utilities ----------
function copyInto(dst, src) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      dst[r][c] = src[r][c];
    }
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function findFirstEditable() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!givens[r][c]) return { r, c };
    }
  }
  return null;
}

// ---------- Timer / UI helpers ----------
function startTimer() {
  stopTimer();
  seconds = 0;
  timerId = setInterval(() => {
    seconds++;
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${mm}:${ss}`;
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  document.getElementById('timer').textContent = '00:00';
}

function updateMistakes() {
  document.getElementById('mistakes').textContent = String(mistakes);
}

function updateMessage(text) {
  document.getElementById('message').textContent = text || '';
}

// ---------- Expose required globals for HTML buttons ----------
window.setNumber = setNumber;
window.newGame = newGame;
window.showSolution = showSolution;
window.clearBoard = clearBoard;
