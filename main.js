// main.js
import { Renderer } from './renderer/Renderer';
import { BlochSphere } from './bloch_sphere/BlochSphere';

// Initialize the renderer which sets up the scene, camera, controls, and starts the animation loop
const renderer = new Renderer();

// Initialize the Bloch Sphere within the provided scene from Renderer
const blochSphere = new BlochSphere(renderer.scene);
