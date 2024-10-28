import Phaser from 'phaser';
//import { socket } from '../service';
class LoginForm extends Phaser.Scene {
    constructor() {
        super('LoginForm');
    }

    preload() {
        //this.load.setBaseURL('https://labs.phaser.io/');
        //this.load.image('ground', 'assets/tilemaps/tiles/kenny_ground_64x64.png');
        //this.load.image('items', 'assets/tilemaps/tiles/kenny_items_64x64.png');
        this.load.image('glass', 'assets/tilemaps/tiles/Glass.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/Map1.json');
        this.load.tilemapTiledJSON('map2', 'assets/tilemaps/maps/Map2.json');
    }

    create() {
        this.currentMap = this.make.tilemap({ key: 'map2' });
        var groundTiles = this.currentMap.addTilesetImage('Glass', 'glass');

        //  To use multiple tilesets in a single layer, pass them in an array like this:
        this.currentMap.createLayer('Tile Layer 1', [groundTiles]);
        this.input.keyboard.on('keydown', (e) => {
            switch (e.key) {
                case '1':
                    this.switchMap();
                    break;
                case '2':
                    break;
                case '3':
                    break;
                default:
                    break;
            }
        });
        //  Or you can pass an array of strings, where they = the Tileset name
        // map.createLayer('Tile Layer 1', [ 'kenny_ground_64x64', 'kenny_items_64x64', 'kenny_platformer_64x64' ]);

        this.cameras.main.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);

        var cursors = this.input.keyboard.createCursorKeys();

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.5,
        };

        this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

        var help = this.add.text(16, 16, 'Arrow keys to scroll', {
            fontSize: '18px',
            padding: { x: 10, y: 5 },
            backgroundColor: '#000000',
            fill: '#ffffff',
        });

        help.setScrollFactor(0);
    }
    switchMap(mapKey, tileset) {
        // Xóa layer hiện tại (nếu có)
        if (this.currentMap) {
            this.currentMap.destroy();
        }

        // Tạo tilemap mới
        this.currentMap = this.make.tilemap({ key: mapKey });

        // Tạo layer mới với cùng tileset
        const newLayer = this.currentMap.createLayer('layer_name', tileset, 0, 0);

        // Thêm collider vào layer mới
        newLayer.setCollisionByProperty({ collides: true });
    }
    update(time, delta) {
        this.controls.update(delta);
    }
}

export default LoginForm;
