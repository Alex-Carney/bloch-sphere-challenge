// sceneSetup.js
import * as THREE from 'three';

export const scene = new THREE.Scene();
// Camera setup
// In sceneSetup.js or your main camera setup
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(.1, .1, 3); // Adjust so we can see the north and south poles clearly
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene


export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);

// Function to add the renderer to the DOM
export function addRendererToDOM(domElementId) {
    const domElement = document.getElementById(domElementId);
    domElement.appendChild(renderer.domElement);
}
