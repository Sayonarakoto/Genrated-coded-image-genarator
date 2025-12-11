// --- Game Configuration ---
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const SPRITE_SIZE = 64;
const GROUND_HEIGHT = 100;
const CHARACTER_SPEED = 250; // Pixels per second
const DEBUG_MODE = true; // Set to true to see hitboxes and hurtboxes

// --- Background Constants ---
const SCROLL_SPEED = 0.5;
let backgroundScrollX = 0;
const SKY_COLOR = '#483d8b';
const GROUND_COLOR = '#3b3e42';
const COBBLE_LINE_COLOR = '#2e3034';
const LAMP_LIGHT_COLOR = '#ffcc00';

// --- Global State ---
let gameState = {
    player: {
        x: 150,
        y: CANVAS_HEIGHT - GROUND_HEIGHT - SPRITE_SIZE,
        w: SPRITE_SIZE,
        h: SPRITE_SIZE,
        hp: 100,
        energy: 5,
        class: 'Knight',
        hurtbox: { x: 0, y: 0, w: 0, h: 0 },
        currentHitbox: null,
        isAttacking: false,
        animationTimer: 0
    },
    bot: {
        x: CANVAS_WIDTH - 150 - SPRITE_SIZE,
        y: CANVAS_HEIGHT - GROUND_HEIGHT - SPRITE_SIZE,
        w: SPRITE_SIZE,
        h: SPRITE_SIZE,
        hp: 100,
        energy: 5,
        class: 'Mage',
        direction: -1,
        hurtbox: { x: 0, y: 0, w: 0, h: 0 },
        currentHitbox: null,
        isAttacking: false,
        animationTimer: 0
    }
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
    // 1. Update Hurtbox Positions
    gameState.player.hurtbox = { x: gameState.player.x, y: gameState.player.y, w: gameState.player.w, h: gameState.player.h };
    gameState.bot.hurtbox = { x: gameState.bot.x, y: gameState.bot.y, w: gameState.bot.w, h: gameState.bot.h };

    // 2. Handle Input and Actions
    // Player Attack
    if (inputState.actionA && !gameState.player.isAttacking) {
        activateAttack(gameState.player, gameState.bot);
    }

    // 3. Update Timers (Hitbox Decay)
    if (gameState.player.isAttacking) {
        gameState.player.animationTimer--;
        if (gameState.player.animationTimer <= 0) {
            gameState.player.isAttacking = false;
            gameState.player.currentHitbox = null;
        }
    }
    if (gameState.bot.isAttacking) {
        gameState.bot.animationTimer--;
        if (gameState.bot.animationTimer <= 0) {
            gameState.bot.isAttacking = false;
            gameState.bot.currentHitbox = null;
        }
    }

    // 4. Process Movement
    // Player
    let newPlayerX = gameState.player.x;
    if (inputState.left) newPlayerX -= CHARACTER_SPEED * deltaTime;
    if (inputState.right) newPlayerX += CHARACTER_SPEED * deltaTime;
    const MIN_X = 0;
    const MAX_X = CANVAS_WIDTH / 2 - SPRITE_SIZE;
    gameState.player.x = Math.max(MIN_X, Math.min(MAX_X, newPlayerX));
    // Bot
    const BOT_PACE_SPEED = 75;
    const BOT_MIN_X = CANVAS_WIDTH / 2;
    const BOT_MAX_X = CANVAS_WIDTH - SPRITE_SIZE;
    gameState.bot.x += BOT_PACE_SPEED * gameState.bot.direction * deltaTime;
    if (gameState.bot.x <= BOT_MIN_X || gameState.bot.x >= BOT_MAX_X) {
        gameState.bot.direction *= -1;
    }
    
    // 5. Background Scrolling
    backgroundScrollX = (backgroundScrollX + SCROLL_SPEED) % GROUND_HEIGHT;

    // 6. Update UI
    updateUI(gameState);
}

// --- Drawing Function ---
function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Background ---
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    skyGradient.addColorStop(0, '#2c2a4a');
    skyGradient.addColorStop(1, '#504a88');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#444';
    ctx.fillRect(CANVAS_WIDTH - 200, CANVAS_HEIGHT - GROUND_HEIGHT - 30, 100, 20);
    ctx.fillStyle = '#666';
    ctx.fillRect(150, 0, 10, CANVAS_HEIGHT - GROUND_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 160, 0, 10, CANVAS_HEIGHT - GROUND_HEIGHT);
    const lampGlowL = ctx.createRadialGradient(155, 75, 5, 155, 75, 40);
    lampGlowL.addColorStop(0, 'rgba(255, 204, 0, 0.7)');
    lampGlowL.addColorStop(1, 'rgba(255, 204, 0, 0)');
    ctx.fillStyle = lampGlowL;
    ctx.fillRect(115, 35, 80, 80);
    const lampGlowR = ctx.createRadialGradient(CANVAS_WIDTH - 155, 75, 5, CANVAS_WIDTH - 155, 75, 40);
    lampGlowR.addColorStop(0, 'rgba(255, 204, 0, 0.7)');
    lampGlowR.addColorStop(1, 'rgba(255, 204, 0, 0)');
    ctx.fillStyle = lampGlowR;
    ctx.fillRect(CANVAS_WIDTH - 195, 35, 80, 80);
    ctx.fillStyle = LAMP_LIGHT_COLOR;
    ctx.fillRect(140, 60, 30, 30);
    ctx.fillRect(CANVAS_WIDTH - 170, 60, 30, 30);

    // --- Scrolling Ground ---
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

    // --- Characters ---
    ctx.fillStyle = '#007bff';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.w, gameState.player.h);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(gameState.bot.x, gameState.bot.y, gameState.bot.w, gameState.bot.h);

    // --- Debug Drawing ---
    if (DEBUG_MODE) {
        // Player Hurtbox
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(gameState.player.hurtbox.x, gameState.player.hurtbox.y, gameState.player.hurtbox.w, gameState.player.hurtbox.h);
        // Bot Hurtbox
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(gameState.bot.hurtbox.x, gameState.bot.hurtbox.y, gameState.bot.hurtbox.w, gameState.bot.hurtbox.h);
        // Player Hitbox
        if (gameState.player.currentHitbox) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(gameState.player.currentHitbox.x, gameState.player.currentHitbox.y, gameState.player.currentHitbox.w, gameState.player.currentHitbox.h);
        }
        // Bot Hitbox
        if (gameState.bot.currentHitbox) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(gameState.bot.currentHitbox.x, gameState.bot.currentHitbox.y, gameState.bot.currentHitbox.w, gameState.bot.currentHitbox.h);
        }
    }
}

// --- Initialization ---
window.onload = () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    console.log("Game starting.");
    showGameMessage("FIGHT!", 1000);
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};
