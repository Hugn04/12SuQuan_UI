import Phaser from 'phaser';
import Joystick from '../helpers/joystick';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('glass', 'assets/tilemaps/tiles/Glass.png');
        this.load.image('other', 'assets/tilemaps/tiles/rock.png');
        this.load.image('full', 'assets/tilemaps/tiles/full.png');
        this.load.tilemapTiledJSON('Map1', 'assets/tilemaps/maps/Map1.json');
        this.load.tilemapTiledJSON('Map2', 'assets/tilemaps/maps/Map2.json');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
    }

    create() {
        this.arrTrigger = [];
        this.arrLayer = [];
        this.player = this.matter.add.sprite(100, 100, 'player');
        const colliderWidth = 50; // Chiều rộng collider
        const colliderHeight = 100; // Chiều cao collider

        // Tạo body cho collider
        this.player.setExistingBody(
            this.matter.add.rectangle(0, 0, colliderWidth, colliderHeight, {
                isStatic: false,
                label: 'player',
                // restitution: 0.5, // Khả năng đàn hồi
                // friction: 0.5, // Ma sát
            }),
        );

        // Đặt vị trí cho player
        this.loadMap('Map1', [1700, 1000]);

        // Thiết lập để không cho player quay
        this.player.setFixedRotation(); // Ngăn không cho player quay
        this.player.setScale(0.5);
        this.matter.world.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);

        // Tạo các animation
        this.createAnimations();
        this.player.setDepth(10);
        this.joystick = new Joystick(this, 150, 750, 70);
    }

    update(time, delta) {
        const speed = 0.2 * delta; // Tăng tốc độ dựa trên delta
        const direction = this.joystick.getDirection();

        // Cập nhật vị trí của player dựa trên joystick
        if (direction.x !== 0 || direction.y !== 0) {
            this.player.setVelocity(speed * direction.x * 2, speed * direction.y * 2); // Nhân với 2 để tăng tốc độ

            // Chọn animation phù hợp dựa trên hướng di chuyển
            this.updatePlayerAnimation(direction);
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('turn', true); // Khi không di chuyển, phát animation "turn"
        }
    }
    handleCollision(event) {
        for (let i = 0; i < event.pairs.length; i++) {
            const { bodyA, bodyB } = event.pairs[i];

            if (bodyA.label === 'trigger' || bodyB.label === 'trigger') {
                const triggerBody = bodyA.label === 'trigger' ? bodyA : bodyB;
                triggerBody.event();
            }
        }
    }

    createAnimations() {
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
    }

    updatePlayerAnimation(direction) {
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
    }

    loadMap(mapKey, [x, y]) {
        this.currentMap = this.make.tilemap({ key: mapKey });
        const groundTiles = this.currentMap.addTilesetImage('Glass', 'glass');
        const other = this.currentMap.addTilesetImage('rock', 'other');
        const full = this.currentMap.addTilesetImage('full');
        this.currentMap.layers.forEach((layer, i) => {
            const layerName = layer.name;
            layer = this.currentMap.createLayer(layerName, [groundTiles, other, full]);
            layer.setCollisionByProperty({ collides: true });
            layer.setDepth(i);
            this.matter.world.convertTilemapLayer(layer);
            this.arrLayer.push(layer);
        });

        //var start = this.getObjectFromLayerObject('CheckPoint', Start)[0];
        this.player.setPosition(x, y);

        // this.layer.forEachTile((tile) => {
        //     if (tile.properties.trigger === true) {
        //         tile.physics.matterBody.body.isSensor = true;
        //         tile.physics.matterBody.body.label = 'trigger';
        //         tile.physics.matterBody.body.event = () => {
        //             setTimeout(() => {
        //                 this.switchMap('Map1');
        //             }, 500);
        //         };
        //     }
        // });

        this.matter.world.on('collisionstart', this.handleCollision, this);
        const end = this.getObjectFromLayerObject('CheckPoint', 'ChangeMap');
        this.createTriggerFromObjLayer(end, (e) => {
            var start = this.getLayerObjectByID('CheckPoint', e.nextStep)[0];
            setTimeout(() => {
                this.switchMap(e.mapName, [start.x, start.y]);
            }, 500);
        });
    }
    getLayerObjectByID(layerObject, id) {
        const objectLayer = this.currentMap.getObjectLayer(layerObject).objects;
        var objects = objectLayer.reduce((total, item) => {
            if (Array.isArray(item.properties)) {
                const propertiesValue = item.properties.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {});
                item.properties = propertiesValue;
            }
            item.id === id && total.push(item);
            return total;
        }, []);
        return objects;
    }
    getObjectFromLayerObject(layerObject, nameObject) {
        const objectLayer = this.currentMap.getObjectLayer(layerObject).objects;
        var objects = objectLayer.reduce((total, item) => {
            if (Array.isArray(item.properties)) {
                const propertiesValue = item.properties.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {});
                item.properties = propertiesValue;
            }
            item.name === nameObject && total.push(item);
            return total;
        }, []);
        return objects;
    }

    createTriggerFromObjLayer(objLayer, callback = () => {}) {
        objLayer.forEach((item) => {
            const rectangle = {
                x: 400,
                y: 300,
                width: 50,
                height: 50,
                isStatic: true, // Thiết lập hình chữ nhật có thể di chuyển
                label: 'trigger', // Đặt nhãn cho hình chữ nhật
                ...item,
            };
            const trigger = this.matter.add.rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height, {
                event: () => {
                    callback(item.properties);
                },
                isSensor: true,
                isStatic: rectangle.isStatic,
                label: rectangle.label,
                restitution: rectangle.restitution,
                friction: rectangle.friction,
                density: rectangle.density,
            });
            this.arrTrigger.push(trigger);
        });
    }
    switchMap(newMapKey, start) {
        this.arrLayer.forEach((layer) => {
            layer.forEachTile((tile) => {
                if (tile.physics && tile.physics.matterBody) {
                    this.matter.world.remove(tile.physics.matterBody);
                }
                layer.destroy();
            });
        });
        this.arrTrigger.forEach((trigger) => {
            this.matter.world.remove(trigger);
        });
        this.arrLayer = [];
        this.arrTrigger = [];
        this.loadMap(newMapKey, start);
    }
}

export default GameScene;
