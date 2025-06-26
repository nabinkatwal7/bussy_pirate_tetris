

function createGrid(width, height) {
  const grid = [];
  while (height--) {
    grid.push(new Array(width).fill(0));
  }
  return grid;
}

function drawGrid(grid) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) {
        context.fillStyle = "#34495e";
        context.beginPath();
        context.arc(
          x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y * BLOCK_SIZE + BLOCK_SIZE / 2,
          BLOCK_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        context.fill();
        context.strokeStyle = "#2c3e50";
        context.stroke();
      } else if (grid[y][x] === 8) {
        context.fillStyle = "#f1c40f";
        context.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      } else {
        context.fillStyle = COLORS[grid[y][x]];
        context.beginPath();
        context.arc(
          x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y * BLOCK_SIZE + BLOCK_SIZE / 2,
          BLOCK_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        context.fill();
      }
    }
  }
}

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const nextCanvas = document.getElementById('nextCanvas');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

const grid = createGrid(GRID_WIDTH, GRID_HEIGHT);

const PIECES = [
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 2, 0],
    [2, 2, 2],
  ], // T
  [
    [3, 3, 0],
    [0, 3, 3],
  ], // S
  [
    [0, 4, 4],
    [4, 4, 0],
  ], // Z
  [[5, 5, 5, 5]], // I
  [
    [0, 0, 6],
    [6, 6, 6],
  ], // L
  [
    [7, 7, 7],
    [0, 0, 7],
  ], // J
];

const COLORS = [
  null,
  "#f1c40f", // O
  "#9b59b6", // T
  "#2ecc71", // S
  "#e74c3c", // Z
  "#3498db", // I
  "#e67e22", // L
  "#1abc9c", // J
];

const player = {
  pos: { x: 3, y: 0 },
  piece: PIECES[Math.floor(Math.random() * PIECES.length)],
  nextPiece: PIECES[Math.floor(Math.random() * PIECES.length)],
  score: 0,
};

function drawNextPiece() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawPiece(player.nextPiece, {x: 1, y: 1}, nextContext);
}

function updateScore() {
    scoreElement.innerText = player.score;
}

function createGrid(width, height) {
  const grid = [];
  while (height--) {
    grid.push(new Array(width).fill(0));
  }
  return grid;
}

function drawGrid(grid) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) {
        context.fillStyle = "#34495e";
        context.beginPath();
        context.arc(
          x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y * BLOCK_SIZE + BLOCK_SIZE / 2,
          BLOCK_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        context.fill();
        context.strokeStyle = "#2c3e50";
        context.stroke();
      } else if (grid[y][x] === 8) {
        context.fillStyle = "#f1c40f";
        context.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      } else {
        context.fillStyle = COLORS[grid[y][x]];
        context.beginPath();
        context.arc(
          x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y * BLOCK_SIZE + BLOCK_SIZE / 2,
          BLOCK_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        context.fill();
      }
    }
  }
}

function drawPiece(piece, offset, context = context) {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x] !== 0) {
        context.fillStyle = COLORS[piece[y][x]];
        context.beginPath();
        context.arc(
          (x + offset.x) * BLOCK_SIZE + BLOCK_SIZE / 2,
          (y + offset.y) * BLOCK_SIZE + BLOCK_SIZE / 2,
          BLOCK_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        context.fill();
      }
    }
  }
}

function gridSweep() {
  let rowCount = 1;
  outer: for (let y = grid.length - 1; y > 0; --y) {
    for (let x = 0; x < grid[y].length; ++x) {
      if (grid[y][x] === 0) {
        continue outer;
      }
    }

    const row = grid.splice(y, 1)[0].fill(8); // 8 is the banana color
    grid.unshift(row);
    setTimeout(() => {
      const newRow = grid.splice(0, 1)[0].fill(0);
      grid.unshift(newRow);
    }, 200);

    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
    updateScore();
    ws.send(JSON.stringify({ score: player.score }));
  }
}

function merge(grid, player) {
  player.piece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        grid[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
  gridSweep();
}

function collides(grid, player) {
  for (let y = 0; y < player.piece.length; y++) {
    for (let x = 0; x < player.piece[y].length; x++) {
      if (
        player.piece[y][x] !== 0 &&
        (grid[y + player.pos.y] && grid[y + player.pos.y][x + player.pos.x]) !==
          0
      ) {
        return true;
      }
    }
  }
  return false;
}

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

function playerDrop() {
  player.pos.y++;
  if (collides(grid, player)) {
    player.pos.y--;
    merge(grid, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerReset() {
  if (Math.random() < 0.1) {
    // 10% chance of a random failure
    if (Math.random() < 0.5) {
      // Random piece
      player.piece = PIECES[Math.floor(Math.random() * PIECES.length)];
      player.nextPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    } else {
      // Random grid shift
      const shiftAmount =
        Math.floor(Math.random() * (GRID_WIDTH / 2)) -
        Math.floor(GRID_WIDTH / 4);
      for (let y = 0; y < grid.length; y++) {
        const row = grid[y];
        if (shiftAmount > 0) {
          grid[y] = [
            ...row.slice(shiftAmount),
            ...new Array(shiftAmount).fill(0),
          ];
        } else {
          grid[y] = [
            ...new Array(-shiftAmount).fill(0),
            ...row.slice(0, row.length + shiftAmount),
          ];
        }
      }
      player.piece = PIECES[Math.floor(Math.random() * PIECES.length)];
      player.nextPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    }
  } else {
    player.piece = PIECES[Math.floor(Math.random() * PIECES.length)];
    player.nextPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
  }
  player.pos.y = 0;
  player.pos.x =
    Math.floor(GRID_WIDTH / 2) - Math.floor(player.piece[0].length / 2);
  if (collides(grid, player)) {
    // Game over
    grid.forEach((row) => row.fill(0));
  }
}

function gameLoop(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  drawGrid(grid);
  drawPiece(player.piece, player.pos);
  requestAnimationFrame(gameLoop);
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collides(grid, player)) {
    player.pos.x -= dir;
  }
}

function rotate(piece, dir) {
  for (let y = 0; y < piece.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [piece[x][y], piece[y][x]] = [piece[y][x], piece[x][y]];
    }
  }

  if (dir > 0) {
    piece.forEach((row) => row.reverse());
  } else {
    piece.reverse();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.piece, dir);
  while (collides(grid, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.piece[0].length) {
      rotate(player.piece, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 37) {
    // Left arrow
    playerMove(-1);
  } else if (event.keyCode === 39) {
    // Right arrow
    playerMove(1);
  } else if (event.keyCode === 40) {
    // Down arrow
    playerDrop();
  } else if (event.keyCode === 38) {
    // Up arrow
    playerRotate(1);
  }
});

const commentaryText = document.getElementById("commentary-text");

const bananabeardComments = [
  "Ahoy, matey! Clear those lines like a true pirate!",
  "Shiver me timbers! That's a fine move!",
  "Don't be a landlubber, clear those blocks!",
  "Harr harr! Another line sent to Davy Jones's Locker!",
  "Beware the kraken... and those falling blocks!",
  "A true pirate never gives up!",
  "More bananas for Captain Bananabeard!",
  "You're a natural, me hearty!",
  "Keep stackin' those blocks, arrr!",
  "The high seas await your triumph!",
];

function updateCommentary() {
  const randomIndex = Math.floor(Math.random() * bananabeardComments.length);
  commentaryText.innerText = bananabeardComments[randomIndex];
}

setInterval(updateCommentary, 5000); // Update every 5 seconds

console.log("Welcome to Bussy Pirate Tetris Extravaganza!");
drawNextPiece();
gameLoop();
