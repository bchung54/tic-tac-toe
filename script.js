// DOM Elements
const title = document.getElementById('title');
const main = document.querySelector('main');
const startScreenText = document.querySelector('.start-text');
const restartButton = document.getElementById('restart-btn');
const modalContent = document.querySelector('.modal-content');
const bgModal = document.querySelector('.bg-modal');
const modalClose = document.querySelector('.close');

// Factory functions
//
// Player Factory Function
const Player = (name, symbol, bot) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    return {
        getName,
        getSymbol,
    }
};

// Modules
//
// Game Board Module
const gameBoard = (function() {

    // Boolean: keeps track turns
    let oddTurn = true;
    // Boolean: keeps track of bot mode
    let botMode = true;
    // Array: keeps track of each position in tic tac toe board
    let gameArr = new Array(9);

    let players = new Array(2);

    const initPlayers = () => {
        if (botMode) {
            players = new Array(Player("Player1", 'X'), playerBot);
        } else {
            players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
        }
    };

    const switchTurn = () => {oddTurn = !oddTurn};
    const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};
    const resetTurn = () => {oddTurn = true};

    const toggleBotMode = () => {botMode = !botMode};

    const getArray = () => {return gameArr};
    const isCellEmpty = (position) => {return (gameArr[position] ? false : true)};
    const clearBoard = () => {gameArr = new Array(9)};
    
    const addMark = (symbol, position) => { 
        if (isCellEmpty(position)) {
            gameArr[position] = symbol;
            displayController.displayCell(position);
            switchTurn();
        }
    };

    const addCellEvent = (container, position) => {
        container.addEventListener('click', () => {
            if (isCellEmpty(position)) {
                addMark(getCurrentPlayer().getSymbol(), position);
                if (isGameOver()) {return};
                if (botMode) {
                    addMark(playerBot.getSymbol(), playerBot.chooseCell());
                    isGameOver();
                }
            }
        });
    };

    // check win conditions
    const checkWin = (arr) => {

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

        if (checkWin(gameArr)) {
            let msg = document.createTextNode(`${checkWin(gameArr).getName()} Wins!`);
            msgContainer.appendChild(msg);
            document.querySelector('.bg-modal').style.display = 'flex';
            return true;
        }

        for (let i = 0; i < gameArr.length; i++) {
            if ('undefined' == typeof gameArr[i]) {return false}
        }

        let msg = document.createTextNode("It's a Tie!");
        msgContainer.appendChild(msg);
        document.querySelector('.bg-modal').style.display = 'flex';
        return true;
    };

    return {
        getArray,
        clearBoard,
        toggleBotMode,
        resetTurn,
        addMark,
        addCellEvent,
        isGameOver,
        isCellEmpty,
        initPlayers,
        checkWin
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
            gameBoard.addCellEvent(box, i);
        }
    };

    const clearDisplay = () => {
        gameBoard.resetTurn();
        gameBoard.clearBoard();
        displayBoard();
    };

    return {
        displayCell,
        displayBoard,
        clearDisplay
    }
})();

// Bot Module
const playerBot = (() => {
    const bot = Player('BOT', 'O');
    const chooseRandom = () => {
        do {random = Math.floor(Math.random() * 9)}
        while(!gameBoard.isCellEmpty(random));
        return random;
    }
    const blockWin = () => {
        for (let i = 0; i < gameBoard.getArray().length; i++) {
            const copy = [...gameBoard.getArray()];
            if (gameBoard.isCellEmpty(i)){
                copy[i] = 'X';
                if (gameBoard.checkWin(copy)) {
                    return i;
                }
            }
        }
        return -1;
    }
    const chooseCell = () => {
        if (blockWin() == -1) {return chooseRandom()};
        return blockWin();
    }

    return {
        ...bot,
        chooseCell
    }
})();

// Event Listeners
//
// Restart button event
restartButton.addEventListener('click', () => {displayController.clearDisplay()});

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
                gameBoard.toggleBotMode();
            }
            break;
        case 'ArrowUp':
            if (currSelection.textContent.includes('2')) {
                currSelection.classList.remove('selected');
                document.getElementById('1p').classList.add('selected');
                gameBoard.toggleBotMode();
            }
            break;
        case 'Space':
            if (currSelection.textContent.includes('1')) {
                document.getElementById('p2Title').textContent = "BOT";
                document.getElementById('player2form').style.display = 'none';
            }
            startGame();
            break;
        default:
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
    title.style.animation = 'title 1s';
    title.style.top = '5%';
    startScreenText.style.display = 'none';
    main.style.position = 'absolute';
    main.style.top = '30%';
    main.style.animation = 'main 2s';
    main.style.transform = 'scale(1)';
    gameBoard.initPlayers();

}

// Submitting player name
function onNameSubmit(e) {
    e.preventDefault();
    let userInput = e.target.elements[0];
    (userInput.value ? userInput.placeholder = userInput.value : userInput.value = userInput.id);
    if (userInput.id == "P1") {
        gameBoard.players[0] = Player(userInput.value, 'X');
    } else {
        gameBoard.players[1] = Player(userInput.value, 'O');
    };
    e.target.elements[1].classList.add('submitted');
    return false;
}

// Start display
displayController.displayBoard();

