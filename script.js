// DOM Elements
const title = document.getElementById('title');
const main = document.querySelector('main');
const startMenu = document.querySelector('.start-menu');
const clearButton = document.getElementById('clear-btn');
const returnButton = document.getElementById('return-btn');
const submitButtons = document.querySelectorAll('.submit-btn');
const nameInputP1 = document.getElementById('P1');
const nameInputP2 = document.getElementById('P2');
const diffContainer = document.getElementById('difficulty');
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
        // Array of empty cells on the board
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
        }
    };
    const removeMark = (position) => {
        if (!isCellEmpty(position)) {
            arr[position] = undefined;
        }
    };

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

    let botMode = true;
    let board = Board();
    let players = new Array(2);
    let currPlayer;

    const initPlayers = () => {
        clearNames();
        if (botMode) {
            players = new Array(Player("Player1", 'X'), playerBot);
        } else {
            players = new Array(Player("Player1", 'X'), Player("Player2", 'O'));
        }
        currPlayer = players[0];
    };

    const setPlayerName = (name, number) => { players[number].setName(name) };
    const setBotDifficulty = (difficulty) => { playerBot.setDifficulty(difficulty) };
    const getBoard = () => { return board };
    const switchTurn = () => { currPlayer = (currPlayer == players[0]) ? players[1] : players[0] };
    const resetTurn = () => { currPlayer = players[0] };
    const toggleBotMode = () => { botMode = !botMode };

    const clearNames = () => {
        nameInputP1.value = '';
		nameInputP1.placeholder = 'Enter Name';
        nameInputP2.value = '';
        nameInputP2.placeholder = 'Enter Name';
        submitButtons.forEach((button) => { button.classList.remove('submitted') });
    };

    const reset = () => {
        board.clearBoard();
        resetTurn();
    };

    const addCellEvent = (container) => {
        container.addEventListener('click', onCellClick);
    };

    function onCellClick() {
        const position = parseInt(this.id.slice(-1));
        if (board.isCellEmpty(position)) {
            takeTurn(currPlayer, position);
            if (isGameOver(board)) {
                return endGame();
            }
            switchTurn();

            // Bot takes turn
            if (botMode) {
                const botChoice = playerBot.chooseCell();
                takeTurn(playerBot, botChoice);
                if (isGameOver(board)) {
                    return endGame();
                }
                switchTurn();
            };
        };
    };

    const takeTurn = (player, position) => {
        board.addMark(player.getSymbol(), position);
        displayController.displayCell(position);
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
        };

        // check if there are any empty cells
        if (board.emptyCellIndices().length == 0) {
            return true;
        };

        return false;
    };

    const endGame = () => {
        if (checkWin(board, currPlayer)) {
            displayController.displayModal(`${currPlayer.getName()} Wins!`);
        } else {
            displayController.displayModal("It's a Tie!");
        }
        return;
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

        const score = (board, depth) => {

            if (checkWin(board, players[1])) {
                return 10 - depth;
            } else if (checkWin(board, players[0])) {
                return depth - 10;
            }
            return 0;
        };

        const minmax = (board, player, depth) => {
            const moves = [];
            const copyBoardArray = [...board.getArray()];
            for (const emptyCellIndex of board.emptyCellIndices()) {
                let move = {};
                move.index = emptyCellIndex;
                
                copyBoardArray[emptyCellIndex] = player.getSymbol();
                const copyBoard = Board(copyBoardArray);
                
                if (isGameOver(copyBoard)) {
                    move.score = score(copyBoard, depth);
                } else {
                    const opponent = players.filter((element) => element !== player)[0];
                    move.score = minmax(Board(copyBoardArray), opponent, depth + 1).score;
                }
                
                copyBoardArray[emptyCellIndex] = undefined;
                moves.push(move);
            }
            if (player === playerBot) {
                return moves.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
            }
            return moves.reduce((prev, curr) => (prev.score < curr.score) ? prev : curr);
        };

        const chooseCell = () => {
            switch (difficulty) {
                case 0:
                    return chooseRandom();
                case 1:
                    if (blockWin() == -1) {return chooseRandom()};
                    return blockWin();
                case 2:
                    return minmax(board, players[1], 0).index;
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
        reset
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
            game.addCellEvent(box);
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
        game.reset();
        displayBoard();
    };

    const clearDisplay = () => {
        game.reset();
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
                diffContainer.style.display = 'inline-block';
                p2FormTitle.textContent = "BOT";
                p2Form.style.display = 'none';
            } else {
                diffContainer.style.display = 'none';
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
};

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
};

// Start display
displayController.displayBoard();