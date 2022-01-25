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

    // allow other modules and functions to get array
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

    // check win conditions
    const checkWin = () => {

        // check rows for win condition
        for (let row = 0; row < 3; row++) {
            let rowSet = new Set(arr.slice(row * 3, (row + 1) * 3));
            if (rowSet.size == 1 && !rowSet.has(undefined)) {
                return arr[row * 3];
            }
        }

        // check columns for win condition
        for (let col = 0; col < 3; col++) {
            let colSet = new Set([arr[col], arr[col + 3], arr[col + 6]]);

            if (colSet.size == 1 && !colSet.has(undefined)) {
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

    };

    // checks if game ends
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
    };

    // check if cell is empty
    const isCellEmpty = (position) => {return (arr[position] ? false : true)};
    
    return {
        getArray,
        addMark,
        isGameOver,
        isCellEmpty
    }
})();

// Cell Factory Function
const Cell = (position) => {
    const getPosition = () => position;
    const getSymbol = () => gameBoard.getArray()[position];
    const addEvent = (container) => {
        container.addEventListener('click', () => {
            if (gameBoard.isCellEmpty(position)) {
                getCurrentPlayer().markBoard(position);
                oddTurn = !oddTurn;
                displayController.displayCell(position);
                gameBoard.isGameOver();
            }
        });
    }

    return {
        getPosition,
        getSymbol,
        addEvent
    }
};

// Display Controller Module
const displayController = ( () => {

    const displayCell = (position) => {
        let box = document.getElementById(`box-${position}`);
        box.appendChild(document.createTextNode(gameBoard.getArray()[position]));
    }

    const setBoard = () => {
        for (let i = 0; i < 9; i++) {
            let box = document.getElementById(`box-${i}`);
            let cell = Cell(i);
            cell.addEvent(box);
        }
    };

    return {
        displayCell,
        setBoard,
        oddTurn
    }
})();

const players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};
displayController.setBoard();