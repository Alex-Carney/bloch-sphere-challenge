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
            position = new THREE.Vector3(0, -1, 0);
            break;
        case "|i>":
            position = new THREE.Vector3(0, 0, 1);
            break;
        case "|+>":
            position = new THREE.Vector3(1, 0, 0);
            break;
        case "|->":
            position = new THREE.Vector3(-1, 0, 0);
            break;
        case "hanover":
            position = new THREE.Vector3(0, 1, 1).normalize();
            break;
        case "gpt":
            position = new THREE.Vector3(1, -1, 0).normalize();
            break;
        case "tzone":
            position = new THREE.Vector3(-1, 0, 1).normalize();
            break;
        case "tzone2":
            position = new THREE.Vector3(1, 0, -1).normalize();
            break;
        case "idk":
            // random position on teh sphere
            // random position on the sphere
            position = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
            break;
        default:
            console.log("State not recognized");
            return;
    }
    coin.position.copy(position);  // Set the coin's position on the sphere
    scene.add(coin);
    return coin;
}

