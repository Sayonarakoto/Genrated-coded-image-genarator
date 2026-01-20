// Global Input State
window.inputState = {
    left: false,   // A
    right: false,  // D
    up: false,     // W (Jump/Fly)
    down: false,   // S (Block)
    actionQ: false, // Attack
    actionE: false, // Skill
    actionR: false  // Charge
};

// Helper for mobile controls (optional if using inline JS)
window.setMobileInput = function(key, value) {
    if (window.inputState.hasOwnProperty(key)) {
        window.inputState[key] = value;
    }
};

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a') inputState.left = true;
    if (key === 'd') inputState.right = true;
    if (key === 'w') inputState.up = true;
    if (key === 's') inputState.down = true;
    if (key === 'q') inputState.actionQ = true;
    if (key === 'e') inputState.actionE = true;
    if (key === 'r') inputState.actionR = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a') inputState.left = false;
    if (key === 'd') inputState.right = false;
    if (key === 'w') inputState.up = false;
    if (key === 's') inputState.down = false;
    if (key === 'q') inputState.actionQ = false;
    if (key === 'e') inputState.actionE = false;
    if (key === 'r') inputState.actionR = false;
});