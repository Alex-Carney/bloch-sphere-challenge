// main.js
import { Renderer } from './renderer/Renderer';
import { BlochSphere } from './bloch_sphere/BlochSphere';
import {CHALLENGE_MODE_LEVELS} from "./challenge_mode/challenge_mode.js";

// Initialize the renderer which sets up the scene, camera, controls, and starts the animation loop
const renderer = new Renderer(window);

// Initialize the Bloch Sphere within the provided scene from Renderer
const blochSphere = new BlochSphere(renderer);

let pValue = 0.3; // Default value for p in the channel functions

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
document.getElementById('challenge1').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.EASY));
document.getElementById('challenge2').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.MEDIUM));
document.getElementById('challenge3').addEventListener('click', () => blochSphere.startChallengeMode(CHALLENGE_MODE_LEVELS.HARD));
// channels
document.getElementById('phaseflip').addEventListener('click', () => blochSphere.applyPhaseFlipChannel(pValue));
document.getElementById('bitflip').addEventListener('click', () => blochSphere.applyBitFlipChannel(pValue));
document.getElementById('bitphaseflip').addEventListener('click', () => blochSphere.applyBitPhaseFlipChannel(pValue));
document.getElementById('deplorarize').addEventListener('click', () => blochSphere.applyDepolarizingChannel(pValue));
document.getElementById('ampdamp').addEventListener('click', () => blochSphere.applyGeneralizedAmplitudeDamping(pValue));

document.getElementById('t1').addEventListener('click', () => blochSphere.animateT1Process(5));
document.getElementById('t2').addEventListener('click', () => blochSphere.animateT2Process(5));
document.getElementById('t1t2').addEventListener('click', () => blochSphere.animateT1T2Process(5,1));

// event listener for slider
document.getElementById('pvalue').addEventListener('input', (event) => {
    pValue = parseFloat(event.target.value) / 100; // Convert range from 0-100 to 0-1
    document.getElementById('pvalueDisplay').textContent = pValue.toFixed(2); // Display the value
});
document.getElementById('driveFrequency').addEventListener('input', (event) => blochSphere.setDriveFrequency(event.target.value));

document.getElementById('dephasing').addEventListener('click', () => {
    document.getElementById('dephasing').textContent = document.getElementById('dephasing')
        .textContent === 'Switch to Lab Frame' ? 'Switch to Rotating Frame' : 'Switch to Lab Frame';
})

renderer.onWindowResize(); // Ensure the renderer size is set correctly

