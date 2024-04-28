// controls.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;
    return controls;
}
