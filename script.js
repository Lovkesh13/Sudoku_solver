let gameOver = new Audio("game-over.mp3");
let gameWin = new Audio("win.mp3");
let load_first = new Audio("load_first.mp3");

let arr = Array.from({ length: 9 }, () => Array(9).fill(0));
let puzzleLoaded = false;

function loadPuzzle() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            arr[i][j] = 0;
            let cellId = `a${i}${j}`;
            let cell = document.getElementById(cellId);
            cell.innerHTML = "";
            cell.style.backgroundColor = "rgb(94, 96, 109)";
        }
    }

    let a = 45;
    while (a>0) {
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
        document.getElementById("msg").innerHTML = "This puzzle can't be solved. Please clear...";
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
    function stepSolve2(i, j) {
        if (i == 9) {
            gameWin.play();
            document.getElementById("msg").innerHTML = "Your puzzle is solved...(-_-)";
            document.getElementById("msg").style.color = "rgb(0, 255, 38)";
            let op = `Solved in ${step} operations.`;
            document.getElementById("steps").innerHTML = op;
            document.getElementById("steps").style.color = "orange";
            return true;
        }

        if (arr[i][j] != 0) {
            if (j == 8) {
                return stepSolve2(i + 1, 0);
            } else {
                return stepSolve2(i, j + 1);
            }
        }

        for (let b = 1; b < 10; b++) {
            if (canBeInserted2(i, j, b, arr)) {
                step++;
                let cellId = `a${i}${j}`;
                let strb = b.toString();
                arr[i][j] = b;
                document.getElementById(cellId).innerHTML = strb;
                document.getElementById(cellId).style.backgroundColor = "green";

                if (stepSolve2(i, j == 8 ? 0 : j + 1)) {
                    return true;
                }

                arr[i][j] = 0;
                document.getElementById(cellId).innerHTML = "";
                document.getElementById(cellId).style.backgroundColor = "rgb(94, 96, 109)";
            }
        }
        return false;
    }

    stepSolve2(0, 0);
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
