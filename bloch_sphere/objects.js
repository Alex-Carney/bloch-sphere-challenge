// objects.js
import * as THREE from 'three';
import {createTextSprite} from "./textSprites.js";

export function createSphere() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0xbbbbbb,  // Lighter grey to make less prominent
        transparent: true,
        opacity: 0.66  // Reduce opacity for less prominence
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
    mesh.add(wireframe);

    return mesh;
}

export function createTranslucentSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xbbbbbb,  // White color for the sphere surface
        transparent: true,
        opacity: 0.2  // Low opacity for translucency
    });
    return new THREE.Mesh(geometry, material);
}

export function createEquator(opacity = 0.33) {  // Default opacity can be adjusted
    const equatorGeometry = new THREE.CircleGeometry(1, 64);  // High segment count for a smooth circle
    equatorGeometry.rotateX(Math.PI / 2);  // Rotate to lie in the XZ plane

    const equatorMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,  // Dark grey
        transparent: true,  // Enable transparency
        opacity: opacity,  // Set opacity to control translucency
        side: THREE.DoubleSide  // Ensure the circle is visible from both sides
    });

    return new THREE.Mesh(equatorGeometry, equatorMaterial);
}

// In objects.js or wherever the arrow is created
export function createArrow() {
    const direction = new THREE.Vector3(0, 1, 0); // Points upwards
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1.2;
    const color = 0xff0000;
    return new THREE.ArrowHelper(direction.normalize(), origin, length, color);
}




export function createAxes() {
    const axes = new THREE.Object3D();
    const axisLength = 1;  // Longer than the radius to ensure visibility from outside
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });  // Solid black

    // X-axis
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axisLength, 0, 0), new THREE.Vector3(axisLength, 0, 0)
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
    axes.add(xAxis);

    // Y-axis
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -axisLength, 0), new THREE.Vector3(0, axisLength, 0)
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
    axes.add(yAxis);

    // Z-axis
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -axisLength), new THREE.Vector3(0, 0, axisLength)
    ]);
    const zAxis = new THREE.Line(zAxisGeometry, axisMaterial);
    axes.add(zAxis);

    return axes;
}

export function addTextLabels(scene) {
    const label0 = createTextSprite("|0>", 60, "rgba(0, 0, 0, 1)", new THREE.Vector3(0, 1.3, 0)); // Above north pole
    const label1 = createTextSprite("|1>", 60, "rgba(0, 0, 0, 1)", new THREE.Vector3(0, -1.3, 0)); // Below south pole
    scene.add(label0);
    scene.add(label1);
}


