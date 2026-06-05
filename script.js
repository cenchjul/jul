// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let lastMoveTime = 0;

// Load high score
let highScore = localStorage.getItem('snakeHighScore') || 0;
document.getElementById('highScore').textContent = highScore;

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

document.addEventListener('keydown', handleKeyPress);

// Generate random food position
function generateFood() {
    let newFood;
    let foodOnSnake = true;
    
    while (foodOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        foodOnSnake = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    return newFood;
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('startBtn').disabled = true;
        gameLoop();
    }
}

// Toggle pause
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

// Reset game
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameRunning = false;
    gamePaused = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('gameOver').classList.add('hidden');
    draw();
}

// Main game loop
function gameLoop() {
    const now = Date.now();
    
    if (now - lastMoveTime > gameSpeed) {
        if (!gamePaused) {
            update();
            lastMoveTime = now;
        }
    }
    
    draw();
    
    if (gameRunning && !gamePaused) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game state
function update() {
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: (head.x + direction.x + tileCount) % tileCount,
        y: (head.y + direction.y + tileCount) % tileCount
    };
    
    // Check collision with self
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = generateFood();
        
        // Increase difficulty
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }
    } else {
        // Remove tail if food not eaten
        snake.pop();
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    ctx.shadowBlur = 0;
    
    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

// End game
function endGame() {
    gameRunning = false;
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('startBtn').disabled = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Initial draw
draw();
