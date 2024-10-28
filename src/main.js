import './css/style.css';
import Phaser from 'phaser';
import scene from './scenes';
import { desktop, mobile, sizeDevice } from './utils/breakPoints';

let sizes = {
    width: 800,
    height: 600,
};
if (mobile) {
    sizes = {
        width: 500,
        height: 900,
    };
}

const speedDown = 300;
console.log(import.meta.env.VITE_SOME_SERVER);

const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    backgroundColor: '#f3f3f3',
    dom: {
        createContainer: true,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: scene,
};

const game = new Phaser.Game(config);
