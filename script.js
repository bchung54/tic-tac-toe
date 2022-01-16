// Boolean: keeps track of whose turn
let oddTurn = true;

// Player Factory Function
const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;
    const markBoard = (positionX, positionY) => {
        return gameBoard.addMark(getSymbol(), positionX, positionY);
    };

    return {
        getName,
        markBoard
    }
};



// Game Board Module
const gameBoard = ( () => {

    // create 3x3 array
    const arr = new Array(3);

    for (let i = 0; i < 3; i++) {
        arr[i] = new Array(3)
    };

    const getArray = () => {
        return arr;
    };

    // mark the board
    const addMark = (symbol, positionX, positionY) => { 
        if (arr[positionY][positionX]) {
            return false;
        } else {
            arr[positionY][positionX] = symbol;
            return true;
        }
    };

    return {
        getArray,
        addMark
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
                cell.setAttribute('positionY', i);
                cell.setAttribute('positionX', j);
                cell.classList.add('cell');
                cell.addEventListener('click', (e) => {
                    let cell = e.target;
                    let mark = getCurrentPlayer().markBoard(cell.getAttribute('positionX'), cell.getAttribute('positionY'));
                    console.log(mark);
                    if (mark) {
                        oddTurn = !oddTurn;
                        displayBoard();
                    }
                });

                if (gameBoard.getArray()[i][j]) {
                    cell.appendChild(document.createTextNode(gameBoard.getArray()[i][j]));
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