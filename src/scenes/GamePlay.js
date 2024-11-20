import Phaser from 'phaser';
import createButton from '../components/createButton';
import Player from '../objects/Player';
import { io } from 'socket.io-client';
import Broad from '../objects/Broad';
import Alert from '../objects/Alert';

class GamePlay extends Phaser.Scene {
    constructor() {
        super('GamePlay');
    }
    init({ data, socket, board }) {
        console.log(board);

        if (board) {
            this.socket = socket;
            const { [socket.id]: self, ...otherObj } = data;
            const other = Object.values(otherObj)[0];
            this.arrCandy = board;

            this.self = self;
            this.other = other;
        } else {
            this.socketTemp = socket;
            var arrCandy = [];
            const rows = 8;
            const cols = 8;

            for (let i = 0; i < rows * 2; i++) {
                arrCandy[i] = [];
                for (let j = 0; j < cols; j++) {
                    arrCandy[i][j] = Phaser.Math.Between(0, 5);
                }
            }
            const { self, other } = data;
            this.arrCandy = arrCandy;
            this.self = self;
            this.other = other;
        }
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
                if (this.socket) {
                    this.socket.emit('leaveRoom', { roomID: this.socket.roomID });
                    this.scene.start('Game', { socket: this.socket });
                } else {
                    this.scene.start('Game', { socket: this.socketTemp });
                }
            },
        });
        if (this.socket) {
            this.socket.on('playerLeaveRoom', () => {
                new Alert(
                    this,
                    'Đối thủ của bạn đã bỏ chạy !',
                    () => {
                        this.scene.start('Game', { socket: this.socket });
                    },
                    () => {
                        this.scene.start('Game', { socket: this.socket });
                    },
                );
            });
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.broad = new Broad({ scene: this, x: centerX, y: centerY, initBoard: this.arrCandy, socket: this.socket });
        // this.add.image(0, 0, 'bg').setDepth(0);
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
