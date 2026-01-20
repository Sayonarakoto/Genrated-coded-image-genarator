/**
 * Standard AABB (Axis-Aligned Bounding Box) collision detection.
 * @param {object} boxA - The first box {x, y, w, h}
 * @param {object} boxB - The second box {x, y, w, h}
 * @returns {boolean} True if the boxes overlap.
 */
function checkCollision(boxA, boxB) {
    if (!boxA || !boxB) return false; // Guard against null or undefined boxes
    return (
        boxA.x < boxB.x + boxB.w &&
        boxA.x + boxA.w > boxB.x &&
        boxA.y < boxB.y + boxB.h &&
        boxA.y + boxA.h > boxB.y
    );
}