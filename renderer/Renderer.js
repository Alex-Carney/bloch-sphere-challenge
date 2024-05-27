// Renderer.js
import { scene, camera, renderer, addRendererToDOM } from './sceneSetup';
import { createControls } from './controls';
import * as TWEEN from '@tweenjs/tween.js';

export class Renderer {
    constructor(window) {
        this.window = window;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = createControls(this.camera, this.renderer);
        this.init();
        this.window.addEventListener('resize', this.onWindowResize, false);
    }

    init() {
        addRendererToDOM('visualization-container');
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        TWEEN.update();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        // Get the container element from the DOM
        const container = document.getElementById('visualization-container');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

}
