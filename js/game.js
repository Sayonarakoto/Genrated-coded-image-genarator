// --- Game Configuration ---
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const SPRITE_SIZE = 64;
const GROUND_HEIGHT = 100;
const CHARACTER_SPEED = 250; // Pixels per second

// --- Background Constants ---
const SCROLL_SPEED = 0.5;     // Speed of the ground scroll (per frame)
let backgroundScrollX = 0;    // Tracks the current scroll offset

// Colors for the Evening Park Theme
const SKY_COLOR = '#483d8b';  // Deep Indigo / Twilight Sky
const GROUND_COLOR = '#3b3e42'; // Dark Gray/Asphalt for Cobblestone base
const COBBLE_LINE_COLOR = '#2e3034'; // Darker color for scrolling lines
const LAMP_LIGHT_COLOR = '#ffcc00'; // Warm yellow light

// --- Global State ---
let gameState = {
    player: { x: 150, y: CANVAS_HEIGHT - GROUND_HEIGHT - SPRITE_SIZE, hp: 100, energy: 5 },
    bot: { x: CANVAS_WIDTH - 150 - SPRITE_SIZE, y: CANVAS_HEIGHT - GROUND_HEIGHT - SPRITE_SIZE, hp: 100, energy: 5, direction: -1 }
};

// --- Canvas Setup ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// --- Core Game Loop ---
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

// --- Update Function ---
function update(deltaTime) {
    // 1. Update Scrolling Position
    backgroundScrollX = (backgroundScrollX + SCROLL_SPEED) % GROUND_HEIGHT;

    // 2. Process Player Movement
    let newPlayerX = gameState.player.x;
    if (inputState.left) {
        newPlayerX -= CHARACTER_SPEED * deltaTime;
    }
    if (inputState.right) {
        newPlayerX += CHARACTER_SPEED * deltaTime;
    }

    const MIN_X = 0;
    const MAX_X = CANVAS_WIDTH / 2 - SPRITE_SIZE;
    gameState.player.x = Math.max(MIN_X, Math.min(MAX_X, newPlayerX));

    // 3. Bot Movement (Simple Pacing AI)
    const BOT_PACE_SPEED = 75;
    const BOT_MIN_X = CANVAS_WIDTH / 2;
    const BOT_MAX_X = CANVAS_WIDTH - SPRITE_SIZE;

    gameState.bot.x += BOT_PACE_SPEED * gameState.bot.direction * deltaTime;
    if (gameState.bot.x <= BOT_MIN_X || gameState.bot.x >= BOT_MAX_X) {
        gameState.bot.direction *= -1;
    }
    
    // 4. Process Actions (To be implemented)
    // ...

    // 5. Update UI
    updateUI(gameState);
}

// --- Drawing Function ---
function draw() {
    // 1. Clear the canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- A. STATIC LAYER: Draw Sky and Environment (No scroll offset) ---
    
    // Draw the Static Twilight Sky
    ctx.fillStyle = SKY_COLOR; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); 

    // Draw Static Bench (On the right)
    ctx.fillStyle = '#444'; // Bench color
    ctx.fillRect(CANVAS_WIDTH - 200, CANVAS_HEIGHT - GROUND_HEIGHT - 30, 100, 20);

    // Draw Static Streetlights 
    ctx.fillStyle = '#666'; // Lamp post color
    ctx.fillRect(150, 0, 10, CANVAS_HEIGHT - GROUND_HEIGHT); // Left pole
    ctx.fillRect(CANVAS_WIDTH - 160, 0, 10, CANVAS_HEIGHT - GROUND_HEIGHT); // Right pole
    
    // Draw Lamp Light (Static light source)
    ctx.fillStyle = LAMP_LIGHT_COLOR; 
    ctx.fillRect(140, 60, 30, 30);
    ctx.fillRect(CANVAS_WIDTH - 170, 60, 30, 30);

    // --- B. SCROLLING LAYER: Draw Ground (Use backgroundScrollX offset) ---
    
    ctx.fillStyle = GROUND_COLOR;
    const groundTileWidth = GROUND_HEIGHT; 

    for (let i = -1; i * groundTileWidth < CANVAS_WIDTH + groundTileWidth; i++) {
        let xPos = (i * groundTileWidth) - backgroundScrollX;
        ctx.fillRect(xPos, CANVAS_HEIGHT - GROUND_HEIGHT, groundTileWidth, GROUND_HEIGHT);
        ctx.strokeStyle = COBBLE_LINE_COLOR; 
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xPos, CANVAS_HEIGHT - GROUND_HEIGHT);
        ctx.lineTo(xPos, CANVAS_HEIGHT);
        ctx.stroke();
    }

    // --- C. CHARACTER DRAWING (Drawn over the background) ---
    ctx.fillStyle = '#007bff'; // Player
    ctx.fillRect(gameState.player.x, gameState.player.y, SPRITE_SIZE, SPRITE_SIZE);
    ctx.fillStyle = '#ff0000'; // Bot
    ctx.fillRect(gameState.bot.x, gameState.bot.y, SPRITE_SIZE, SPRITE_SIZE);
}

// --- Initialization ---
window.onload = () => {
    // Setup Listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start Game
    console.log("Game starting.");
    showGameMessage("FIGHT!", 1000);
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};