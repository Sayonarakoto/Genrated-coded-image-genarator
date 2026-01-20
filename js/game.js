// --- Game Setup ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 960;
canvas.height = 540;

const GROUND_HEIGHT = 60;
const SPRITE_SIZE = 64;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const JUMP_COST = 25;
const RUN_COST = 15;
const REGEN_RATE = 10;

// --- Game State ---
const gameState = {
    player: {
        x: 100,
        y: canvas.height - GROUND_HEIGHT - SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        hp: 100,
        maxHp: 100,
        energy: 5,
        stamina: 100,
        maxStamina: 100,
        class: 'Knight', // Player is Knight
        velY: 0,
        facingRight: true,
        isGrounded: true,
        jumpCount: 0,
        jumpKeyReleased: true,
        isAttacking: false,
        attackPhase: null,
        phaseTimer: 0,
        gotHit: false,
        hasHit: false,
        isBlocking: false,
        blockTimer: 0,
        blockCooldown: 0,
        animationTimer: 0,
        hurtbox: { x: 0, y: 0, w: SPRITE_SIZE, h: SPRITE_SIZE },
        currentHitbox: null,
        comboIndex: 0,
        comboWindow: 0,
        currentAttackStats: null,
        prevPos: { x: 0, y: 0 }, // For Assassin Ghost Trail
        isCharging: false,
        opacity: 1.0
    },
    bot: {
        x: canvas.width - 100 - SPRITE_SIZE,
        y: canvas.height - GROUND_HEIGHT - SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        hp: 100,
        maxHp: 100,
        energy: 5,
        stamina: 100,
        maxStamina: 100,
        class: 'Assassin', // Bot is Assassin
        velY: 0,
        facingRight: false,
        isGrounded: true,
        jumpCount: 0,
        jumpKeyReleased: true,
        isAttacking: false,
        attackPhase: null,
        phaseTimer: 0,
        gotHit: false,
        hasHit: false,
        isBlocking: false,
        blockTimer: 0,
        blockCooldown: 0,
        animationTimer: 0,
        hurtbox: { x: 0, y: 0, w: SPRITE_SIZE, h: SPRITE_SIZE },
        currentHitbox: null,
        comboIndex: 0,
        comboWindow: 0,
        currentAttackStats: null,
        prevPos: { x: 0, y: 0 },
        isCharging: false,
        opacity: 1.0
    },
    projectiles: [], // New array for fireballs
    particles: [], // Visual effects array
    gameOver: false,
    message: 'BATTLE START'
};

// Initialize hurtbox positions
gameState.player.hurtbox.x = gameState.player.x;
gameState.player.hurtbox.y = gameState.player.y;
gameState.bot.hurtbox.x = gameState.bot.x;
gameState.bot.hurtbox.y = gameState.bot.y;


// --- Game Loop ---
let lastTime = 0;

function updateMovement(char, input, deltaTime) {
    let isConsuming = false;

    // --- 1. Horizontal Movement (A, D) ---
    const speed = CLASSES[char.class].speed;
    if ((input.left || input.right) && char.stamina > 0) {
        if (input.left) {
            char.x -= speed * deltaTime;
            char.facingRight = false;
        }
        if (input.right) {
            char.x += speed * deltaTime;
            char.facingRight = true;
        }
        char.stamina -= RUN_COST * deltaTime;
        isConsuming = true;
    }

    // --- 2. Vertical Movement (W) ---
    if (char.class === 'Mage') {
        // MAGE FLIGHT LOGIC
        if (input.up) {
            char.velY = -4; // Constant upward "float"
            // Spawn Particle Trail
            gameState.particles.push({
                x: char.x + char.width / 2 + (Math.random() * 20 - 10),
                y: char.y + char.height,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 2, // Fall down
                life: 1.0,
                size: Math.random() * 3 + 2,
                color: `rgba(155, 89, 219, ${Math.random()})` // Purple magic
            });
        } else {
            char.velY += (GRAVITY * 0.5); // Slower fall
        }
    } else {
        // STANDARD & DOUBLE JUMP LOGIC
        if (!input.up) char.jumpKeyReleased = true;

        if (input.up) {
            if (char.isGrounded && char.stamina >= JUMP_COST) {
                char.velY = JUMP_FORCE;
                char.isGrounded = false;
                char.jumpCount = 1;
                char.jumpKeyReleased = false;
                char.stamina -= JUMP_COST;
                isConsuming = true;
            } else if (char.class === 'Assassin' && char.jumpCount < 2 && char.jumpKeyReleased && char.stamina >= JUMP_COST) {
                char.velY = JUMP_FORCE;
                char.jumpCount++;
                char.jumpKeyReleased = false;
                char.stamina -= JUMP_COST;
                isConsuming = true;
            }
        }
        char.velY += GRAVITY;
    }

    // Apply Vertical Velocity
    char.y += char.velY;

    // Stamina Regen
    if (!isConsuming && char.stamina < char.maxStamina) {
        char.stamina += REGEN_RATE * deltaTime;
        if (char.stamina > char.maxStamina) char.stamina = char.maxStamina;
    }
    if (char.stamina < 0) char.stamina = 0;
}

function handleGroundCollision(char) {
    const groundY = canvas.height - GROUND_HEIGHT - char.height;
    if (char.y >= groundY) {
        // Knight Impact Dust (Visual logic placeholder)
        if (char.class === 'Knight' && char.velY > 5) {
             // Spawn dust particles here if needed
        }

        char.y = groundY;
        char.velY = 0;
        char.isGrounded = true;
        char.jumpCount = 0;
    }
}

function update(currentTime) {
    if (gameState.gameOver) return;

    const deltaTime = (currentTime - lastTime) / 1000 || 0; // time in seconds
    lastTime = currentTime;

    const pClass = CLASSES[gameState.player.class];
    const bClass = CLASSES[gameState.bot.class];

    // Store previous position for visual effects (Player)
    gameState.player.prevPos.x = gameState.player.x;
    gameState.player.prevPos.y = gameState.player.y;

    // --- Player Logic ---
    // Movement & Physics (Only if not blocking)
    if (!gameState.player.isBlocking) {
        updateMovement(gameState.player, inputState, deltaTime);
    }
    
    // Clamp Player to Screen
    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x > canvas.width - gameState.player.width) gameState.player.x = canvas.width - gameState.player.width;
    
    handleGroundCollision(gameState.player);

    // Actions
    // Mapped: Q->Attack, S->Block, E->Skill, R->Charge
    if (inputState.actionQ) activateAttack(gameState.player, gameState.bot);
    if (inputState.down) activateBlock(gameState.player); 
    if (inputState.actionE) activateSkill(gameState.player, gameState.bot, gameState);
    processCharge(gameState.player, inputState.actionR);

    // --- Bot Logic (Simple AI) ---
    // Bot Physics (Gravity)
    gameState.bot.velY += GRAVITY;
    gameState.bot.y += gameState.bot.velY;
    handleGroundCollision(gameState.bot);

    // Simple AI: Move towards player
    let botConsuming = false;
    const dist = gameState.player.x - gameState.bot.x;
    if (Math.abs(dist) > 60 && !gameState.bot.isBlocking && gameState.bot.stamina > 0) {
        const dir = dist > 0 ? 1 : -1;
        gameState.bot.x += dir * bClass.speed * 0.5 * deltaTime; // Move slower than max
        gameState.bot.facingRight = dir > 0; // Update facing direction
        gameState.bot.stamina -= 10 * deltaTime; // Bot consumes less stamina
        botConsuming = true;
    } else {
        // Face player even if not moving
        gameState.bot.facingRight = dist > 0;
    }

    if (!botConsuming && gameState.bot.stamina < gameState.bot.maxStamina) {
        gameState.bot.stamina += 15 * deltaTime;
    }

    // Attack if close
    if (Math.abs(dist) < 60) {
        activateAttack(gameState.bot, gameState.player);
    }
    
    // Randomly use Skill if energy is high
    if (gameState.bot.energy >= 3 && Math.random() < 0.01) {
        activateSkill(gameState.bot, gameState.player, gameState);
    }
    // Bot passive recharge
    if (gameState.bot.energy < 10) gameState.bot.energy += 0.01;


    // --- Shared Updates (Hurtbox & Timers) ---
    [gameState.player, gameState.bot].forEach(char => {
        // Update hurtbox position
        char.hurtbox.x = char.x;
        char.hurtbox.y = char.y;

        // Block Timer
        if (char.isBlocking) {
            char.blockTimer--;
            if (char.blockTimer <= 0) {
                char.isBlocking = false;
                char.blockCooldown = 30;
            }
        }
        // Block Cooldown
        if (char.blockCooldown > 0) {
            char.blockCooldown--;
        }
        // Attack Timer
        updateCombatState(char);

        // Combo Window
        if (!char.isAttacking && char.comboWindow > 0) {
            char.comboWindow--;
            if (char.comboWindow <= 0) {
                char.comboIndex = 0; // Reset combo
            }
        }
    });

    // --- Combat & Collision Loop ---
    [gameState.player, gameState.bot].forEach(attacker => {
        const target = attacker === gameState.player ? gameState.bot : gameState.player;
        
        if (attacker.isAttacking && attacker.attackPhase === 'active') {
            updateHitbox(attacker); // Dynamic Hitbox Update
            
            // Check Collision if we haven't hit yet
            if (!attacker.hasHit && checkCollision(attacker.currentHitbox, target.hurtbox)) {
                attacker.hasHit = true; // Prevent multi-hits per attack
                const stats = attacker.currentAttackStats;
                applyDamage(target, stats.damage);
                
                // Energy Reward on Hit
                if (attacker.class === 'Knight') attacker.energy += 1;
                if (attacker.class === 'Assassin') attacker.energy += 0.5;
                if (attacker.energy > 10) attacker.energy = 10;

                // Knight Heavy Dunk (Aerial Smash)
                if (attacker.class === 'Knight' && !attacker.isGrounded) {
                    target.velY = 15; // Smash opponent to ground
                }
            }
        }
    });

    // --- Projectile Logic ---
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        let p = gameState.projectiles[i];
        p.x += p.vx * deltaTime;

        // Check Collision
        let target = (p.owner === gameState.player.class) ? gameState.bot : gameState.player;
        if (checkCollision(p, target.hurtbox)) {
            applyDamage(target, p.damage, true); // true indicates it's a skill (projectile)
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Remove if out of bounds
        if (p.x < -50 || p.x > canvas.width + 50) {
            gameState.projectiles.splice(i, 1);
        }
    }

    // --- Particle Logic ---
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        let p = gameState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05; // Fade out
        if (p.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }

    // --- Drawing ---
    draw();

    // --- UI Update ---
    updateUI(gameState);

    requestAnimationFrame(update);
}

function drawShadow(char) {
    const groundY = canvas.height - GROUND_HEIGHT;
    const distanceToGround = groundY - (char.y + char.height);
    
    // Shadow gets smaller and lighter as the character goes higher
    const shadowWidth = Math.max(10, char.width - (distanceToGround * 0.2));
    const opacity = Math.max(0.1, 0.5 - (distanceToGround * 0.002));

    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.beginPath();
    ctx.ellipse(
        char.x + char.width / 2, 
        groundY, 
        shadowWidth / 2, 
        10, 
        0, 0, Math.PI * 2
    );
    ctx.fill();
}

function drawBackground() {
    // Calculate dynamic camera position based on players
    // The camera follows the midpoint of the action
    const p1 = gameState.player;
    const p2 = gameState.bot;
    const midX = (p1.x + p1.width/2 + p2.x + p2.width/2) / 2;
    // Camera pan range: +/- relative to center
    const viewX = (midX - (canvas.width / 2)); 

    // 1. SKY (Layer 0 - Static)
    ctx.fillStyle = '#1a1a2e'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Moon (Layer 1 - Very Slow 0.05x)
    ctx.fillStyle = '#fdfd96';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fdfd96';
    ctx.beginPath();
    ctx.arc(800 - (viewX * 0.05), 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset

    // 2. CITY SKYLINE (Layer 2 - Slow 0.2x)
    ctx.fillStyle = '#16213e';
    const buildings = [
        { x: 100, w: 60, h: 200 }, { x: 200, w: 100, h: 300 }, 
        { x: 450, w: 80, h: 250 }, { x: 700, w: 120, h: 180 },
        { x: 900, w: 70, h: 220 }, { x: -50, w: 90, h: 280 },
        { x: 1100, w: 80, h: 240 }
    ];
    buildings.forEach(b => {
        ctx.fillRect(b.x - (viewX * 0.2), canvas.height - GROUND_HEIGHT - b.h + 20, b.w, b.h);
    });

    // 3. TREES/PARK (Layer 3 - Mid 0.5x)
    ctx.fillStyle = '#243b55';
    const trees = [
        { x: 50, h: 100 }, { x: 350, h: 140 }, 
        { x: 650, h: 120 }, { x: 950, h: 150 },
        { x: -100, h: 130 }, { x: 1200, h: 110 }
    ];
    trees.forEach(t => {
        const rx = t.x - (viewX * 0.5);
        const ry = canvas.height - GROUND_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + 30, ry - t.h);
        ctx.lineTo(rx + 60, ry);
        ctx.fill();
    });

    // 4. GROUND (Layer 4 - Front 1.0x - Fixed)
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // "The Lean" Effect
    if (!gameState.player.isBlocking) {
        const centerX = gameState.player.x + gameState.player.width / 2;
        const centerY = gameState.player.y + gameState.player.height; // Pivot at feet
        ctx.translate(centerX, centerY);
        if (inputState.right) ctx.rotate(5 * Math.PI / 180);
        if (inputState.left) ctx.rotate(-5 * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
    }

    // Visual Cues for Movement
    if (gameState.player.class === 'Assassin' && !gameState.player.isGrounded) {
        // Ghost Trail
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = CLASSES[gameState.player.class].color;
        ctx.fillRect(gameState.player.prevPos.x, gameState.player.prevPos.y, gameState.player.width, gameState.player.height);
        ctx.globalAlpha = 1.0;
    } else if (gameState.player.class === 'Mage' && inputState.up) {
        // Mana Aura
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gameState.player.x + gameState.player.width/2, gameState.player.y + gameState.player.height, 20 + Math.sin(Date.now()/100)*5, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Apply Opacity (for charging effect)
    ctx.globalAlpha = gameState.player.opacity;
    ctx.fillStyle = CLASSES[gameState.player.class].color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    ctx.globalAlpha = 1.0; // Reset
    
    if (gameState.player.isBlocking) {
        ctx.strokeStyle = '#00ffff'; // Electric blue shield color
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(gameState.player.x + gameState.player.width/2, gameState.player.y + gameState.player.height/2, 45, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
    
    // Draw Bot
    ctx.fillStyle = CLASSES[gameState.bot.class].color;
    ctx.fillRect(gameState.bot.x, gameState.bot.y, gameState.bot.width, gameState.bot.height);
    if (gameState.bot.isBlocking) {
        ctx.strokeStyle = '#ff0055'; // Red shield for bot
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(gameState.bot.x + gameState.bot.width/2, gameState.bot.y + gameState.bot.height/2, 45, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw Projectiles
    ctx.fillStyle = '#ffaa00';
    gameState.projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Particles
    gameState.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0; // Reset alpha

    // Draw Attack VFX (Combos)
    [gameState.player, gameState.bot].forEach(char => {
        if (char.isAttacking && char.attackPhase === 'active' && char.currentHitbox && char.currentAttackStats) {
            const hb = char.currentHitbox;
            const color = char.currentAttackStats.color || 'white';
            
            ctx.fillStyle = color;
            // ctx.globalAlpha = 0.6; // Color already has alpha
            ctx.fillRect(hb.x, hb.y, hb.w, hb.h);
        }
    });
}

// --- Dynamic Scaling ---
function resizeGame() {
    const container = document.getElementById('game-container');
    const canvas = document.getElementById('game-canvas');
    
    // Calculate ratios
    const gameRatio = canvas.width / canvas.height;
    const windowRatio = window.innerWidth / window.innerHeight;

    if (windowRatio < gameRatio) {
        container.style.width = '100vw';
        container.style.height = (100 / gameRatio) + 'vw';
    } else {
        container.style.width = (100 * gameRatio) + 'vh';
        container.style.height = '100vh';
    }
}
window.addEventListener('resize', resizeGame);
resizeGame(); // Initial call

// --- Start Game ---
if (typeof showMessage === 'function') {
    showMessage(gameState.message, 2000);
}
requestAnimationFrame(update);