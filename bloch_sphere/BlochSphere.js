// BlochSphere.js
import * as THREE from 'three';
import { createArrow, createSphere, createAxes, createEquator, addTextLabels } from './objects';
import * as TWEEN from '@tweenjs/tween.js'
import {addCoinToState} from "../challenge_mode/coins.js";
import {CHALLENGE_MODE_LEVELS} from "../challenge_mode/challenge_mode.js";

export class BlochSphere {
    constructor(scene) {
        this.scene = scene;
        this.arrow = createArrow();
        this.scene.add(this.arrow);
        this.initializeComponents();
        this.initializeTraceLine();
        this.dephasingActive = false;
        this.dephasingTween = null;

        // CHALLENGE MODE STUFF
        this.challengeModeActivated = false;
        this.coins = [];
    }

    startDephasing() {
        console.log("Dephasing started")
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis for dephasing
        const halfCircle = Math.PI; // 360 degrees
        const duration = 20000; // Duration for a full 360 rotation, can adjust for slower/faster dephasing

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
        console.log("Dephasing stopped")
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

    initializeComponents() {
        this.scene.add(createSphere());
        this.scene.add(createAxes());
        this.scene.add(createEquator(0.5));
        addTextLabels(this.scene);
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
        this.scene.add(this.traceLine);
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

        // Clear the positions and reset the trace line geometry
        this.positions = [0, 1, 0];  // Assuming the arrow starts pointing up
        this.traceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        this.traceGeometry.attributes.position.needsUpdate = true;
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
        const states = ["|1>", "|+>", "|->"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
    }

    initializeMediumCoins() {
        const states = ["|1>", "|0>", "|+>", "|->"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
    }

    initializeHardCoins() {
        const states = ["|0>", "|1>", "|+>", "|->", "|i>", "|-i>"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
    }

    checkCoinPositions() {
        this.coins.forEach((coin) => {
            const distance = this.arrow.position.distanceTo(coin.position);
            if (distance < 0.1) {
                console.log("Coin collected");
                this.scene.remove(coin);
            }
        });
    }



}
