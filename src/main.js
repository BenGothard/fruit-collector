const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const instructionsEl = document.getElementById('instructions');

let running = false;
let fruitInterval;

const state = {
  score: 0,
  fruits: [],
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

const checkCollision = (fruit, basket) =>
  fruit.x > basket.x &&
  fruit.x < basket.x + basket.width &&
  fruit.y + fruit.radius > basket.y;

const handleKeyDown = e => {
  if (e.key === 'ArrowLeft') state.basket.dx = -state.basket.speed;
  if (e.key === 'ArrowRight') state.basket.dx = state.basket.speed;
};

const handleKeyUp = e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') state.basket.dx = 0;
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

const updateScore = () => {
  scoreEl.textContent = `Score: ${state.score}`;
};

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBasket();
  updateFruits();
  drawBasket();
  state.fruits.forEach(drawFruit);
  updateScore();
  if (running) requestAnimationFrame(gameLoop);
};

const startGame = () => {
  if (running) return;
  running = true;
  startBtn.style.display = 'none';
  instructionsEl.style.display = 'none';
  state.score = 0;
  state.fruits = [];
  createFruit();
  fruitInterval = setInterval(createFruit, 10000);
  gameLoop();
};

startBtn.addEventListener('click', startGame);


