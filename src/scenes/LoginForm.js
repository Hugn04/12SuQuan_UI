import Phaser from 'phaser';

class LoginForm extends Phaser.Scene {
    constructor() {
        super('LoginForm');
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

    update(time, delta) {
        const speed = 200;
        let directions = [];

        // Xử lý di chuyển theo phím nhấn cuối cùng
        if (this.cursors.left.isDown) {
            directions.push('left');
        }
        if (this.cursors.right.isDown) {
            directions.push('right');
        }
        if (this.cursors.up.isDown) {
            directions.push('up');
        }
        if (this.cursors.down.isDown) {
            directions.push('down');
        }
        // console.log(directions);

        directions.forEach((direction, index) => {
            if (direction === 'left') {
                this.player.setVelocity(-speed, 0);
            }
            if (direction === 'right') {
                this.player.setVelocity(speed, 0);
            }
            if (direction === 'up') {
                this.player.setVelocity(0, -speed);
            }
            if (direction === 'down') {
                this.player.setVelocity(0, speed);
            }
            // {
            //     this.player.setVelocity(0, 0);
            // }
            if (index === directions.length - 1) {
                this.player.anims.play(direction, true);
            }
        });
        if (directions.length === 0) {
            this.player.setVelocity(0, 0);
            this.player.anims.play('turn', true);
        }
    }
}

export default LoginForm;
