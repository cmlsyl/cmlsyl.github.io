const BOARD_SIZE = 8
const DIRECTION_TOP = 0
const DIRECTION_RIGHT = 1
const DIRECTION_DOWN = 2
const DIRECTION_LEFT = 3

const STATE_READY = 0
const STATE_PLAYING = 1

const COLORS = [
  "#fb7b77",
  "#fdc170",
  "#f3f87f",
  "#98f786",
  "#69ebfc",
  "#6d9efc",
  "#937df8",
  "#f78ef0",
]

let BOARD
let gameState
let timer
let passedTime

function getFormattedTime(time) {
  let formattedTime = ""

  if (time / 60 > 0) {
    formattedTime += ('00' + Math.floor(time / 60)).slice(-2) + ":"
  } else {
    formattedTime += "00:"
  }

  formattedTime += ('00' + time % 60).slice(-2)

  return formattedTime
}

function startTimer() {
  passedTime = 0

  if (timer) {
    clearInterval(timer)
  }

  timer = setInterval(() => {
    if (gameState !== STATE_PLAYING) return

    passedTime++

    document.getElementById("timer").innerHTML = getFormattedTime(passedTime)

    if (passedTime > 3600) {
      endGame()
    }
  }, 1000)
}

function validateBoard() {
  let placementValues = []

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      BOARD[i][j].valid = true

      if (BOARD[i][j].playerQueen) {
        if (isPlayerQueenCellValid(i, j)) {
          if (placementValues.find(v => v === BOARD[i][j].value) === undefined) {
            placementValues.push(BOARD[i][j].value)
          } else {
            BOARD[i][j].valid = false
          }
        } else {
          BOARD[i][j].valid = false
        }
      }

      const tableCell = document.getElementById("board-cell-" + i + "-" + j)

      if (BOARD[i][j].valid) {
        tableCell.style.background = COLORS[BOARD[i][j].value]
      } else {
        tableCell.style.background = "red"
      }
    }
  }

  // is any cell invalid
  if (BOARD.find(row => row.find(cell => !cell.valid))) return

  if (placementValues.length === BOARD_SIZE) {
    endGame(true)
  }
}

function onCellClick(row, col) {
  let cell = document.getElementById("board-cell-" + row + "-" + col)

  if (BOARD[row][col].playerQueen) {
    cell.removeChild(cell.childNodes[0])
  } else {
    let crown = document.getElementById("crown").cloneNode(true)
    crown.style.display = "flex"
    crown.id = "crown-" + row + "-" + col
    cell.appendChild(crown)
  }

  BOARD[row][col].playerQueen = !BOARD[row][col].playerQueen

  validateBoard()
}

function isQueenCellValid(row, col) {
  let valid = true

  for (let i = 0; i < row; i++) {
    if (BOARD[i][col]?.queen) {
      valid = false
    }
  }

  if (row > 0 && col > 0 && BOARD[row - 1][col - 1]?.queen) {
    valid = false
  }

  if (row > 0 && col < BOARD_SIZE - 1 && BOARD[row - 1][col + 1]?.queen) {
    valid = false
  }

  return valid
}

function generateQueens() {
  let row = 0

	while (row < BOARD_SIZE) {
	  let hasValidCells = false
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (isQueenCellValid(row, i)) {
        hasValidCells = true
      }
    }

    if (!hasValidCells) return false

    let col = Math.floor(Math.random() * BOARD_SIZE)

    while (!isQueenCellValid(row, col)) {
      col = Math.floor(Math.random() * BOARD_SIZE)
    }

    BOARD[row][col] = { value: row, queen: true }
    row++
	}

	return true
}

function removeRenderedBoard() {
  const boardTable = document.getElementById("board-table")
  if (boardTable) {
    boardTable.remove()
  }
}

function drawBoard() {
  const board = document.getElementById("board")
  const table = document.createElement("table")
  table.id = "board-table"
  for (let i = 0; i < BOARD_SIZE; i++) {
    const tableRow = document.createElement("tr")
    for (let j = 0; j < BOARD_SIZE; j++) {
      const tableCell = document.createElement("td")

      tableCell.id = "board-cell-" + i + "-" + j

      if (BOARD[i][j]) {
        tableCell.style.background = COLORS[BOARD[i][j].value]
      } else {
        tableCell.style.background = "#333333"
      }

      tableCell.onclick = () => onCellClick(i, j)

      tableRow.appendChild(tableCell)
    }
    table.appendChild(tableRow)
  }
  board.appendChild(table)
}

function targetCell(row, col, direction) {
	switch (direction) {
		case DIRECTION_TOP:
			return { row: row - 1, col: col }
		case DIRECTION_RIGHT:
			return { row: row, col: col + 1 }
		case DIRECTION_DOWN:
			return { row: row + 1, col: col }
		case DIRECTION_LEFT:
			return { row: row, col: col - 1 }
		default:
			return undefined;
	}
}

function isCellEmpty(row, col) {
	if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) return false;

	return !BOARD[row][col];
}

function generatePool(val, row, col, cellCount) {
  let hasEmptyCells = false
  for (let i = 0; i < 4; i++) {
    let target = targetCell(row, col, i)
    if (isCellEmpty(target.row, target.col)) {
      hasEmptyCells = true
    }
  }

  if (!hasEmptyCells) return

  let target = targetCell(row, col, Math.floor(Math.random() * 4))

 	while(!isCellEmpty(target.row, target.col)) {
		target = targetCell(row, col, Math.floor(Math.random() * 4))
 	}

  row = target.row
  col = target.col

  BOARD[row][col] = {
    value: val,
   	queen: BOARD[row][col]?.queen()
  }

  if (cellCount > 1) {
   	generatePool(val, row, col, cellCount - 1);
  }
}

function fillEmptyCells() {
	for (let i = 0; i < BOARD_SIZE; i++) {
		for (let j = 0; j < BOARD_SIZE; j++) {
			if (!BOARD[i][j]) {
				if (j > 0 && BOARD[i][j - 1] != null) {
          BOARD[i][j] = { value: BOARD[i][j - 1].value }
				} else if (i > 0 && BOARD[i - 1][j] != null) {
					BOARD[i][j] = { value: BOARD[i - 1][j].value }
				} else if (j < BOARD_SIZE - 1 && BOARD[i][j + 1] != null) {
					BOARD[i][j] = { value: BOARD[i][j + 1].value }
				} else if (i < BOARD_SIZE - 1 && BOARD[i + 1][j] != null) {
					BOARD[i][j] = { value: BOARD[i + 1][j].value }
				}
			}
		}
	}

	for (let i = BOARD_SIZE - 1; i > -1; i--) {
		for (let j = BOARD_SIZE - 1; j > -1; j--) {
  		if (!BOARD[i][j]) {
  			if (j > 0 && BOARD[i][j - 1] != null) {
            BOARD[i][j] = { value: BOARD[i][j - 1].value }
  			} else if (i > 0 && BOARD[i - 1][j] != null) {
  				BOARD[i][j] = { value: BOARD[i - 1][j].value }
  			} else if (j < BOARD_SIZE - 1 && BOARD[i][j + 1] != null) {
  				BOARD[i][j] = { value: BOARD[i][j + 1].value }
  			} else if (i < BOARD_SIZE - 1 && BOARD[i + 1][j] != null) {
  				BOARD[i][j] = { value: BOARD[i + 1][j].value }
  			}
  		}
		}
	}
}

function isPlayerQueenCellValid(row, col) {
  let valid = true

  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i === row) continue

    if (BOARD[i][col]?.playerQueen) {
      valid = false
    }
  }

  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i === col) continue

    if (BOARD[row][i]?.playerQueen) {
      valid = false
    }
  }

  if (row > 0 && col > 0 && BOARD[row - 1][col - 1]?.playerQueen) {
    valid = false
  }

  if (row > 0 && col < BOARD_SIZE - 1 && BOARD[row - 1][col + 1]?.playerQueen) {
    valid = false
  }

  if (row < BOARD_SIZE - 1 && col > 0 && BOARD[row + 1][col - 1]?.playerQueen) {
    valid = false
  }

  if (row < BOARD_SIZE - 1 && col < BOARD_SIZE - 1 && BOARD[row + 1][col + 1]?.playerQueen) {
    valid = false
  }

  return valid
}

function initGame() {
  BOARD = []
  for (let i = 0; i < BOARD_SIZE; i++) {
    let row = []
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push(undefined)
    }
    BOARD.push(row)
  }

  removeRenderedBoard()

  let queensReady = generateQueens()
  if (!queensReady) {
    console.log("invalid queen placement, reinitialize game call is triggered")
    initGame()
    return
  }

  let currentIndex = -1;
	for (let i = 0; i < BOARD_SIZE; i++) {
		for (let j = 0; j < BOARD_SIZE; j++) {
			if (!BOARD[i][j]?.queen) continue

			let poolCellCount = Math.floor(Math.random() * BOARD_SIZE) + 1

			generatePool(++currentIndex, i, j, poolCellCount)
		}
	}

	fillEmptyCells()

  drawBoard()

  startTimer()

  gameState = STATE_PLAYING
}

function restart() {
  closeModal()

  passedTime = 0
  document.getElementById("timer").innerHTML = getFormattedTime(passedTime)

  initGame()
}

function endGame(success) {
  if (!success) {
    restart()
    return
  }

  var modal = document.getElementById("success-modal")
  modal.style.display = "block"
  gameState = STATE_READY

  let record = localStorage.getItem("queens-record")
  if (!record || record > passedTime) {
    record = passedTime
    localStorage.setItem("queens-record", record)
  }

  document.getElementById("modal-timer").innerHTML = getFormattedTime(passedTime)
  document.getElementById("modal-timer-record").innerHTML = getFormattedTime(record)
}

function closeModal() {
  var modal = document.getElementById("success-modal")
  modal.style.display = "none"
}

window.addEventListener("load", function () {
  initGame()
})
