import * as THREE from 'three';



function createCoin() {
    const geometry = new THREE.SphereGeometry(0.05, 16, 16); // Smaller radius for the coin
    const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,  // Bright yellow color for the coin
    });
    return new THREE.Mesh(geometry, material);
}

export function addCoinToState(state, scene) {
    const coin = createCoin();
    let position;
    switch (state) {
        case "|1>":
            position = new THREE.Vector3(0, 0, 1);
            break;
        case "|+>":
            position = new THREE.Vector3(1, 0, 0);
            break;
        case "|->":
            position = new THREE.Vector3(-1, 0, 0);
            break;
        default:
            console.log("State not recognized");
            return;
    }
    coin.position.copy(position);  // Set the coin's position on the sphere
    scene.add(coin);
    return coin;
}

