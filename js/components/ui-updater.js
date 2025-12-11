// --- DOM Elements ---
const playerHPBar = document.getElementById('player-hp-bar');
const playerEnergyText = document.getElementById('player-energy');
const botHPBar = document.getElementById('bot-hp-bar');
const botEnergyText = document.getElementById('bot-energy');
const gameMessage = document.getElementById('game-message');

// --- UI Update Functions ---

/**
 * Updates the HP and Energy bars/text in the UI.
 * @param {object} gameState - The global game state object.
 */
function updateUI(gameState) {
    // Player UI
    const playerHPPercent = (gameState.player.hp / 100) * 100;
    playerHPBar.style.width = `${playerHPPercent}%`;
    playerEnergyText.textContent = gameState.player.energy;

    // Bot UI
    const botHPPercent = (gameState.bot.hp / 100) * 100;
    botHPBar.style.width = `${botHPPercent}%`;
    botEnergyText.textContent = gameState.bot.energy;
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
