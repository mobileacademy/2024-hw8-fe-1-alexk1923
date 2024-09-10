/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;

const DIFFICULTIES = {
    easy: {
        'rowCount': 9,
        'colCount': 9,
    },
    // TODO you can declare here the medium and expert difficulties
    medium: {
        'rowCount': 16,
        'colCount': 16,
    },
    expert: {
        'rowCount': 30,
        'colCount': 16,
    }
}

let selectedDifficulty = DIFFICULTIES.easy;

const bombProbabilityInput = document.getElementById("bombProbabilityInput");
const maxProbabilityInput = document.getElementById("maxProbabilityInput");

bombProbabilityInput.addEventListener('change', (e) => {
    if (Number(e.target.value) > maxProbability) {
        alert("Bomb probability cannot be higher than max probability");
        return;
    }
    bombProbability = e.target.value;
    console.log(bombProbability);
    startGame();

});

maxProbabilityInput.addEventListener('change', (e) => {
    if (Number(e.target.value) < bombProbability) {
        alert("Max probability cannot be lower than bomb probability");
        return;
    }
    maxProbability = e.target.value;
    console.log(maxProbability);
    startGame();

});

function changeDifficulty(newDifficulty) {
    const selectedDifficultyIndex = document.getElementById("difficultySelection").selectedIndex;
    console.log("idx = " + selectedDifficultyIndex);


    switch (selectedDifficultyIndex) {
        case 0:
            selectedDifficulty = DIFFICULTIES.easy;
            break;
        case 1:
            selectedDifficulty = DIFFICULTIES.medium;
            bombProbability = 6;
            bombProbabilityInput.value = 6;
            break;
        case 2:
            selectedDifficulty = DIFFICULTIES.expert;
            bombProbability = 9;
            bombProbabilityInput.value = 9;
        default:
            break;
    }

    startGame();

}


function minesweeperGameBootstrapper() {
    bombCount = 0;
    squaresLeft = 0;
    openedSquares = [];
    if (!selectedDifficulty.rowCount || !selectedDifficulty.colCount) {
        alert("No difficulty selected!");
        return;
    }

    generateBoard({ 'rowCount': selectedDifficulty.rowCount, 'colCount': selectedDifficulty.colCount });

}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;

    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }


    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */
    console.log(board);


    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }


    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j] = new BoardSquare(true, 0);
                bombCount++;
            }
        }
    }


    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround = countBombsAround(i, j);
            }
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */


    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
    *
    * TODO count the bombs around each square
    *
    */
    function countBombsAround(i, j) {
        let arroundBombsCount = 0;
        for (let x = i - 1; x <= i + 1; x++) {
            for (let y = j - 1; y <= j + 1; y++) {
                if (x >= 0 && x <= boardMetadata.rowCount - 1 && y >= 0 && y <= boardMetadata.colCount - 1) {
                    if (board[x][y].hasBomb) {
                        arroundBombsCount++;
                    }
                }
            }
        }

        return arroundBombsCount;

    }

    /*
    *
    * print the board to the console to see the result
    *
    */
    console.log(board);

    const gameContainer = document.getElementById("gameContainer");
    gameContainer.innerHTML = "";

    for (let i = 0; i < boardMetadata.rowCount; i++) {

        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let j = 0; j < boardMetadata.colCount; j++) {


            const newDiv = document.createElement("div");

            newDiv.classList.add("col", "tile", "closed-tile", "d-flex", "justify-content-center", "align-items-center");

            newDiv.addEventListener("click", handleClickTile);
            newDiv.addEventListener("contextmenu", handleMarkTile);
            newDiv.dataset.i = i;
            newDiv.dataset.j = j;


            if (board[i][j].hasBomb) {
                newDiv.classList.add("bg-danger");
                newDiv.classList.add("bomb");
                newDiv.innerHTML = `<img src="assets/bomb.png" class="icon invisible" alt="bomb" />`
            } else {
                newDiv.classList.add("bg-light");
                newDiv.innerHTML = `<span id="bombsAroundText" class="invisible">${board[i][j].bombsAround !== 0 ? board[i][j].bombsAround : ""}</span>`
            }


            rowDiv.appendChild(newDiv);
            gameContainer.appendChild(rowDiv);
        }
    }
}

const checkWinState = () => {
    console.log("Bomb count = " + bombCount);
    console.log("Squares left = " + squaresLeft);

    if (squaresLeft === bombCount) {
        const gameContainer = document.getElementById("gameContainer");
        const alert = document.createElement("div");
        alert.classList.add("alert", "alert-success");
        alert.textContent = "Game completed!";
        gameContainer.appendChild(alert);
    }
}

const revealTile = (tile) => {

    if (!tile.classList.contains("closed-tile")) {
        return;
    }

    removeFlagFromTile(tile);
    tile.classList.remove("closed-tile");

    // Get either image of bomb or information text for normal tile
    const infoElement = tile.classList.contains("bomb") ? "img" : "span";
    const tileInfo = tile.getElementsByTagName(infoElement)[0];

    tileInfo.classList.remove("d-none");

    // Toggle visibility
    tileInfo.classList.remove("invisible");
    tileInfo.classList.add("visible");

    squaresLeft--;
    checkWinState();

}

const handleClickTile = (event) => {

    if (!event.currentTarget.classList.contains("closed-tile")) {
        return;
    }

    const square = board[event.currentTarget.dataset.i][event.currentTarget.dataset.j];


    if (!square.hasBomb && square.bombsAround === 0) {
        // Reveal all blank tiles
        revealExpandedTiles(event);
    } else {
        squaresLeft--;
    }

    removeFlagFromTile(event.currentTarget);
    event.currentTarget.classList.remove("closed-tile");


    // Get either image of bomb or information text for normal tile
    const infoElement = event.currentTarget.classList.contains("bomb") ? "img" : "span";
    const tileInfo = event.currentTarget.getElementsByTagName(infoElement)[0];

    tileInfo.classList.remove("d-none");


    // Toggle visibility
    tileInfo.classList.remove("invisible");
    tileInfo.classList.add("visible");

    if (event.currentTarget.classList.contains("bomb")) {
        var snd = new Audio("assets/explosion.mp3");
        snd.play();
        const gameContainer = document.getElementById("gameContainer");
        const alert = document.createElement("div");
        alert.classList.add("alert", "alert-danger");
        alert.textContent = "You have failed!";
        gameContainer.appendChild(alert);
        return;
    }

    checkWinState();
}


const handleMarkTile = (event) => {
    event.preventDefault();

    // Remove the flag and return if already marked
    if (removeFlagFromTile(event.currentTarget)) {
        return;
    };

    if (!event.currentTarget.classList.contains("closed-tile")) {
        return;
    }

    // Get either image of bomb or information text for normal tile
    const infoElement = event.currentTarget.classList.contains("bomb") ? "img" : "span";
    const tileInfo = event.currentTarget.getElementsByTagName(infoElement)[0];



    console.log(tileInfo);

    // Toggle visibility
    tileInfo.classList.add("d-none");
    // tileInfo.classList.add("visible");

    // Add a redflag
    const flagImage = document.createElement("img");
    flagImage.src = "assets/red-flag.png"
    flagImage.alt = "red-flag";
    flagImage.classList.add("icon", "flag");
    event.currentTarget.appendChild(flagImage);

}

const removeFlagFromTile = (tile) => {

    const images = tile.getElementsByTagName("img");
    for (const image of images) {
        if (image.classList.contains("flag")) {
            tile.removeChild(image);
            return true;
        }
    }

    return false;
}

const expandTiles = (currentRow, currentCol, boardMetadata) => {

    // Add all indices to a list to display them later

    // Check for the neighbours and expand the reveal search
    for (let i = currentRow - 1; i <= currentRow + 1; i++) {
        for (let j = currentCol - 1; j <= currentCol + 1; j++) {

            const alreadyRevealed = openedSquares.find(square => square.i == i && square.j == j);



            if (i >= 0 && i <= boardMetadata.rowCount - 1 && j >= 0 && j <= boardMetadata.colCount - 1 && !board[i][j].hasBomb && !alreadyRevealed) {
                console.log(`Base: (${currentRow}, ${currentCol}): i = ${i}, j=${j}`);

                openedSquares.push({ i, j });

                if (board[i][j].bombsAround === 0) {


                    console.log(`For i = ${i} and j = ${j}, the board[i][j]=`);
                    console.log(board[i]);
                    console.log(` has 0 bombs around, so expand`);
                    expandTiles(i, j, boardMetadata);

                }
            }
        }
    }

}

const revealExpandedTiles = (event) => {
    expandTiles(Number(event.target.dataset.i), Number(event.target.dataset.j), { 'rowCount': selectedDifficulty.rowCount, 'colCount': selectedDifficulty.colCount });
    console.log(openedSquares);
    for (square of openedSquares) {
        const htmlSquare = document.querySelector(`[data-i="${square.i}"][data-j="${square.j}"]`);
        revealTile(htmlSquare);
    }

}

/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
const startGame = () => minesweeperGameBootstrapper();

window.onload = startGame;

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)
