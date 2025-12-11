/**
 * Standard AABB (Axis-Aligned Bounding Box) collision detection.
 * @param {object} boxA - The first box {x, y, w, h}
 * @param {object} boxB - The second box {x, y, w, h}
 * @returns {boolean} True if the boxes overlap.
 */
function checkCollision(boxA, boxB) {
    // Safety check to ensure both boxes are valid objects before checking.
    if (!boxA || !boxB) {
        return false;
    }
    
    return (
        boxA.x < boxB.x + boxB.w &&
        boxA.x + boxA.w > boxB.x &&
        boxA.y < boxB.y + boxB.h &&
        boxA.y + boxA.h > boxB.y
    );
}