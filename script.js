let gameOver = new Audio("game-over.mp3");
let gameWin = new Audio("win.mp3");
let load_first = new Audio("load_first.mp3");

// Main function starting
let arr = Array.from({ length: 9 }, () => Array(9).fill(0));
let puzzleLoaded = false;

function loadPuzzle() {
    // Reset the board
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            arr[i][j] = 0;
            let cellId = `a${i}${j}`;
            let cell = document.getElementById(cellId);
            cell.innerHTML = "";
            cell.style.backgroundColor = "rgb(94, 96, 109)";
        }
    }

    // Generate random values for up to 20 cells to make it simpler
    let a = 20;
    while (a--) {
        let x = Math.floor(Math.random() * 9);
        let y = Math.floor(Math.random() * 9);
        let el = Math.floor(Math.random() * 9) + 1;

        if (canBeInserted2(x, y, el, arr)) {
            let cellId = `a${x}${y}`;
            let cell = document.getElementById(cellId);
            cell.innerHTML = el.toString();
            arr[x][y] = el;
            cell.style.backgroundColor = "rgb(5, 5, 5)";
        }
    }

    document.getElementById("msg").innerHTML = "Puzzle Loaded. Ready to Solve!";
    document.getElementById("msg").style.color = "yellow";
    puzzleLoaded = true;
}

function solvePuzzle() {
    if (!puzzleLoaded) {
        load_first.play();
        document.getElementById("msg").innerHTML = "Please load the puzzle before trying to solve!";
        document.getElementById("msg").style.color = "red";
        return;
    }

    let copy = arr.map((row) => row.slice());

    if (solve1(copy)) {
        document.getElementById("msg").innerHTML = "Your puzzle is solving...";
        document.getElementById("msg").style.color = "orange";
        solve2(arr);
    } else {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (copy[i][j] == 0) {
                    let cellId = `a${i}${j}`;
                    document.getElementById(cellId).style.backgroundColor = "red";
                }
            }
        }
        gameOver.play();
        document.getElementById("msg").innerHTML = "This puzzle can't be solved. Please refresh the board...";
        document.getElementById("msg").style.color = "red";
    }
}

function solve1(copy) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (copy[i][j] == 0) {
                for (let b = 1; b < 10; b++) {
                    if (canBeInserted1(i, j, b, copy)) {
                        copy[i][j] = b;
                        if (solve1(copy)) {
                            return true;
                        } else {
                            copy[i][j] = 0;
                        }
                    }
                }
                return false;
            }
        }
    }
    return true;
}

let step = 0;

function solve2(arr) {
    let solveHelper = (i, j) => {
        if (i === 9) {
            gameWin.play();
            document.getElementById("msg").innerHTML = "Your puzzle is solved... (-_-)";
            document.getElementById("msg").style.color = "rgb(0, 255, 38)";
            let op = `Solved in ${step} operations.`;
            document.getElementById("steps").innerHTML = op;
            document.getElementById("steps").style.color = "orange";
            return;
        }

        if (arr[i][j] !== 0) {
            solveHelper(i + (j + 1) / 9, (j + 1) % 9);
            return;
        }

        for (let b = 1; b < 10; b++) {
            if (canBeInserted2(i, j, b, arr)) {
                step++;
                let cellId = `a${i}${j}`;
                let strb = b.toString();
                setTimeout(() => {
                    document.getElementById(cellId).innerHTML = strb;
                    document.getElementById(cellId).style.backgroundColor = "green";
                }, 0);
                arr[i][j] = b;
                solveHelper(i + (j + 1) / 9, (j + 1) % 9);
                setTimeout(() => {
                    document.getElementById(cellId).innerHTML = "";
                    document.getElementById(cellId).style.backgroundColor = "rgb(94, 96, 109)";
                }, 0);
                arr[i][j] = 0;
            }
        }
    };

    solveHelper(0, 0);
}

function canBeInserted1(row, col, item, copy) {
    for (let k = 0; k < 9; k++) {
        if (copy[row][k] == item || copy[k][col] == item) {
            return false;
        }
        let cubeCheckX = Math.floor(3 * Math.floor(row / 3) + Math.floor(k / 3));
        let cubeCheckY = Math.floor(3 * Math.floor(col / 3) + Math.floor(k % 3));
        if (copy[cubeCheckX][cubeCheckY] == item) {
            return false;
        }
    }
    return true;
}

function canBeInserted2(row, col, item, arr) {
    for (let k = 0; k < 9; k++) {
        if (arr[row][k] == item || arr[k][col] == item) {
            return false;
        }
        let cubeCheckX = Math.floor(3 * Math.floor(row / 3) + Math.floor(k / 3));
        let cubeCheckY = Math.floor(3 * Math.floor(col / 3) + Math.floor(k % 3));
        if (arr[cubeCheckX][cubeCheckY] == item) {
            return false;
        }
    }
    return true;
}
