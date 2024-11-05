import './css/style.css';
import Phaser, { DOM } from 'phaser';
import scene from './scenes';
import { desktop, mobile, sizeDevice } from './utils/breakPoints';
import request from './service/request';

// request
//     .get('/')
//     .then((data) => {
//         console.log(data);
//     })
//     .catch();
let sizes = {
    width: 1280,
    height: 720,
};
if (mobile) {
    sizes = {
        width: 720,
        height: 1280,
    };
}

const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    parent: 'app',
    backgroundColor: '#f3f3f3',
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            enableSleep: true,
            debug: false,
        },
        arcade: {
            gravity: { y: 1 },
            enableSleep: true,
            debug: false,
        },
    },
    scene: scene,
};

const game = new Phaser.Game(config);
// class MyScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'MyScene' });
//     }

//     preload() {
//         // Load resources nếu cần
//     }

//     create() {
//         // Tạo button HTML
//         let button = document.createElement('input');
//         button.innerText = 'Click Me!';
//         button.style.width = '100px';
//         button.style.height = '50px';
//         button.style.position = 'absolute';
//         // button.style.zIndex = '10'; // Đảm bảo button nằm trên canvas

//         // Thêm button vào Phaser tại vị trí (200, 200)
//         this.add.dom(200, 200, button);

//         // Thêm sự kiện click cho button
//         button.addEventListener('click', () => {
//             console.log('Button clicked!');
//             alert('Button was clicked!');
//         });
//     }
// }

// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     scene: MyScene,
//     parent: 'app', // Đưa canvas vào trong div #app
//     dom: { createContainer: true }, // Bật DOM container
// };

// // Khởi tạo game với cấu hình
// const game = new Phaser.Game(config);
