// BlochSphere.js
import * as THREE from 'three';
import {
    addTextLabels,
    createArrow,
    createAxes,
    createBasicSphereGeometry,
    createEquator,
    createSphere
} from './objects';
import * as TWEEN from '@tweenjs/tween.js'
import {addCoinToState} from "../challenge_mode/coins.js";
import {CHALLENGE_MODE_LEVELS} from "../challenge_mode/challenge_mode.js";

export class BlochSphere {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = renderer.scene;
        this.arrow = null;
        this.blochSphereGroup = null;

        this.initializeComponents();
        this.initializeTraceLine();
        this.dephasingActive = false;
        this.dephasingTween = null;

        // CHALLENGE MODE STUFF
        this.challengeModeActivated = false;
        this.coins = [];
        this.hardMode = false;

        this.driveDuration = 5000;
    }

    startDephasing() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis for dephasing
        const halfCircle = Math.PI; // 360 degrees
        const duration = this.driveDuration; // Duration for a full 360 rotation, can adjust for slower/faster dephasing

        const quaternionInitial = this.arrow.quaternion.clone();
        const quaternionChange = new THREE.Quaternion().setFromAxisAngle(axis, halfCircle);
        const quaternionFinal = quaternionInitial.clone().premultiply(quaternionChange);

        this.dephasingTween = new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, duration)
            .onUpdate((obj) => {
                // this.arrow.quaternion.slerp(quaternionFinal, obj.t);
                this.arrow.quaternion.copy(quaternionInitial).slerp(quaternionFinal, obj.t);
                this.updateTraceLine();
                this.checkCoinPositions();
            })
            .onComplete(() => {
                this.arrow.quaternion.copy(quaternionFinal);
                this.startDephasing();
                this.checkCoinPositions();
            })
            .onStop(() => {
                // this.arrow.quaternion.copy(quaternionFinal);
            })
            .start();

        this.dephasingActive = true;

    }

    stopDephasing() {
        this.dephasingTween?.stop();
        this.dephasingActive = false;
    }

    toggleDephasing() {
        if (this.dephasingActive) {
            this.stopDephasing();
        } else {
            this.startDephasing();
        }
    }

    setDriveFrequency(frequency) {
        if(this.dephasingActive) {
            this.stopDephasing();
            this.driveDuration = 26000 - frequency;
            this.startDephasing();
        }
    }

    initializeComponents(customGeometry = null, z_origin=0) {
        this.blochSphereGroup = new THREE.Group();
        let initialSphereGeometry;
        if(customGeometry) {
            initialSphereGeometry = customGeometry;
        } else {
            initialSphereGeometry = createBasicSphereGeometry();
        }
        const sphere = createSphere(initialSphereGeometry);
        const equator = createEquator(initialSphereGeometry, z_origin, .5);
        const axes = createAxes(initialSphereGeometry, z_origin);
        const labels = addTextLabels(initialSphereGeometry, z_origin);
        this.arrow = createArrow(initialSphereGeometry, z_origin);

        this.blochSphereGroup.add(sphere);
        this.blochSphereGroup.add(equator);
        this.blochSphereGroup.add(axes);
        this.blochSphereGroup.add(this.arrow);
        this.blochSphereGroup.add(...labels);

        this.scene.add(this.blochSphereGroup);
    }

    applyPhaseFlipChannel(p) {
        const scaleXY = 1 - 2 * p;
        this.blochSphereGroup.scale.set(scaleXY, 1, scaleXY);
    }

    applyBitFlipChannel(p) {
        const scaleYZ = 1 - 2 * p;
        this.blochSphereGroup.scale.set(1, scaleYZ, scaleYZ);
    }

    applyBitPhaseFlipChannel(p) {
        const scaleXZ = 1 - 2 * p;
        this.blochSphereGroup.scale.set(scaleXZ, scaleXZ, 1);
    }

    applyDepolarizingChannel(p) {
        const scale = 1 -  p;
        this.blochSphereGroup.scale.set(scale, scale, scale);
    }

    // applyGeneralizedAmplitudeDamping2(renderer, p) {
    //     const geometry = new THREE.SphereGeometry(1, 16, 16);
    //     const positionAttribute = geometry.getAttribute('position').array;
    //
    //     let maxRadius = 0;
    //     let xSum = 0, ySum = 0, zSum = 0;
    //     const gamma = .8
    //     for (let i = 0; i < positionAttribute.length; i += 3) {
    //         positionAttribute[i] = positionAttribute[i] * Math.sqrt(1 - gamma);
    //         positionAttribute[i + 2] = positionAttribute[i + 2] * Math.sqrt(1 - gamma);
    //         positionAttribute[i + 1] = positionAttribute[i + 1] * (1 - gamma) + gamma;
    //
    //         // calculate radius with respect to 0, 1, 0 as the origin
    //         const x = positionAttribute[i];
    //         const y = positionAttribute[i + 2];
    //         const z = positionAttribute[i + 1];
    //         zSum += z;
    //         const radius = Math.sqrt(x * x + y * y + (z-gamma) * (z-gamma));
    //         if (radius > maxRadius) {
    //             maxRadius = radius;
    //         }
    //     }
    //     const sphereZCenter = zSum / (positionAttribute.length / 3);
    //     console.log('new center', sphereZCenter)
    //     console.log('new radius', maxRadius)
    //     geometry.parameters.radius = maxRadius;
    //     positionAttribute.needsUpdate = true;
    //
    //     this.blochSphereGroup.scale.set(0, 0, 0);
    //     this.initializeComponents(geometry, sphereZCenter);
    // }

    applyGeneralizedAmplitudeDamping(gamma) {
        const scaleXZ = Math.sqrt(1 - gamma);
        const scaleY = (1 - gamma);

        this.blochSphereGroup.scale.set(scaleXZ, scaleY, scaleXZ);
        this.blochSphereGroup.position.y = gamma;
    }

    animateT1Process(T1) {
        const startTime = Date.now();

        const animateStep = () => {
            const elapsedTime = (Date.now() - startTime) / 1000; // time in seconds
            const gamma = 1 - Math.exp(-elapsedTime / T1);
            this.applyGeneralizedAmplitudeDamping(gamma);
            // Update transformation based on gamma
            if (gamma < 0.95) { // Continue animating while gamma is less than 0.99
                requestAnimationFrame(animateStep);
            } else {
                console.log("Animation completed"); // Optional: Signal that the animation is complete
            }
            // Render the scene after updates
            this.renderer.render();
        };
        animateStep(); // Start the animation loop
    }

    animateT2Process(T2) {
        const startTime = Date.now();

        const animateStep = () => {
            const elapsedTime = (Date.now() - startTime) / 1000; // time in seconds
            const sqrt_one_minus_lambda = Math.exp(-elapsedTime / (2*T2));
            this.blochSphereGroup.scale.set(sqrt_one_minus_lambda, 1, sqrt_one_minus_lambda);
            // Update transformation based on gamma
            if (sqrt_one_minus_lambda > 0.05) { // Continue animating while gamma is less than 0.99
                requestAnimationFrame(animateStep);
            } else {
                console.log("Animation completed"); // Optional: Signal that the animation is complete
            }
            // Render the scene after updates
            this.renderer.render();
        };
        animateStep(); // Start the animation loop
    }

    animateT1T2Process(T1, T2) {
        const startTime = Date.now();

        const animateStep = () => {
            const elapsedTime = (Date.now() - startTime) / 1000; // time in seconds

            // Calculate gamma for T1 process (Amplitude Damping)
            const gamma = 1 - Math.exp(-elapsedTime / T1);
            const scaleXZ_T1 = Math.sqrt(1 - gamma);  // T1 affects X and Z axes
            const scaleY_T1 = 1 - gamma;  // T1 also affects Y axis

            // Calculate lambda for T2 process (Phase Damping)
            const sqrt_one_minus_lambda = Math.exp(-elapsedTime / (2 * T2));
            // T2 affects X and Z axes, no vertical (Y) scale change directly from T2

            // Combine the scale factors
            const combinedScaleXZ = scaleXZ_T1 * sqrt_one_minus_lambda; // Combine X and Z scales
             // Y scale only affected by T1
            // Apply combined scaling and position adjustment
            this.blochSphereGroup.scale.set(combinedScaleXZ, scaleY_T1, combinedScaleXZ);
            this.blochSphereGroup.position.y = gamma; // Position adjustment for T1
            // Update transformation based on gamma
            if (sqrt_one_minus_lambda > 0.05 || gamma < .95) { // Continue animating while gamma is less than 0.99
                requestAnimationFrame(animateStep);
            } else {
                console.log("Animation completed"); // Optional: Signal that the animation is complete
            }
            // Render the scene after updates
            this.renderer.render();
        };
        animateStep(); // Start the animation loop
    }



    animateRotation(axis, angle, onComplete) {
        const wasDephasing = this.dephasingActive;
        if (wasDephasing) {
            this.stopDephasing();
        }

        const quaternionInitial = this.arrow.quaternion.clone();
        const quaternionChange = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);

        const quaternionFinal = quaternionInitial.clone().premultiply(quaternionChange);

        const buttons = document.getElementsByClassName("gate-button");
        for (let button of buttons) {
            button.disabled = true;
        }

        new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, 600)
            .onUpdate((obj) => {
                // this.arrow.quaternion.slerp(quaternionFinal, obj.t);
                this.arrow.quaternion.copy(quaternionInitial).slerp(quaternionFinal, obj.t);
                this.updateTraceLine();
            })
            .onComplete(() => {
                this.arrow.quaternion.copy(quaternionFinal);
                onComplete?.();
                for (let button of buttons) {
                    button.disabled = false;
                }
                if (wasDephasing) {
                    this.startDephasing();
                }
                if (this.challengeModeActivated) {
                    this.checkCoinPositions();
                }

            })
            .start();
    }


    initializeTraceLine() {
        this.traceGeometry = new THREE.BufferGeometry();
        // Start with the initial position of the arrow tip
        const initialTip = new THREE.Vector3(0, 1, 0);  // Assuming the arrow length is 1 and points up
        this.positions = [initialTip.x, initialTip.y, initialTip.z];
        this.traceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.traceLine = new THREE.Line(this.traceGeometry, material);
        this.blochSphereGroup.add(this.traceLine);
    }

    updateTraceLine() {
        const tipPosition = new THREE.Vector3(0, 1, 0); // Adjust if arrow length changes
        tipPosition.applyQuaternion(this.arrow.quaternion);
        tipPosition.add(this.arrow.position); // Adjust if arrow position changes
        this.positions.push(tipPosition.x, tipPosition.y, tipPosition.z);
        this.traceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        this.traceGeometry.attributes.position.needsUpdate = true;
    }
    // In BlochSphere.js
    reset() {
        // Reset the arrow's orientation
        this.stopDephasing();
        this.dephasingActive = false;
        this.arrow.rotation.set(0, 0, 0);
        this.blochSphereGroup.scale.set(1, 1, 1);

        // Clear the positions and reset the trace line geometry
        this.positions = [0, 1, 0];  // Assuming the arrow starts pointing up
        this.traceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        this.traceGeometry.attributes.position.needsUpdate = true;

        // Clean challenge mode
        this.cleanAllCoins();
    }

    applyXGate() {
        const axis = new THREE.Vector3(1, 0, 0); // X-axis
        const angle = Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }


    applyYGate() {
        const axis = new THREE.Vector3(0, 0, 1); // Y-axis
        const angle = -Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }

    applyZGate() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }

    applyHadamardGate() {
        const axis = new THREE.Vector3(1, 1, 0).normalize(); // (1, 0, 1) is the vector sum of X and Z axes
        const angle = Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }

    applySGate() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = Math.PI / 2; // 90 degrees
        this.animateRotation(axis, angle);
    }

    applyTGate() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = Math.PI / 4; // 45 degrees
        this.animateRotation(axis, angle);
    }

    applySGateInverse() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = -Math.PI / 2; // -90 degrees
        this.animateRotation(axis, angle);
    }

    applyTGateInverse() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = -Math.PI / 4; // -45 degrees
        this.animateRotation(axis, angle);
    }

    // CHALLENGE MODE STUFF

    startChallengeMode(level) {
        this.challengeModeActivated = true;
        this.initializeByLevel(level);
    }

    initializeByLevel(level) {
        this.cleanAllCoins();
        switch (level) {
            case CHALLENGE_MODE_LEVELS.EASY:
                this.initializeEasyCoins();
                break;
            case CHALLENGE_MODE_LEVELS.MEDIUM:
                this.initializeMediumCoins();
                break;
            case CHALLENGE_MODE_LEVELS.HARD:
                this.initializeHardCoins();
                break;
            default:
                console.log("Level not recognized");
        }
    }

    initializeEasyCoins() {
        const states = ["|1>", "|i>", "|+>", "|->"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
        this.hardMode = false;
    }

    initializeMediumCoins() {
        const states = ["hanover", "gpt", "tzone", "tzone2"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
        this.hardMode = false;
    }

    initializeHardCoins() {
        const states = ["idk", "idk", "idk"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
        this.hardMode = true;
    }

    checkCoinPositions() {
        const arrowTip = new THREE.Vector3(0, 1, 0); // Assuming the arrow length is 1 and points up
        this.coins.forEach((coin) => {
            arrowTip.applyQuaternion(this.arrow.quaternion);
            const distance = arrowTip.distanceTo(coin.position);
            if (distance < 0.1) {
                this.scene.remove(coin);
                this.coins = this.coins.filter((c) => c !== coin);
                if(this.coins.length === 0) {
                    this.challengeModeActivated = false;
                    if(this.hardMode) {
                        alert("Congratulations! You have completed the challenge ON THE HARDEST MODE! Nice job.");
                    } else {
                        alert("Congratulations! You have completed the challenge.")
                    }

                }
            }
            arrowTip.set(0, 1, 0); // Reset the arrowTip for the next iteration
        });
    }

    cleanAllCoins() {
        this.coins.forEach((coin) => {
            this.scene.remove(coin);
        });
        this.coins = [];
    }



}
