// main.js
import { Renderer } from './renderer/Renderer';
import { BlochSphere } from './bloch_sphere/BlochSphere';
import {CHALLENGE_MODE_LEVELS} from "./challenge_mode/challenge_mode.js";

// Initialize the renderer which sets up the scene, camera, controls, and starts the animation loop
const renderer = new Renderer(window);

// Initialize the Bloch Sphere within the provided scene from Renderer
const blochSphere = new BlochSphere(renderer.scene);

// main.js (example usage)
document.getElementById('xGate').addEventListener('click', () => blochSphere.applyXGate());
document.getElementById('yGate').addEventListener('click', () => blochSphere.applyYGate());
document.getElementById('zGate').addEventListener('click', () => blochSphere.applyZGate());
document.getElementById('hGate').addEventListener('click', () => blochSphere.applyHadamardGate());
document.getElementById('reset').addEventListener('click', () => blochSphere.reset());
document.getElementById('dephasing').addEventListener('click', () => blochSphere.toggleDephasing());
document.getElementById('sGate').addEventListener('click', () => blochSphere.applySGate());
document.getElementById('tGate').addEventListener('click', () => blochSphere.applyTGate());
document.getElementById('sDaggerGate').addEventListener('click', () => blochSphere.applySGateInverse());
document.getElementById('tDaggerGate').addEventListener('click', () => blochSphere.applyTGateInverse());
// document.getElementById('challenge1').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.EASY));
// document.getElementById('challenge2').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.MEDIUM));
// document.getElementById('challenge3').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.HARD));



renderer.onWindowResize(); // Ensure the renderer size is set correctly

