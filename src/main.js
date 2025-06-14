const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const instructionsEl = document.getElementById('instructions');
const gameOverEl = document.getElementById('gameOver');

let running = false;
let fruitInterval;
let bombInterval;

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
    speed: 2 + Math.random() * 3
  });
};

const resetFruit = fruit => {
  fruit.x = Math.random() * (canvas.width - fruit.radius * 2) + fruit.radius;
  fruit.y = -fruit.radius;
};

const createBomb = () => {
  const radius = 15;
  state.bombs.push({
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: -radius,
    radius,
    speed: 2 + Math.random() * 2
  });
};

const resetBomb = bomb => {
  bomb.x = Math.random() * (canvas.width - bomb.radius * 2) + bomb.radius;
  bomb.y = -bomb.radius;
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
    bomb.y += bomb.speed;
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
  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
  ctx.fill();
};

const drawBomb = bomb => {
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
  ctx.fill();
};

const updateScore = () => {
  scoreEl.textContent = `Score: ${state.score}`;
};

const endGame = () => {
  running = false;
  clearInterval(fruitInterval);
  clearInterval(bombInterval);
  gameOverEl.style.display = 'block';
  startBtn.style.display = 'inline-block';
  instructionsEl.style.display = 'block';
};

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBasket();
  updateFruits();
  updateBombs();
  drawBasket();
  state.fruits.forEach(drawFruit);
  state.bombs.forEach(drawBomb);
  updateScore();
  if (running) requestAnimationFrame(gameLoop);
};

const startGame = () => {
  if (running) return;
  running = true;
  startBtn.style.display = 'none';
  instructionsEl.style.display = 'none';
  gameOverEl.style.display = 'none';
  state.score = 0;
  state.fruits = [];
  state.bombs = [];
  createFruit();
  createBomb();
  fruitInterval = setInterval(createFruit, 10000);
  bombInterval = setInterval(createBomb, 7000);
  gameLoop();
};

startBtn.addEventListener('click', startGame);


