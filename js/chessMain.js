const gameBoard = document.querySelector('#gameboard')
const WIDTH = 512
const HEIGHT = WIDTH
const DIMENSION = 8
const SQ_SIZE = HEIGHT / DIMENSION
const IMAGES = {}

class Move {
    ranksToRows = {"1": 7, "2": 6, "3": 5, "4": 4, "5": 3, "6": 2, "7": 1, "8": 0, }
    rowsToRanks = {"7": 1, "6": 2, "5": 3, "4": 4, "3": 5, "2": 6, "1": 7, "0": 8, }

    filesToCols = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7}
    colsToFiles = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"}

    constructor (startSq, endSq, board) {
        this.startRow = startSq[0]
        this.startCol = startSq[1]
        this.endRow = endSq[0]
        this.endCol = endSq[1]
        this.pieceMoved = board[this.startRow][this.startCol]
        this.pieceCaptured = board[this.endRow][this.endCol]
    }

    getChessNotation() {
        return [this.getRankFile(this.startRow, this.startCol), this.getRankFile(this.endRow, this.endCol)]
    }

    getRankFile(r, c) {
        return this.colsToFiles[c] + this.rowsToRanks[r]
    }
}

class GameState {
    constructor () {
        this.board = [
            ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
            ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
            [ "",   "",   "",   "",   "",   "",   "",   "" ],
            [ "",   "",   "",   "",   "",   "",   "",   "" ],
            [ "",   "",   "",   "",   "",   "",   "",   "" ],
            [ "",   "",   "",   "",   "",   "",   "",   "" ],
            ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
            ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
        ]

        this.whiteToMove = true
        this.moveLog = []
    }

    makeMove(move) {
        this.board[move.startRow][move.startCol] = ''
        this.board[move.endRow][move.endCol] = move.pieceMoved
        this.moveLog.push(move)
        this.whiteToMove = !this.whiteToMove
    }

    // todos os movimentos considerando os checks
    getValidMoves() {
        return this.getAllPossibleMoves() // não nos preocuparemos com os checks por enquanto
    }

    // todos os movimentos sem considerar os checks
    getAllPossibleMoves() {
        let moves = []
        this.board.forEach((row, r)=> {
            row.forEach((col, c) => {
                const turn = this.board[r][c][0]
                if((turn == 'w' && this.whiteToMove) || (turn == 'b' && !this.whiteToMove)) {
                    const piece = this.board[r][c][1]
                    if (piece == 'p') { moves.push(this.getPawnMoves(r, c)) }
                    else if (piece == 'R') { moves.push(this.getRookMoves(r, c)) }
                    // else if (piece == 'N') { this.getRookMoves(col, moves) }
                    else if (piece == 'B') { moves.push(this.getBishopMoves(r, c)) }
                    // else if (piece == 'Q') { this.getRookMoves(col, moves) }
                    // else if (piece == 'K') { this.getRookMoves(col, moves) }
                }
            })
        })
        return moves
    }

    getPawnMoves(r, c) {
        let movesPawn = []
        if(this.whiteToMove) { // white moves

            // move advanced
            if (this.board[r-1][c] == '') {
                movesPawn.push((new Move([r, c], [r-1, c], this.board)))
                if (r == 6 && this.board[r-2][c] == '')
                    movesPawn.push((new Move([r, c], [r-2, c], this.board)))
            }

            // captures
            if (c - 1 >= 0)
                if (this.board[r - 1][c - 1][0] == 'b')
                    movesPawn.push((new Move([r, c], [r - 1, c - 1], this.board)))
            
            if (c + 1 <= 7)
                if (this.board[r - 1][c + 1][0] == 'b')
                    movesPawn.push((new Move([r, c], [r - 1, c + 1], this.board)))
            
        } else { // black moves

            // move advanced
            if (this.board[r + 1][c] == '') {
                movesPawn.push((new Move([r, c], [r + 1, c], this.board)))
                if (r == 1 && this.board[r + 2][c] == '')
                    movesPawn.push((new Move([r, c], [r + 2, c], this.board)))
            }

            // captures
            if (c - 1 >= 0) // capture to left
                if (this.board[r + 1][c - 1][0] == 'w')
                    movesPawn.push((new Move([r, c], [r + 1, c - 1], this.board)))
            
            if (c + 1 <= 7) // capture to right
                if (this.board[r + 1][c + 1][0] == 'w')
                    movesPawn.push((new Move([r, c], [r + 1, c + 1], this.board)))

        }
        return movesPawn
    }

    getRookMoves(r, c) {
        let movesRook = []
        const directions = [[-1, 0], [0, -1], [1, 0], [0, 1]]
        const enemyColor = this.whiteToMove ? 'b' : 'w'

        directions.forEach(d => {
            for (let i = 1; i < 8; i++) {
                let endRow = r + (d[0] * i)
                let endCol = c + (d[1] * i)
                if ((0 <= endRow && endRow < 8) && (0 <= endCol && endCol < 8)) {
                    let endPiece = this.board[endRow][endCol]
                    if (endPiece == '')
                        movesRook.push(new Move([r, c], [endRow, endCol], this.board))
                    if (endPiece[0] == enemyColor)
                        movesRook.push(new Move([r, c], [endRow, endCol], this.board))
                }
            }
        })

        return movesRook
    }

    getBishopMoves(r, c) {
        let movesBishop = []
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        const enemyColor = this.whiteToMove ? 'b' : 'w'

        directions.forEach(d => {
            for (let i = 1; i < 8; i++) {
                let endRow = r + (d[0] * i)
                let endCol = c + (d[1] * i)
                if ((0 <= endRow && endRow < 8) && (0 <= endCol && endCol < 8)) {
                    let endPiece = this.board[endRow][endCol]
                    if (endPiece == '')
                        movesBishop.push(new Move([r, c], [endRow, endCol], this.board))
                    if (endPiece[0] == enemyColor)
                        movesBishop.push(new Move([r, c], [endRow, endCol], this.board))
                }
            }
        })

        return movesBishop
    }
}

const GS = new GameState();
let validMoves = GS.getValidMoves()
let moveMade = false


function loadImages() {
    const pieces = ["bR", "bN", "bB", "bQ", "bK", "bp", "wR", "wN", "wB", "wQ", "wK", "wp"]
    pieces.forEach(p => { IMAGES[p] = `img/${p}.png` })
}

function createBoard() {
    loadImages()
    drawGameState(GS.board)
}

function drawGameState(board) {
    board.forEach((row, r) => {
        row.forEach((col, c) => {
            const square = document.createElement('div')
            square.classList.add('square')
            
            if(col != '') square.innerHTML = `<img src="${IMAGES[col]}" style="cursor: pointer">`
            square.firstChild?.setAttribute('draggable', true)
            square.setAttribute('row', r)
            square.setAttribute('col', c)

            if(r % 2 === 0) square.classList.add(c % 2 === 0 ? 'sq-white' : 'sq-black');
            else square.classList.add(c % 2 === 0 ? 'sq-black' : 'sq-white');

            gameBoard.append(square)
        })
    })
}

createBoard()

const allSquares = document.querySelectorAll(".square");
allSquares.forEach(square => {
    square.addEventListener('click', dragClick);
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
})

let playerClicks = null
let startSq = []
let endSq = []
let draggedElement
function dragClick(event) {
    if (!playerClicks) { // verifica se o jogador já fez o primeiro click

        if (event.target.getAttribute('draggable')) {
            let startRow = event.target.parentNode.getAttribute('row');
            let startCol = event.target.parentNode.getAttribute('col');
            startSq = [startRow, startCol]
            playerClicks = [startSq]
            draggedElement = event.target
        }

    } else { // caso já exista o primeiro click, então esse é o segundo (casa alvo)

        var endRow = event.target.getAttribute('row') || event.target.parentNode.getAttribute('row')
        var endCol = event.target.getAttribute('col') || event.target.parentNode.getAttribute('col')
        endSq = [ endRow, endCol ]

        if (endSq.toString() != startSq.toString()) { // verifica se clicou no mesmo lugar
            
            validMoves.forEach(vm => {
                vm.forEach(m => {
                    const move = new Move(startSq, endSq, GS.board)
                    // essa condição verifica se o movimento é válido, i.e., se está incluso
                    // no array validMoves
                    if( (m.startRow == move.startRow) && (m.endRow == move.endRow) &&
                        (m.startCol == move.startCol) && (m.endCol == move.endCol) ) {
                        
                        // aqui é feito a troca de peças no tabuleiro
                        if(event.target.getAttribute('draggable')) {
                            event.target.parentNode.append(draggedElement)
                            event.target.remove()
                        } else {
                            event.target.append(draggedElement);
                        }
            
                        GS.makeMove(move)
                        moveMade = true
                    }
                })
            })

            if (moveMade) {
                validMoves = GS.getValidMoves()
                moveMade = false
            }
        }

        playerClicks = null
    }
}

function dragStart(event) {
    dragClick(event)
}

function dragOver(event) {
    event.preventDefault();
}

function dragDrop(event) {
    event.stopPropagation();
    dragClick(event)
    
    //changePlayer();

    // if (correctGo) {
    //     if (takenByOpponent && valid) {
    //         return;
    //     }

    //     if (taken && !takenByOpponent) {
    //         infoDisplay.textContent = "you cannot go here!";
    //         setTimeout(() => infoDisplay = "", 2000);    
    //         return;
    //     }

    //     if (valid) {
    //         e.target.append(draggedElement);
    //         changePlayer();
    //         return;
    //     }
    // }
}