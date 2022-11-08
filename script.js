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

const Board = (arr = new Array(9)) => {
    const getArray = () => { return arr };
    const isCellEmpty = (position) => { return (arr[position]? false : true) };
    const emptyCellIndices = () => { 
        let emptyCells = [];
        for (let i = 0; i < arr.length; i++) {
            if (isCellEmpty(i)) {
                emptyCells.push(i);
            };
        };
        return emptyCells;
    };

    const clearBoard = () => {arr = new Array(9)};

    const addMark = (symbol, position) => {
        if (isCellEmpty(position)) {
            arr[position] = symbol;
            // displayController.displayCell(position);
            // switchTurn();
        }
    };

    const removeMark = (position) => {
        if (!isCellEmpty(position)) {
            arr[position] = undefined;
        }
    }

    return {
        getArray,
        isCellEmpty,
        emptyCellIndices,
        clearBoard,
        addMark,
        removeMark
    }
};

// Modules
//
// Game Module
const game = (function() {

    // Boolean: keeps track of bot mode
    let botMode = true;
    // Array: keeps track of each position in tic tac toe board
    let board = Board();
    // Array: keeps track of players
    let players = new Array(2);
    let currPlayer;

    const initPlayers = () => {
        if (botMode) {
            players = new Array(Player("Player1", 'X'), playerBot);
        } else {
            players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
        }
        currPlayer = players[0];
    };

    const switchTurn = () => { 
        if ( currPlayer == players[0]) {
            currPlayer = players[1];
        } else {
            currPlayer = players[0];
        }
    };
    const resetTurn = () => {currPlayer = players[0]};
    const getCurrentPlayer = () => {return currPlayer};
    const setPlayerName = (name, number) => {players[number].setName(name)};
    const toggleBotMode = () => {botMode = !botMode};
    const getBoard = () => {return board};

    const addCellEvent = (container, position) => {
        container.addEventListener('click', () => {
            if (board.isCellEmpty(position)) {
                board.addMark(getCurrentPlayer().getSymbol(), position);
                displayController.displayCell(position);
                if (isGameOver(board)) {
                    if (checkWin(board, players[0])) {
                        displayController.displayModal(`${players[0].getName()} Wins!`);
                    } else if (checkWin(board, players[1])) {
                        displayController.displayModal(`${players[1].getName()} Wins!`);
                    } else {
                        displayController.displayModal("It's a Tie!");
                    };
                    return
                };
                switchTurn();

                if (botMode) {
                    const botChoice = playerBot.chooseCell();
                    board.addMark(playerBot.getSymbol(), botChoice);
                    displayController.displayCell(botChoice);
                    switchTurn();
                    if (isGameOver(board)) {
                        if (checkWin(board, players[0])) {
                            displayController.displayModal(`${players[0].getName()} Wins!`);
                        } else if (checkWin(board, players[1])) {
                            displayController.displayModal(`${players[1].getName()} Wins!`);
                        } else {
                            displayController.displayModal("It's a Tie!");
                        }
                        return;
                    };
                };
            };
        });
    };

    const checkWin = (board, player) => {
        let arr = board.getArray();
        // check rows for win condition
        for (let row = 0; row < 3; row++) {
            let rowSet = new Set(arr.slice(row * 3, (row + 1) * 3));
            if (rowSet.size == 1 && !rowSet.has(undefined)) {
                return arr[row * 3] == player.getSymbol();
            }
        }

        // check columns for win condition
        for (let col = 0; col < 3; col++) {
            let colSet = new Set([arr[col], arr[col + 3], arr[col + 6]]);

            if (colSet.size == 1 && !colSet.has(undefined)) {
                return arr[col] == player.getSymbol();
            }
        }

        // check diagonals for win condition
        let bslashSet = new Set([arr[0], arr[4], arr[8]]);
        if (bslashSet.size == 1 && !bslashSet.has(undefined)) {
            return arr[0] == player.getSymbol();
        }
        let fslashSet = new Set([arr[2], arr[4], arr[6]]);
        if (fslashSet.size == 1 && !fslashSet.has(undefined)) {
            return arr[2] == player.getSymbol();
        }

        return false;
    };

    const isGameOver = (board) => {
        // check if any player has won
        for (const player of players) {
            if (checkWin(board, player)) {
                return true;
            }
        }

        // check if there are any empty cells
        if (board.emptyCellIndices().length == 0) {
            return true;
        }
        return false;
    };

    const setBotDifficulty = (difficulty) => {
        playerBot.setDifficulty(difficulty); 
        if (difficulty == 2) {
            board = Board([ , 'X', , 'O', , , , , ]);
            displayController.displayBoard();
        }
    };

    // Bot Module
    const playerBot = ((difficulty = 0) => {
        const bot = Player('BOT', 'O');
        const setDifficulty = (newDifficulty) => {
            difficulty = newDifficulty;
        };

        const chooseRandom = () => {
            do {random = Math.floor(Math.random() * 9)}
            while(!board.isCellEmpty(random));
            return random;
        };

        const blockWin = () => {
            for (const index of board.emptyCellIndices()) {
                board.addMark(players[0].getSymbol(), index);
                if (checkWin(board, players[0])) {
                    board.removeMark(index);
                    return index;
                }
                board.removeMark(index);

            }
            return -1;
        };

        const score = (board, player) => {
            let opponent = player == players[0] ? players[1] : players[0];

            if (checkWin(board, player)) {
                return 10;
            } else if (checkWin(board, opponent)) {
                return -10;
            }
            return 0;
        };

        const minmax = (board, player) => {

            if (isGameOver(board)) {
                console.log(board.getArray(), `scored: ${score(board, player)}`);
                return score(board, player);
            }

            const moves = [];
            const copyBoardArray = [...board.getArray()];
            for (const emptyCellIndex of board.emptyCellIndices()) {
                let move = {};
                move.index = emptyCellIndex;
                copyBoardArray[emptyCellIndex] = player.getSymbol();

                console.log(`player symbol added for index: ${move.index}`, copyBoardArray);
                move.score = minmax(Board(copyBoardArray), players[1]);
                copyBoardArray[emptyCellIndex] = undefined;
                console.log("player symbol removed:", copyBoardArray);
                moves.push(move);
            }
            console.log(moves);
            if (player === players[1]) {
                return moves.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr, moves[0]).index;
            }
            return moves.reduce((prev, curr) => (prev.score < curr.score ? prev : curr), moves[0]).index;
        };

        const chooseCell = () => {
            switch (difficulty) {
                case 0:
                    return chooseRandom();
                case 1:
                    if (blockWin() == -1) {return chooseRandom()};
                    return blockWin();
                case 2:
                    return minmax(board, players[1]);
            }
        };

        return {
            ...bot,
            chooseCell,
            setDifficulty
        }
    })();

    return {
        // Array Methods
        getBoard,
        
        // Player Methods
        initPlayers,
        setPlayerName,
        
        // Cell Methods
        addCellEvent,

        // Board Setting Methods
        toggleBotMode,
        setBotDifficulty,
        resetTurn
    }
})();

// Display Controller Module
const displayController = (function() {

    const displayCell = (position) => {
        if (game.getBoard().getArray()[position]) {
            let box = document.getElementById(`box-${position}`);
            box.textContent = game.getBoard().getArray()[position];
        }
    };

    const displayBoard = () => {
        for (let i = 0; i < 9; i++) {
            let box = document.getElementById(`box-${i}`);
            if (box.firstChild) {
                box.removeChild(box.firstChild);
            };
            displayCell(i);
            game.addCellEvent(box, i);
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
        
        game.initPlayers();
        displayBoard();
    };

    const clearDisplay = () => {
        game.resetTurn();
        game.getBoard().clearBoard();
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
                game.toggleBotMode();
            }
            break;
        case 'ArrowUp':
            if (currSelection.textContent.includes('2')) {
                currSelection.classList.remove('selected');
                document.getElementById('1p').classList.add('selected');
                game.toggleBotMode();
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
        game.setPlayerName(userInput.value, 0);
    } else {
        game.setPlayerName(userInput.value, 1);
    };
    e.target.elements[1].classList.add('submitted');
    return false;
}

function changeDifficulty(e) {
    const newDifficulty = e.target.textContent;
    if (diffSetting !== newDifficulty) {
        switch (newDifficulty) {
            case 'Easy':
                game.setBotDifficulty(0);
                diffSetting.textContent = 'Easy';
                break;
            case 'Medium':
                game.setBotDifficulty(1);
                diffSetting.textContent = 'Medium';
                break;
            case 'Hard':
                game.setBotDifficulty(2);
                diffSetting.textContent = 'Hard';
                break;
        }
    }
}

// Start display
displayController.displayBoard();

