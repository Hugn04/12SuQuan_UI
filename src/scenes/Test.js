import Phaser from 'phaser';
import Joystick from '../helpers/joystick';

class Test extends Phaser.Scene {
    constructor() {
        super('Test');
    }

    preload() {
        this.load.image('glass', 'assets/tilemaps/tiles/Glass.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/Map1.json');
        this.load.tilemapTiledJSON('map2', 'assets/tilemaps/maps/Map2.json');

        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
    }

    create() {
        this.loadMap('map');
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.5);
        this.physics.world.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown', (e) => {
            switch (e.key) {
                case '1':
                    this.switchMap('map');
                    break;
                case '2':
                    this.switchMap('map2');
                    break;
                default:
                    break;
            }
        });

        this.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 0 }], frameRate: 20 });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 13 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });
        this.player.setDepth(1);

        this.joystick = new Joystick(this, 150, 750, 70);
    }
    update(time, delta) {
        const speed = 20 * delta;
        const direction = this.joystick.getDirection();

        // Cập nhật vị trí của player dựa trên joystick
        if (direction.x !== 0 || direction.y !== 0) {
            this.player.setVelocity(speed * direction.x * 2, speed * direction.y * 2); // Nhân với 2 để tăng tốc độ

            // Chọn animation phù hợp dựa trên hướng di chuyển
            const absX = Math.abs(direction.x);
            const absY = Math.abs(direction.y);

            if (direction.x < 0) {
                if (direction.y < 0) {
                    if (absX < absY) {
                        this.player.anims.play('up', true);
                    } else {
                        this.player.anims.play('left', true);
                    }
                } else {
                    if (absX > absY) {
                        this.player.anims.play('left', true);
                    } else {
                        this.player.anims.play('down', true);
                    }
                }
            } else {
                if (direction.y < 0) {
                    if (absX > absY) {
                        this.player.anims.play('right', true);
                    } else {
                        this.player.anims.play('up', true);
                    }
                } else {
                    if (absX > absY) {
                        this.player.anims.play('right', true);
                    } else {
                        this.player.anims.play('down', true);
                    }
                }
            }

            // if (direction.x < 0) {
            //     this.player.anims.play('left', true);
            // } else if (direction.x > 0) {
            //     this.player.anims.play('right', true);
            // }

            // if (direction.y < 0) {
            //     this.player.anims.play('up', true);
            // } else if (direction.y > 0) {
            //     this.player.anims.play('down', true);
            // }
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('turn', true); // Khi không di chuyển, phát animation "turn"
        }
    }
    loadMap(mapKey) {
        this.currentMap = this.make.tilemap({ key: mapKey });
        const groundTiles = this.currentMap.addTilesetImage('Glass', 'glass');

        const layerName = this.currentMap.getLayerIndex(0).name || 'Tile Layer 1';
        this.layer = this.currentMap.createLayer(layerName, [groundTiles]);
        this.layer.setDepth(0);
    }

    switchMap(newMapKey) {
        this.layer.destroy();
        this.loadMap(newMapKey);
    }
}

export default Test;
