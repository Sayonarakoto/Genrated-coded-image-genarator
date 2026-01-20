// --- DOM Elements ---
const playerHPBar = document.getElementById('player-hp-fill');
const playerGhostHPBar = document.getElementById('player-hp-ghost');
const playerEnergyBar = document.getElementById('player-energy-bar');
const playerStaminaBar = document.getElementById('player-stamina-bar');
const botHPBar = document.getElementById('bot-hp-fill');
const botGhostHPBar = document.getElementById('bot-hp-ghost');
const botEnergyBar = document.getElementById('bot-energy-bar');
const botStaminaBar = document.getElementById('bot-stamina-bar');
const gameMessage = document.getElementById('game-message');

// --- UI Update Functions ---

/**
 * Updates the HP and Energy bars/text in the UI.
 * @param {object} gameState - The global game state object.
 */
function updateUI(gameState) {
    // Player UI
    const playerPct = (gameState.player.hp / gameState.player.maxHp) * 100;
    playerHPBar.style.width = `${playerPct}%`;
    playerGhostHPBar.style.width = `${playerPct}%`; // CSS transition handles the delay
    
    if (gameState.player.gotHit && window.gsap) {
        gsap.to('.player-panel', { x: 5, yoyo: true, repeat: 5, duration: 0.05 });
        gameState.player.gotHit = false;
    }

    playerEnergyBar.value = Math.floor(gameState.player.energy);
    playerStaminaBar.value = Math.floor(gameState.player.stamina);

    // Bot UI
    const botPct = (gameState.bot.hp / gameState.bot.maxHp) * 100;
    botHPBar.style.width = `${botPct}%`;
    botGhostHPBar.style.width = `${botPct}%`; // CSS transition handles the delay
    
    if (gameState.bot.gotHit && window.gsap) {
        gsap.to('.bot-panel', { x: 5, yoyo: true, repeat: 5, duration: 0.05 });
        gameState.bot.gotHit = false;
    }

    botEnergyBar.value = Math.floor(gameState.bot.energy);
    botStaminaBar.value = Math.floor(gameState.bot.stamina);
}

/**
 * Displays a message in the center of the screen that fades out.
 * @param {string} message - The text to display.
 * @param {number} duration - How long the message stays visible (in ms).
 */
function showGameMessage(message, duration = 1500) {
    gameMessage.textContent = message;
    gameMessage.classList.add('visible');
    setTimeout(() => {
        gameMessage.classList.remove('visible');
    }, duration);
}
