import Broad from '../objects/Broad';
import Scene from './Scene';

class MenuScene extends Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        Broad.preload(this);
    }

    create() {
        this.arrCandy = [];
        const rows = 8;
        const cols = 8;

        // Tạo mảng ngẫu nhiên
        for (let i = 0; i < rows * 2; i++) {
            this.arrCandy[i] = [];
            for (let j = 0; j < cols; j++) {
                this.arrCandy[i][j] = Phaser.Math.Between(0, 5);
            }
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.broad = new Broad({ scene: this, x: centerX, y: centerY, initBoard: this.arrCandy });
    }

    update(time) {}
}

export default MenuScene;
