// Boolean: keeps track of whose turn
let oddTurn = true;
let botMode = false;

// DOM Elements
const title = document.getElementById('title');
const main = document.querySelector('main');
const startScreenSection = document.getElementById('start-screen');
const restartButton = document.getElementById('restart-btn');
const modalContent = document.querySelector('.modal-content');
const bgModal = document.querySelector('.bg-modal');
const modalClose = document.querySelector('.close');

// Factory functions
//
// Player Factory Function
const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;
    const markBoard = (position) => {
        console.log(gameBoard.getArray()); 
        return gameBoard.addMark(getSymbol(), position);
    };

    return {
        getName,
        getSymbol,
        markBoard
    }
};

// Player array
const players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));

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
                if (botMode) {
                    if(gameBoard.isGameOver()) {return}; 
                    let randomEmptyCell = gameBoard.nextEmptyCell();
                    console.log(randomEmptyCell);
                    bot.takeTurn(randomEmptyCell);
                    oddTurn = !oddTurn;
                    displayController.displayCell(randomEmptyCell);
                    gameBoard.isGameOver();
                }
            }
        });
    }

    return {
        getPosition,
        getSymbol,
        addEvent
    }
};

// Modules
//
// Game Board Module
const gameBoard = (function() {

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

    const nextEmptyCell = () => {
        do {
            random = Math.floor(Math.random() * 9);
        }
        while(!gameBoard.isCellEmpty(random));
        return random;
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
        nextEmptyCell,
        addMark,
        isGameOver,
        isCellEmpty
    }
})();

// Display Controller Module
const displayController = (function() {

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

// Event Listeners
//
// Restart button event
restartButton.addEventListener('click', () => {displayController.clearDisplay()});

// Player 1 name input button event
document.getElementById("player1-btn").addEventListener('click', () => {
    let inputElementP1 = document.querySelector('#player1-input');
    (inputElementP1.value ? inputElementP1.placeholder = inputElementP1.value : inputElementP1.value = "Player1");
    players[0] = Player(inputElementP1.value, 'X');
});

// Player 2 name input button event
document.getElementById("player2-btn").addEventListener('click', () => {
    let inputElementP2 = document.querySelector('#player2-input');
    (inputElementP2.value ? inputElementP2.placeholder = inputElementP2.value : inputElementP2.value = "Player2");
    players[1] = Player(inputElementP2.value, 'O');
});

// Modal event listeners
// Modal close event
modalClose.addEventListener('click', () => {document.querySelector('.bg-modal').style.display = 'none'});
modalClose.addEventListener('click', () => {displayController.clearDisplay()});

// Modal background event
bgModal.addEventListener('click', () => {
    document.querySelector('.bg-modal').style.display = 'none';
    displayController.clearDisplay();
});

// Modal content event
modalContent.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
});

// Start screen event listener
window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    };
    
    const code = event.code;
    const currSelection = document.querySelector('.selected');

    switch (code) {
        case 'ArrowDown':
            if (currSelection.textContent.includes('1')) {
                currSelection.classList.remove('selected');
                document.getElementById('2p').classList.add('selected');
            }
            break;
        case 'ArrowUp':
            if (currSelection.textContent.includes('2')) {
                currSelection.classList.remove('selected');
                document.getElementById('1p').classList.add('selected');
            }
            break;
        case 'Space':
            if (currSelection.textContent.includes('1')) {botMode = true};
            startGame();
            break;
        default:
            console.log(code);
            return;
    }
    
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);
    // the last option dispatches the event to the listener first,
    // then dispatches event to window

// Functions
//
// Start game function
function startGame() {
    title.style.position = 'absolute';
    title.style.animation = 'title 2s';
    title.style.top = '5%';
    startScreenSection.style.display = 'none';
    main.style.display = 'flex';
}

// Get current player function
const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};

// Starting display
displayController.displayBoard();

const playerBot = () => {
    const player = Player('bot', 'O');
    const takeTurn = (position) => {
        player.markBoard(position);
    }
    return {
        ...player,
        takeTurn
    }
}

var bot = playerBot();

