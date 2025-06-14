const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const instructionsEl = document.getElementById('instructions');
const gameOverEl = document.getElementById('gameOver');

let running = false;
let paused = false;
let fruitInterval;
let bombInterval;
let difficultyInterval;
let difficulty = 1;
let bombSpawnTime = 4000;
const fruitEmojis = ['🍎', '🍌', '🍓', '🍇', '🍉', '🍊'];

const state = {
  score: 0,
  fruits: [],
  bombs: [],
  basket: { width: 80, height: 20, x: 0, y: 0, speed: 7, dx: 0 }
};

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  state.basket.y = canvas.height - state.basket.height - 10;
};
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const createFruit = () => {
  const radius = 15;
  state.fruits.push({
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: -radius,
    radius,
    speed: 4 + Math.random() * 3,
    emoji: fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)]
  });
};

const resetFruit = fruit => {
  fruit.x = Math.random() * (canvas.width - fruit.radius * 2) + fruit.radius;
  fruit.y = -fruit.radius;
  fruit.emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
};

const createBomb = () => {
  const radius = 15;
  state.bombs.push({
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: -radius,
    radius,
    speed: (4 + Math.random() * 2) * difficulty,
    emoji: '💣'
  });
};

const resetBomb = bomb => {
  bomb.x = Math.random() * (canvas.width - bomb.radius * 2) + bomb.radius;
  bomb.y = -bomb.radius;
  bomb.emoji = '💣';
};

const checkCollision = (fruit, basket) =>
  fruit.x > basket.x &&
  fruit.x < basket.x + basket.width &&
  fruit.y + fruit.radius > basket.y;

const handleKeyDown = e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')
    state.basket.dx = -state.basket.speed;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
    state.basket.dx = state.basket.speed;
};

const handleKeyUp = e => {
  if (
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'a' ||
    e.key === 'A' ||
    e.key === 'd' ||
    e.key === 'D'
  )
    state.basket.dx = 0;
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

const updateBasket = () => {
  state.basket.x += state.basket.dx;
  state.basket.x = Math.max(
    0,
    Math.min(canvas.width - state.basket.width, state.basket.x)
  );
};

const updateFruits = () => {
  state.fruits.forEach(fruit => {
    fruit.y += fruit.speed;
    if (checkCollision(fruit, state.basket)) {
      state.score += 1;
      resetFruit(fruit);
    } else if (fruit.y - fruit.radius > canvas.height) {
      resetFruit(fruit);
    }
  });
};

const updateBombs = () => {
  state.bombs.forEach(bomb => {
    bomb.y += bomb.speed * difficulty;
    if (checkCollision(bomb, state.basket)) {
      endGame();
    } else if (bomb.y - bomb.radius > canvas.height) {
      resetBomb(bomb);
    }
  });
};

const drawBasket = () => {
  ctx.fillStyle = 'brown';
  ctx.fillRect(
    state.basket.x,
    state.basket.y,
    state.basket.width,
    state.basket.height
  );
};

const drawFruit = fruit => {
  ctx.font = `${fruit.radius * 2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fruit.emoji, fruit.x, fruit.y);
};

const drawBomb = bomb => {
  ctx.font = `${bomb.radius * 2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bomb.emoji, bomb.x, bomb.y);
};

const updateScore = () => {
  scoreEl.textContent = `Score: ${state.score}`;
};

const increaseDifficulty = () => {
  difficulty += 0.1;
  if (bombSpawnTime > 2000) {
    bombSpawnTime -= 500;
    clearInterval(bombInterval);
    bombInterval = setInterval(createBomb, bombSpawnTime);
  }
  createBomb();
};

const endGame = () => {
  running = false;
  paused = false;
  clearInterval(fruitInterval);
  clearInterval(bombInterval);
  clearInterval(difficultyInterval);
  gameOverEl.style.display = 'block';
  startBtn.style.display = 'inline-block';
  pauseBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  instructionsEl.style.display = 'block';
};

const gameLoop = () => {
  if (paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBasket();
  updateFruits();
  updateBombs();
  drawBasket();
  state.fruits.forEach(drawFruit);
  state.bombs.forEach(drawBomb);
  updateScore();
  if (running && !paused) requestAnimationFrame(gameLoop);
};

const pauseGame = () => {
  if (!running) return;
  if (!paused) {
    paused = true;
    pauseBtn.textContent = 'Resume';
    clearInterval(fruitInterval);
    clearInterval(bombInterval);
    clearInterval(difficultyInterval);
  } else {
    paused = false;
    pauseBtn.textContent = 'Pause';
    fruitInterval = setInterval(createFruit, 5000);
    bombInterval = setInterval(createBomb, bombSpawnTime);
    difficultyInterval = setInterval(increaseDifficulty, 3000);
    requestAnimationFrame(gameLoop);
  }
};

const restartGame = () => {
  if (!running) return startGame();
  running = false;
  clearInterval(fruitInterval);
  clearInterval(bombInterval);
  clearInterval(difficultyInterval);
  startGame();
};

const startGame = () => {
  if (running) return;
  running = true;
  paused = false;
  startBtn.style.display = 'none';
  pauseBtn.style.display = 'inline-block';
  restartBtn.style.display = 'inline-block';
  instructionsEl.style.display = 'none';
  gameOverEl.style.display = 'none';
  state.score = 0;
  state.fruits = [];
  state.bombs = [];
  difficulty = 1;
  bombSpawnTime = 4000;
  createFruit();
  createBomb();
  fruitInterval = setInterval(createFruit, 5000);
  bombInterval = setInterval(createBomb, bombSpawnTime);
  difficultyInterval = setInterval(increaseDifficulty, 3000);
  gameLoop();
};

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);


