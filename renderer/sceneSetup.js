// sceneSetup.js
import * as THREE from 'three';

export const scene = new THREE.Scene();
// Camera setup
// In sceneSetup.js or your main camera setup
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(.2, .33, 2.2); // Adjust so we can see the north and south poles clearly
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene


export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);

// Function to add the renderer to the DOM
// In sceneSetup.js or a similar file
export function addRendererToDOM(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.appendChild(renderer.domElement);
    } else {
        console.error(`Element with ID '${elementId}' not found.`);
    }
}

