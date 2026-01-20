const CLASSES = {
    'Knight': {
        speed: 120,
        color: '#3498db', // Blue
        hp: 120,
        block: { duration: 90, mitigation: 1.0 }, // 1.5s, 100% block
        // Knight: High damage, stops enemy movement
        attack: { range: 45, damage: 20, startup: 5, active: 6, recovery: 12, push: 0, color: 'rgba(255,255,255,0.5)' },
        skill: { name: 'Bulwark Dash', cost: 2 }
    },
    'Assassin': {
        speed: 350,
        color: '#2ecc71', // Green
        hp: 80,
        block: { duration: 30, mitigation: 0.5 }, // 0.5s, 50% block
        // Assassin: Very fast, harder to block
        attack: { range: 65, damage: 12, startup: 3, active: 4, recovery: 6, push: 0, color: 'rgba(0,255,255,0.3)' },
        skill: { name: 'Shadow Strike', cost: 2 }
    },
    'Mage': {
        speed: 200,
        color: '#9b59b6', // Purple
        hp: 90,
        block: { duration: 60, mitigation: 0.7 }, // 1.0s, 70% block
        // Mage: Pushes enemies away
        attack: { range: 35, damage: 10, startup: 4, active: 5, recovery: 10, push: 20, color: 'rgba(255,0,255,0.3)' },
        skill: { name: 'Fireball', cost: 3 }
    }
};

/**
 * Applies damage to a target, considering if they are blocking.
 */
function applyDamage(target, damage, isSkill = false) {
    let finalDamage = damage;
    
    if (target.isBlocking && !isSkill) {
        // Attack (Q) vs Block (B) -> Block Wins (or mitigates)
        const mitigation = CLASSES[target.class].block.mitigation;
        finalDamage *= (1 - mitigation);
        console.log(`${target.class} blocked! Damage reduced to ${finalDamage.toFixed(1)}`);
    } else if (target.isBlocking && isSkill) {
        // Skill (E) vs Block (B) -> Skill Wins (Block Break)
        finalDamage = Math.floor(damage * 1.5); // Bonus damage
        target.isBlocking = false;
        target.blockTimer = 0;
        console.log("BLOCK BROKEN!");
    }
    target.hp -= finalDamage;
    if (target.hp < 0) target.hp = 0;
    target.gotHit = true; // Flag for UI/VFX
}

/**
 * Activates the primary attack (Q).
 */
function activateAttack(attacker, target) {
    if (attacker.isAttacking || attacker.isBlocking) return;

    const stats = CLASSES[attacker.class].attack;

    // Mage consumes energy on attack start
    if (attacker.class === 'Mage') {
        if (attacker.energy < 0.5) return;
        attacker.energy -= 0.5;
    }

    attacker.currentAttackStats = stats; // Store for hitbox update

    attacker.isAttacking = true;
    attacker.hasHit = false; // Reset hit flag
    
    // Initialize Timeline State
    attacker.attackPhase = 'startup';
    attacker.phaseTimer = stats.startup;

    // Assassin Dive Kick Logic
    if (attacker.class === 'Assassin' && !attacker.isGrounded) {
        attacker.velY = 10; // Dive down fast
    }
}

/**
 * Manages the attack timeline (Startup -> Active -> Recovery).
 * Called every frame.
 */
function updateCombatState(char) {
    if (!char.isAttacking) return;

    char.phaseTimer--;

    if (char.phaseTimer <= 0) {
        // State Machine Transition
        if (char.attackPhase === 'startup') {
            char.attackPhase = 'active';
            char.phaseTimer = char.currentAttackStats.active;
        } else if (char.attackPhase === 'active') {
            char.attackPhase = 'recovery';
            char.phaseTimer = char.currentAttackStats.recovery;
            char.currentHitbox = null; // Disable hitbox
        } else if (char.attackPhase === 'recovery') {
            char.isAttacking = false;
            char.attackPhase = null;
        }
    }
}

/**
 * Updates the hitbox position relative to the character.
 * Called every frame during an attack.
 */
function updateHitbox(attacker) {
    if (!attacker.isAttacking || !attacker.currentAttackStats || attacker.attackPhase !== 'active') return;

    const stats = attacker.currentAttackStats;
    
    attacker.currentHitbox = {
        x: attacker.x + (attacker.facingRight ? attacker.width : -stats.range),
        y: attacker.y + (attacker.height / 4), // Centered on torso
        w: stats.range,
        h: attacker.height / 2
    };
}

/**
 * Activates the block action (W).
 */
function activateBlock(attacker) {
    if (attacker.isAttacking || attacker.isBlocking || attacker.blockCooldown > 0) return;
    
    const stats = CLASSES[attacker.class].block;
    attacker.isBlocking = true;
    attacker.blockTimer = stats.duration;
    console.log(`${attacker.class} is guarding!`);
}

/**
 * Activates the special skill (E).
 */
function activateSkill(attacker, target, gameState) {
    const skillStats = CLASSES[attacker.class].skill;
    if (attacker.energy < skillStats.cost || attacker.isAttacking || attacker.isBlocking) return;

    attacker.energy -= skillStats.cost;
    const isFacingRight = (attacker.x < target.x);
    const dir = isFacingRight ? 1 : -1;

    console.log(`${attacker.class} used ${skillStats.name}!`);

    if (attacker.class === 'Knight') {
        // Bulwark Dash: Move forward quickly
        attacker.x += dir * 150; 
    } else if (attacker.class === 'Assassin') {
        // Shadow Strike: Teleport behind
        if (window.gsap) {
            gsap.to(attacker, { opacity: 0, duration: 0.1, onComplete: () => {
                attacker.x = target.x + (dir * -1 * 80); 
                gsap.to(attacker, { opacity: 1, duration: 0.1 });
            }});
        } else {
            attacker.x = target.x + (dir * -1 * 80); 
        }
    } else if (attacker.class === 'Mage') {
        // Fireball: Spawn projectile
        gameState.projectiles.push({
            x: attacker.x + (isFacingRight ? attacker.width : 0),
            y: attacker.y + attacker.height / 2 - 10,
            w: 20, h: 20,
            vx: dir * 400, // Velocity X
            damage: 35, // High damage skill
            owner: attacker.class
        });
    }
}

/**
 * Handles energy charging logic.
 * @param {object} char - The character charging.
 * @param {boolean} isHoldingR - Whether the charge key is held.
 */
function processCharge(char, isHoldingR) {
    if (isHoldingR && !char.isAttacking && !char.isBlocking) {
        char.isCharging = true;
        char.energy += 0.05; // Slowly fill energy per frame
        if (char.energy > 10) char.energy = 10;
        
        // Premium Effect: Character flashes while charging
        char.opacity = (Math.sin(Date.now() / 100) * 0.5) + 0.5;
    } else {
        char.isCharging = false;
        char.opacity = 1.0;
    }
}