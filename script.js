// DOM Elements
const title = document.getElementById('title');
const main = document.querySelector('main');
const startMenu = document.querySelector('.start-menu');
const clearButton = document.getElementById('clear-btn');
const returnButton = document.getElementById('return-btn');
const diffSetting = document.getElementById('diff-setting');
const diffOptions = document.querySelectorAll('.diff-option');
const modalContent = document.querySelector('.modal-content');
const bgModal = document.querySelector('.bg-modal');
const modalClose = document.querySelector('.close');

// Factory functions
//
// Player Factory Function
const Player = (name, symbol) => {
    const getName = () => name;
    const setName = (newName) => {name = newName}; 
    const getSymbol = () => symbol;

    return {
        getName,
        setName,
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
    // Array: keeps track of players
    let players = new Array(2);

    const initPlayers = () => {
        if (botMode) {
            players = new Array(Player("Player1", 'X'), playerBot);
        } else {
            players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
        }
    };

    const switchTurn = () => {oddTurn = !oddTurn};
    const resetTurn = () => {oddTurn = true};
    const getCurrentPlayer = () => {return (oddTurn ? players[0] : players[1])};
    const setPlayerName = (name, number) => {players[number].setName(name)};
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
                if (isGameOver()) {
                    if (checkWin(gameArr)) {
                        displayController.displayModal(`${checkWin(gameArr).getName()} Wins!`);
                    } else {
                        displayController.displayModal("It's a Tie!");
                    };
                    return
                };

                if (botMode) {
                    addMark(playerBot.getSymbol(), playerBot.chooseCell());
                    if (isGameOver()) {
                        if (checkWin(gameArr)) {
                            displayController.displayModal(`${checkWin(gameArr).getName()} Wins!`);
                        } else {
                            displayController.displayModal("It's a Tie!");
                        };
                        return;
                    };
                };
            };
        });
    };

    const checkWin = (arr) => {
        // check rows for win condition
        for (let row = 0; row < 3; row++) {
            let rowSet = new Set(arr.slice(row * 3, (row + 1) * 3));
            if (rowSet.size == 1 && !rowSet.has(undefined)) {
                return (arr[row * 3] == players[0].getSymbol() ? players[0] : players[1]);
            }
        };

        // check columns for win condition
        for (let col = 0; col < 3; col++) {
            let colSet = new Set([arr[col], arr[col + 3], arr[col + 6]]);

            if (colSet.size == 1 && !colSet.has(undefined)) {
                return (arr[col] == players[0].getSymbol() ? players[0] : players[1]);
            }
        };

        // check diagonals for win condition
        let bslashSet = new Set([arr[0], arr[4], arr[8]]);
        if (bslashSet.size == 1 && !bslashSet.has(undefined)) {
            return (arr[0] == players[0].getSymbol() ? players[0] : players[1]);
        };
        let fslashSet = new Set([arr[2], arr[4], arr[6]]);
        if (fslashSet.size == 1 && !fslashSet.has(undefined)) {
            return (arr[2] == players[0].getSymbol() ? players[0] : players[1]); 
        };

        return false;

    };

    const isGameOver = () => {
        let msg;

        if (checkWin(gameArr)) {
            // check for winner
            return true;
        } else {
            // check if there are any empty cells
            for (let i = 0; i < gameArr.length; i++) {
                if ('undefined' == typeof gameArr[i]) {return false};
            }
            return true;
        };
    };

    return {
        // Array Methods
        getArray,
        addMark,
        
        // Player Methods
        initPlayers,
        setPlayerName,
        
        // Cell Methods
        addCellEvent,
        isCellEmpty,

        // Board Setting Methods
        toggleBotMode,
        resetTurn,
        clearBoard,
        checkWin,
        isGameOver,
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
        };
    };

    const displayModal = (message) => {
        const container = document.querySelector('.endgame-msg');
        container.textContent = message;
        bgModal.style.display = 'flex';
        return true;
    };

    // Start game function
    const displayStart = () => {
        title.style.position = 'absolute';
        title.style.animation = 'titleUp 1s';
        title.style.top = '5%';

        startMenu.style.display = 'none';
        
        main.style.position = 'absolute';
        main.style.top = '30%';
        main.style.animation = 'showMain 2s';
        main.style.transform = 'scale(1)';
        
        gameBoard.initPlayers();
        displayBoard();
    };

    const clearDisplay = () => {
        gameBoard.resetTurn();
        gameBoard.clearBoard();
        displayBoard();
    };

    const closeModal = () => {
        bgModal.style.display = 'none';
        clearDisplay();
    };

    const returnStartMenu = () => {
        title.style.animation = 'titleDown 2s';
        title.style.position = 'static';

        startMenu.style.display = 'flex';
        startMenu.style.animation = 'showStartMenu 1.5s';

        main.style.position = 'static';
        main.style.animation = 'hideMain 1s';
        main.style.transform = 'scale(0)';
    }

    return {
        displayCell,
        displayBoard,
        displayModal,
        displayStart,
        clearDisplay,
        returnStartMenu,
        closeModal
    }
})();

// Bot Module
const playerBot = ((difficulty = 0) => {
    const bot = Player('BOT', 'O');
    const setDifficulty = (newDifficulty) => {
        difficulty = newDifficulty;
        displayDifficulty();
    };

    const displayDifficulty = () => {
        console.log(difficulty);
    };

    const chooseRandom = () => {
        do {random = Math.floor(Math.random() * 9)}
        while(!gameBoard.isCellEmpty(random));
        return random;
    };

    const blockWin = () => {
        for (let i = 0; i < gameBoard.getArray().length; i++) {
            if (gameBoard.isCellEmpty(i)){
                const copy = [...gameBoard.getArray()];
                copy[i] = 'X';
                if (gameBoard.checkWin(copy)) {
                    return i;
                }
            }
        }
        return -1;
    };

    const score = (gameArray) => {
        if (gameArray.checkWin) {
            if (gameBoard.oddTurn) {
                return -10;
            }
            return 10;
        }
        return 0;
    };

    const minmax = (gameArray) => {
        const copy = [...gameArray];
        return score()
    };

    const chooseCell = () => {
        switch (difficulty) {
            case 0:
                return chooseRandom();
            case 1:
                if (blockWin() == -1) {return chooseRandom()};
                return blockWin();
            case 2:
                return minmax();
        }
    };

    return {
        ...bot,
        chooseCell,
        setDifficulty
    }
})();

// Event Listeners
//
// Clear button event
clearButton.addEventListener('click', displayController.clearDisplay);

// Return to start menu button event
returnButton.addEventListener('click', displayController.returnStartMenu);

// Difficulty setting
diffOptions.forEach((option) => {
    option.addEventListener('click', changeDifficulty)
});

// Modal close event
modalClose.addEventListener('click', displayController.closeModal); // for X close
bgModal.addEventListener('click', displayController.closeModal); // for background close

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
    const p2FormTitle = document.getElementById('p2Title');
    const p2Form = document.getElementById('player2form');

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
                p2FormTitle.textContent = "BOT";
                p2Form.style.display = 'none';
            } else {
                p2FormTitle.textContent = "PLAYER 2";
                p2Form.style.display = 'flex';
            }
            displayController.displayStart();
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
// Submitting player name
function onNameSubmit(e) {
    e.preventDefault();
    let userInput = e.target.elements[0];
    (userInput.value ? userInput.placeholder = userInput.value : userInput.value = userInput.id);
    if (userInput.id == "P1") {
        gameBoard.setPlayerName(userInput.value, 0);
    } else {
        gameBoard.setPlayerName(userInput.value, 1);
    };
    e.target.elements[1].classList.add('submitted');
    return false;
}

function changeDifficulty(e) {
    const newDifficulty = e.target.textContent;
    if (diffSetting !== newDifficulty) {
        switch (newDifficulty) {
            case 'Easy':
                playerBot.setDifficulty(0);
                diffSetting.textContent = 'Easy';
                break;
            case 'Medium':
                playerBot.setDifficulty(1);
                diffSetting.textContent = 'Medium';
                break;
            case 'Hard':
                playerBot.setDifficulty(2);
                diffSetting.textContent = 'Hard';
                break;
        }
    }
}

// Start display
displayController.displayBoard();

