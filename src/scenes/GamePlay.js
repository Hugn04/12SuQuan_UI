import Phaser from 'phaser';
import createButton from '../components/createButton';
import Player from '../objects/Player';
import { io } from 'socket.io-client';
import Broad from '../objects/Broad';

class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }
    init({ data, socket, board }) {
        const { [socket.id]: self, ...otherObj } = data;
        const other = Object.values(otherObj)[0];
        this.arrCandy = board;
        const fakeDataSelf = {
            userName: 'Người chơi 1',
            heart: 100,
            level: 1,
        };
        const fakeDataOther = {
            userName: 'Người chơi 2',
            heart: 100,
            level: 1,
        };
        this.socket = socket;

        this.self = self;
        this.other = other;
    }
    preload() {
        Broad.preload(this);
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
        this.load.spritesheet('bg', 'assets/images/background.png', { frameWidth: 100, frameHeight: 149 });
    }
    create() {
        createButton(this, 600, 100, {
            title: 'Rời phòng',
            onClick: () => {
                this.socket.emit('leaveRoom', { roomID: this.socket.roomID });
                this.scene.start('Game', { socket: this.socket });
            },
        });
        this.socket.on('playerLeaveRoom', () => {
            alert(`${this.other.userName} đã bỏ chạy`);
            this.scene.start('Game', { socket: this.socket });
        });

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.broad = new Broad({ scene: this, x: centerX, y: centerY, initBoard: this.arrCandy, socket: this.socket });
        this.add.image(0, 0, 'bg').setDepth(0);
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
