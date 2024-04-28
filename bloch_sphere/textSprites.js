// textLabels.js
import * as THREE from 'three';

/**
 * Creates a text sprite for displaying labels in the scene - used to display |0⟩ and |1⟩ on the Bloch sphere.
 * @param {string} message - The text to display.
 * @param {number} fontsize - Font size of the text.
 * @param {string} color - Color of the text in CSS compatible format.
 * @param {THREE.Vector3} position - Position of the sprite in the scene.
 * @returns {THREE.Sprite} - The created text sprite.
 */
export function createTextSprite(message, fontsize, color, position) {
    // Create canvas for the text
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = `${fontsize}px Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // Update canvas texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Create sprite material using the texture
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(0.5, 0.25, 1.0);  // Adjust scale to make text bigger if necessary
    sprite.center.set(0.5, 0.5);  // Ensure text is centered

    return sprite;
}
