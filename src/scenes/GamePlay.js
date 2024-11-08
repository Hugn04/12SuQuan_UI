import Phaser from 'phaser';
import createInput from '../components/createInput';
import createButton from '../components/createButton';
import request from '../service/request';
import Player from '../objects/Player';
class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }
    init({ self, other, socket }) {
        const fakeData = {
            userName: 'Hung',
            heart: 100,
            level: 1,
        };
        this.socket = socket;
        this.self = self;
        this.other = other;
    }
    preload() {
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
        this.load.spritesheet('bg', 'assets/images/background.png', { frameWidth: 100, frameHeight: 149 });
    }
    create() {
        createButton(this, 600, 100, {
            title: 'Rời phòng',
            onClick: () => {
                this.scene.start('Game', { socket: this.socket });
            },
        });
        this.add.image(0, 0, 'bg');
        this.player = new Player({ scene: this, x: 200, y: 300, name: this.self.userName, key: 'player' });
        this.player.setPosition(200, 200);
        this.player.body.isStatic = true;

        this.other = new Player({ scene: this, x: 500, y: 300, name: this.other.userName, key: 'player' });
        this.other.setPosition(500, 300);
        this.other.body.isStatic = true;
    }
    update() {
        this.player.update();
        this.other.update();
    }
}

export default GamePlay;
