// BlochSphere.js
import * as THREE from 'three';
import { createArrow, createSphere, createAxes, createEquator, addTextLabels } from './objects';
import * as TWEEN from '@tweenjs/tween.js'
import {addCoinToState} from "../challenge_mode/coins.js";
import {CHALLENGE_MODE_LEVELS} from "../challenge_mode/challenge_mode.js";

export class BlochSphere {
    constructor(scene) {
        this.scene = scene;
        this.arrow = null;
        this.blochSphereGroup = new THREE.Group();

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

    initializeComponents() {
        const sphere = createSphere();
        const equator = createEquator(.5);
        const axes = createAxes();
        const labels = addTextLabels();
        this.arrow = createArrow();

        this.blochSphereGroup.add(sphere);
        this.blochSphereGroup.add(equator);
        this.blochSphereGroup.add(axes);
        this.blochSphereGroup.add(this.arrow);
        this.blochSphereGroup.add(...labels);

        this.scene.add(this.blochSphereGroup);
        // this.scene.add(this.arrow);
        // this.scene.add(createSphere());
        // this.scene.add(createAxes());
        // this.scene.add(createEquator(0.5));
        // addTextLabels(this.scene);
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

    // applyGeneralizedAmplitudeDamping(p) {
    //     const gamma = .3
    //     this.blochSphereGroup.children.forEach(mesh => {
    //         let oldPosition = mesh.position.clone();
    //
    //         // Calculate new x, y using simple scaling
    //         let newX = oldPosition.x * Math.sqrt(1 - gamma);
    //         let newY = oldPosition.y * Math.sqrt(1 - gamma);
    //
    //         // Calculate new z more complex formula
    //         let newZ = gamma * (2 * p - 1) + oldPosition.z * (1 - gamma);
    //
    //         // Set the new position of the vector
    //         mesh.position.set(newX, newY, newZ);
    //     });
    // }
    applyGeneralizedAmplitudeDamping(renderer, p) {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const positionAttribute = geometry.getAttribute('position').array;

        const gamma = .95
        for (let i = 0; i < positionAttribute.length; i += 3) {
            positionAttribute[i] = positionAttribute[i] * Math.sqrt(1 - gamma);
            positionAttribute[i + 2] = positionAttribute[i + 2] * Math.sqrt(1 - gamma);
            positionAttribute[i + 1] = positionAttribute[i + 1] * (1 - gamma) + gamma * (2 * p - 1);
        }

        const material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'blochSphere';

        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0xbbbbbb,  // Lighter grey to make less prominent
            transparent: true,
            opacity: 0.66  // Reduce opacity for less prominence
        });
        const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
        mesh.add(wireframe);

        this.scene.add(mesh);
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
