// BlochSphere.js
import * as THREE from 'three';
import { createArrow, createSphere, createAxes, createEquator, addTextLabels } from './objects';
import * as TWEEN from '@tweenjs/tween.js'
import * as math from 'mathjs';

export class BlochSphere {
    constructor(scene) {
        this.scene = scene;
        this.arrow = createArrow();
        this.scene.add(this.arrow);
        this.initializeComponents();
        this.initializeTraceLine();
    }

    initializeComponents() {
        this.scene.add(createSphere());
        this.scene.add(createAxes());
        this.scene.add(createEquator(0.5));
        addTextLabels(this.scene);
    }

    animateRotation(axis, angle, onComplete) {
        const quaternionInitial = this.arrow.quaternion.clone();
        const quaternionChange = new THREE.Quaternion();
        quaternionChange.setFromAxisAngle(axis.normalize(), angle);

        // Compute the final orientation by applying the change to the initial orientation
        const quaternionFinal = quaternionInitial.clone().multiply(quaternionChange);

        // Disable all buttons with thet "gate-button" classs
        const buttons = document.getElementsByClassName("gate-button");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }

        const tween = new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, 1000)
            .onUpdate((obj) => {
                // Slerp the quaternion directly on the arrow
                this.arrow.quaternion.slerp(quaternionFinal, obj.t);
                this.updateTraceLine();  // Optionally update the trace line
            })
            .onComplete(() => {
                // Ensure the arrow's quaternion is exactly the final quaternion to avoid any precision errors
                this.arrow.quaternion.copy(quaternionFinal);
                if (onComplete) onComplete();
                // Enable all buttons with the "gate-button" class
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].disabled = false;
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
        const angle = Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }

    applyZGate() {
        const axis = new THREE.Vector3(0, 1, 0); // Z-axis
        const angle = Math.PI; // 180 degrees
        this.animateRotation(axis, angle);
    }

    applyHadamardGate() {
        const axisY = new THREE.Vector3(0, 1, 0); // Y-axis
        const axisX = new THREE.Vector3(0, 0, 1); // X-axis
        const angleY = Math.PI / 2; // 90 degrees
        const angleX = Math.PI / 2; // Additional 90 degrees
        this.animateRotation(axisX, angleX);
    }


}
