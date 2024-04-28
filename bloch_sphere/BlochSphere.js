// BlochSphere.js
import * as THREE from 'three';
import { createArrow, createSphere, createAxes, createEquator, addTextLabels } from './objects';
import * as TWEEN from '@tweenjs/tween.js'

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

    animateRotation(newRotation) {
        const currentRotation = { x: this.arrow.rotation.x, y: this.arrow.rotation.y, z: this.arrow.rotation.z };
        const tween = new TWEEN.Tween(currentRotation)
            .to(newRotation, 1000)
            .onUpdate(() => {
                this.arrow.rotation.x = currentRotation.x;
                this.arrow.rotation.y = currentRotation.y;
                this.arrow.rotation.z = currentRotation.z;
                this.updateTraceLine();
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
        console.log("Applying X gate")
        const newRotation = { x: this.arrow.rotation.x, y: this.arrow.rotation.y + Math.PI, z: this.arrow.rotation.z };
        this.animateRotation(newRotation);
    }

    applyYGate() {
        const newRotation = { x: this.arrow.rotation.x + Math.PI, y: this.arrow.rotation.y, z: this.arrow.rotation.z };
        this.animateRotation(newRotation);
    }

    applyZGate() {
        const newRotation = { x: this.arrow.rotation.x, y: this.arrow.rotation.y, z: this.arrow.rotation.z + Math.PI };
        this.animateRotation(newRotation);
    }

    applyHadamardGate() {
        const newRotation = { x: this.arrow.rotation.x, y: this.arrow.rotation.y + Math.PI / 2, z: this.arrow.rotation.z + Math.PI };
        this.animateRotation(newRotation);
    }

}
