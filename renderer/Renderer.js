// Renderer.js
import { scene, camera, renderer, addRendererToDOM } from './sceneSetup';
import { createControls } from './controls';

export class Renderer {
    constructor() {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = createControls(this.camera, this.renderer);
        this.init();
    }

    init() {
        addRendererToDOM('blochSphere');
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
