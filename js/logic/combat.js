// --- Combat Constants ---
const ATTACK_RANGE = 40; // How far the hitbox extends from the body
const ATTACK_DAMAGE = 10; // Base damage for a standard attack

/**
 * Creates and checks the attack hitbox for the given attacker.
 * This function is called when an attack action is initiated.
 * @param {object} attacker - The character state object initiating the attack.
 * @param {object} target - The character state object being targeted.
 */
function activateAttack(attacker, target) {
    // Prevent new attacks if one is already in progress
    if (attacker.isAttacking) return;

    // TODO: Add energy cost check here later based on class
    // if (attacker.energy < ATTACK_COST) return;

    console.log(`${attacker.class} attacks!`);

    // 1. Define the Attack Hitbox based on character position and direction
    const isFacingRight = (attacker.x < target.x);
    
    attacker.currentHitbox = {
        x: isFacingRight ? attacker.x + attacker.w - 5 : attacker.x - ATTACK_RANGE + 5,
        y: attacker.y + 20, // Position it vertically in the middle of the sprite
        w: ATTACK_RANGE,
        h: attacker.h - 40
    };

    // 2. Set the character's state to "attacking" for a duration
    attacker.isAttacking = true;
    attacker.animationTimer = 10; // The hitbox will be active for 10 frames

    // 3. Immediately check for a collision on this frame
    // The hurtbox is updated in the main game loop
    if (checkCollision(attacker.currentHitbox, target.hurtbox)) {
        console.log(`%cHIT CONFIRMED!`, 'color: #ff0000; font-weight: bold;');
        applyDamage(target, ATTACK_DAMAGE);
    }
}

/**
 * Applies damage to a character.
 * TODO: This will be expanded to check for blocking states.
 * @param {object} character - The character taking damage.
 * @param {number} damage - The amount of damage to apply.
 */
function applyDamage(character, damage) {
    character.hp -= damage;
    // We can add a "hit flash" effect here later by changing character state
}
