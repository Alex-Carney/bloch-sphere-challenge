// objects.js
import * as THREE from 'three';
import {createTextSprite} from "./textSprites.js";

export function createBasicSphereGeometry() {
    return new THREE.SphereGeometry(1, 16, 16)
}

export function createSphere(geometry) {
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

    return mesh;
}

export function createEquator(sphereGeometry, z_origin = 0, opacity = 0.33) {
    const sphereRadius = sphereGeometry.parameters.radius;  // Get the radius from the sphere geometry
    const equatorGeometry = new THREE.CircleGeometry(sphereRadius, 64);  // Use sphere radius
    equatorGeometry.rotateX(Math.PI / 2);

    const equatorMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
    });

    const equatorMesh = new THREE.Mesh(equatorGeometry, equatorMaterial);
    equatorMesh.position.y = z_origin; // Adjust position based on z_origin
    return equatorMesh;
}

export function createArrow(sphereGeometry, z_origin = 0) {
    const sphereRadius = sphereGeometry.parameters.radius;
    const direction = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, z_origin, 0);
    const length = sphereRadius * 1;  // Adjust length based on sphere radius
    const color = 0xff0000;

    return new THREE.ArrowHelper(direction.normalize(), origin, length, color);
}

export function createAxes(sphereGeometry, z_origin = 0) {
    const sphereRadius = sphereGeometry.parameters.radius;
    const axes = new THREE.Object3D();
    const axisLength = sphereRadius * 1;  // Make axes slightly longer than the sphere's radius

    const axisMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
    });

    // X-axis
    const xAxisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axisLength, z_origin, 0),
        new THREE.Vector3(axisLength, z_origin, 0)
    ]);
    const xAxis = new THREE.Line(xAxisGeom, axisMaterial);
    axes.add(xAxis);

    // Y-axis
    const yAxisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, z_origin - axisLength, 0),
        new THREE.Vector3(0, z_origin + axisLength, 0)
    ]);
    const yAxis = new THREE.Line(yAxisGeom, axisMaterial);
    axes.add(yAxis);

    // Z-axis
    const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, z_origin, -axisLength),
        new THREE.Vector3(0, z_origin, axisLength)
    ]);
    const zAxis = new THREE.Line(zAxisGeom, axisMaterial);
    axes.add(zAxis);

    return axes;
}


export function addTextLabels(sphereGeometry, z_origin = 0) {
    const sphereRadius = sphereGeometry.parameters.radius;
    // Adjust the position of labels based on the sphere's radius
    const label0 = createTextSprite("|0>", 60*sphereRadius, "rgba(0, 0, 0, 1)", new THREE.Vector3(0, sphereRadius * 1.3 + z_origin, 0));
    const label1 = createTextSprite("|1>", 60*sphereRadius, "rgba(0, 0, 0, 1)", new THREE.Vector3(0, -sphereRadius * 1.3 + z_origin, 0));
    const labelX = createTextSprite("x", 60*sphereRadius, "rgba(0, 0, 0, 1)", new THREE.Vector3(sphereRadius *1.2, sphereRadius * .1 + z_origin, 0));  // X-axis label
    const labelY = createTextSprite("y", 60*sphereRadius, "rgba(0, 0, 0, 1)", new THREE.Vector3(0, sphereRadius * .1 + z_origin, sphereRadius *1.2));  // Y-axis label
    // More labels adjusted similarly

    return [label0, label1, labelX, labelY];  // Add other labels as needed
}
