// --- Global Input State ---
const inputState = {
    left: false,
    right: false,
    actionA: false, // Q
    actionB: false, // W
    actionS: false, // E
    actionP: false  // R
};

// --- Keyboard Input Handling ---
function handleKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'a': inputState.left = true; break;
        case 'd': inputState.right = true; break;
        case 'q': inputState.actionA = true; break;
        case 'w': inputState.actionB = true; break;
        case 'e': inputState.actionS = true; break;
        case 'r': inputState.actionP = true; break;
    }
}

function handleKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case 'a': inputState.left = false; break;
        case 'd': inputState.right = false; break;
        case 'q': inputState.actionA = false; break;
        case 'w': inputState.actionB = false; break;
        case 'e': inputState.actionS = false; break;
        case 'r': inputState.actionP = false; break;
    }
}

// --- Mobile Touch Input Handling ---
/**
 * Sets the global inputState variable based on touch events.
 * @param {string} keyName - The input state key ('left', 'right', 'actionA', etc.)
 * @param {boolean} isPressed - true for touchstart, false for touchend.
 */
function setMobileInput(keyName, isPressed) {
    if (inputState.hasOwnProperty(keyName)) {
        inputState[keyName] = isPressed;
    }
}
