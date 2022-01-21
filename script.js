// Boolean: keeps track of whose turn
let oddTurn = true;

// Player Factory Function
const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;
    const markBoard = (position) => {
        return gameBoard.addMark(getSymbol(), position);
    };

    return {
        getName,
        markBoard
    }
};



// Game Board Module
const gameBoard = ( () => {

    // create array for each position in tic tac toe board
    const arr = new Array(9);

    const getArray = () => {
        return arr;
    };

    // mark the board
    const addMark = (symbol, position) => { 
        if (arr[position]) {
            return false;
        } else {
            arr[position] = symbol;
            return true;
        }
    };

    const checkWin = () => {

        // check rows for win condition
        for (let row = 0; row < 3; row++) {
            let rowSet = new Set(arr.slice(row * 3, (row + 1) * 3));
            if (rowSet.size == 1 && !rowSet.has(undefined)) {
                console.log(rowSet);
                return arr[row * 3];
            }
        }

        // check columns for win condition
        for (let col = 0; col < 3; col++) {
            let colSet = new Set([arr[col], arr[col + 3], arr[col + 6]]);

            if (colSet.size == 1 && !colSet.has(undefined)) {
                console.log(colSet);
                return arr[col];
            }
        }

        // check diagonals for win condition

        let bslashSet = new Set([arr[0], arr[4], arr[8]]);
        if (bslashSet.size == 1 && !bslashSet.has(undefined)) {
            return arr[0];
        } 

        let fslashSet = new Set([arr[2], arr[4], arr[6]]);
        if (fslashSet.size == 1 && !fslashSet.has(undefined)) {
            return arr[2];
        }

        return false;

    }

    const isGameOver = () => {
        if (checkWin()) {
            console.log(`${checkWin()} wins`);
            return true;
        }

        for (let i = 0; i < arr.length; i++) {
            if ('undefined' == typeof arr[i]) {return false}
        }

        console.log("Game Tied");
        return true;
    }

    return {
        getArray,
        addMark,
        isGameOver
    }
})();

// Display Controller Module
const displayController = ( () => {

    const displayBoard = () => {
        let boardContainer = document.getElementById('board');
        let boardTable = document.createElement('table');

        while (boardContainer.firstChild) {
            boardContainer.removeChild(boardContainer.lastChild);
        }

        for (let i = 0; i < 3; i++) {
            let row = document.createElement('tr');

            for (let j = 0; j < 3; j++) {
                let cell = document.createElement('td');
                let position = 3 * i + j;
                cell.setAttribute('position', position);
                cell.classList.add('cell');
                cell.addEventListener('click', (e) => {
                    let cell = e.target;
                    let mark = getCurrentPlayer().markBoard(cell.getAttribute('position'));
                    if (mark) {
                        oddTurn = !oddTurn;
                        displayBoard();
                        gameBoard.isGameOver();
                    }
                });

                if (gameBoard.getArray()[position]) {
                    cell.appendChild(document.createTextNode(gameBoard.getArray()[position]));
                };

                row.appendChild(cell);
            }

            boardTable.appendChild(row);
        }

        boardContainer.appendChild(boardTable);

    };

    return {
        displayBoard,
        oddTurn
    }
})();

const players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};
displayController.displayBoard();