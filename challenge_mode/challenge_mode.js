import {addCoinToState} from "./coins.js";

export class ChallengeMode {
    constructor(scene) {
        this.scene = scene;
        this.coins = [];
        this.initializeCoins();
    }

    initializeCoins() {
        const states = ["|1>", "|+>", "|->"];
        states.forEach((state) => {
            this.coins.push(addCoinToState(state, this.scene));
        });
    }
}