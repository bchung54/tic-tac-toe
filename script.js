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
        getSymbol,
        markBoard
    }
};



// Game Board Module
const gameBoard = ( () => {

    // create array for each position in tic tac toe board
    let arr = new Array(9);

    // allow other modules and functions to get array
    const getArray = () => {
        return arr;
    };

    // empty the game array
    const clearBoard = () => {
        arr = new Array(9);
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
                return (arr[row * 3] == players[0].getSymbol() ? players[0] : players[1]);
            }
        }

        // check columns for win condition
        for (let col = 0; col < 3; col++) {
            let colSet = new Set([arr[col], arr[col + 3], arr[col + 6]]);

            if (colSet.size == 1 && !colSet.has(undefined)) {
                return (arr[col] == players[0].getSymbol() ? players[0] : players[1]);
            }
        }

        // check diagonals for win condition

        let bslashSet = new Set([arr[0], arr[4], arr[8]]);
        if (bslashSet.size == 1 && !bslashSet.has(undefined)) {
            return (arr[0] == players[0].getSymbol() ? players[0] : players[1]);
        } 

        let fslashSet = new Set([arr[2], arr[4], arr[6]]);
        if (fslashSet.size == 1 && !fslashSet.has(undefined)) {
            return (arr[2] == players[0].getSymbol() ? players[0] : players[1]); 
        }

        return false;

    };

    // checks if game ends
    const isGameOver = () => {
        const msgContainer = document.querySelector('.endgame-msg');
        if (msgContainer.firstChild) {msgContainer.removeChild(msgContainer.firstChild)};

        if (checkWin()) {
            let msg = document.createTextNode(`${checkWin().getName()} Wins!`);
            msgContainer.appendChild(msg);
            document.querySelector('.bg-modal').style.display = 'flex';
            return true;
        }

        for (let i = 0; i < arr.length; i++) {
            if ('undefined' == typeof arr[i]) {return false}
        }

        let msg = document.createTextNode("It's a Tie!");
        msgContainer.appendChild(msg);
        document.querySelector('.bg-modal').style.display = 'flex';
        return true;
    };

    // check if cell is empty
    const isCellEmpty = (position) => {return (arr[position] ? false : true)};

    return {
        getArray,
        clearBoard,
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
    };

    const displayBoard = () => {
        for (let i = 0; i < 9; i++) {
            let box = document.getElementById(`box-${i}`);
            if (box.firstChild) {box.removeChild(box.firstChild)};
            let cell = Cell(i);
            cell.addEvent(box);
        }
    };

    const clearDisplay = () => {
        oddTurn = true;
        gameBoard.clearBoard();
        displayBoard();
    };

    return {
        displayCell,
        displayBoard,
        clearDisplay
    }
})();


document.getElementById("restart-btn").addEventListener('click', () => {
    displayController.clearDisplay();
});

document.getElementById("player1-btn").addEventListener('click', () => {
    let inputElementP1 = document.querySelector('#player1-input');
    (inputElementP1.value ? inputElementP1.placeholder = inputElementP1.value : inputElementP1.value = "Player1");
    players[0] = Player(inputElementP1.value, 'X');
});

document.getElementById("player2-btn").addEventListener('click', () => {
    let inputElementP2 = document.querySelector('#player2-input');
    (inputElementP2.value ? inputElementP2.placeholder = inputElementP2.value : inputElementP2.value = "Player2");
    players[1] = Player(inputElementP2.value, 'O');
});

document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.bg-modal').style.display = 'none';
});

document.querySelector('.close').addEventListener('click', () => {
    displayController.clearDisplay();
});

document.querySelector('.bg-modal').addEventListener('click', () => {
    document.querySelector('.bg-modal').style.display = 'none';
    displayController.clearDisplay();
});

document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
});

const players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};
displayController.displayBoard();