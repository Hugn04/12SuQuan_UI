import Phaser from 'phaser';
import Joystick from '../helpers/joystick';
import { io } from 'socket.io-client';

import axios from 'axios';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }
    preload() {
        this.load.image('glass', 'assets/tilemaps/tiles/Glass.png');
        this.load.image('arrow', 'assets/images/arrow.png');
        this.load.image('other', 'assets/tilemaps/tiles/rock.png');
        this.load.image('full', 'assets/tilemaps/tiles/full.png');
        this.load.tilemapTiledJSON('Map1', 'assets/tilemaps/maps/Map1.json');
        this.load.tilemapTiledJSON('Map2', 'assets/tilemaps/maps/Map2.json');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
    }
    create() {
        this.socket = io(import.meta.env.VITE_SOME_SERVER);
        this.ten = prompt('Nhập tên của bạn');
        this.handleSever(this.socket);
        console.log(this.socket.id);
        this.isMapSwitched = false;
        this.arrTrigger = [];
        this.arrLayer = [];
        this.playersData = {};
        this.players = {};
        this.player = this.matter.add.sprite(100, 100, 'player');

        this.player.name = this.ten;
        const colliderWidth = 50;
        const colliderHeight = 100;
        this.player.setExistingBody(
            this.matter.add.rectangle(0, 0, colliderWidth, colliderHeight, {
                isStatic: false,
                label: 'player',
            }),
        );
        this.player.setScale(0.5);
        this.player.setFixedRotation();
        this.player.setDepth(11);

        this.arrow = this.add.sprite(0, 0, 'arrow');
        this.arrow.setScale(0.1);
        // this.arrow.setFixedRotation();
        this.arrow.setDepth(11);
        this.arrow.setVisible(false);
        this.constraintArrow = null;
        this.name = this.add.text(0, 0, this.player.name);
        this.name.setDepth(10);
        this.name.setOrigin(0.5);
        console.log(this.name);

        this.loadMap('Map1', [1700, 1000]);

        this.matter.world.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);

        // Tạo các animation
        this.createAnimations();

        this.joystick = new Joystick(this, 150, 750, 70);

        this.nearbyEnemies = [];
        this.currentEnemy = null;
        this.currentEnemyIndex = 0;
        this.input.keyboard.on('keydown-V', () => {
            if (this.nearbyEnemies.length > 0) {
                this.currentEnemyIndex = (this.currentEnemyIndex + 1) % this.nearbyEnemies.length;
            }
        });
    }
    updateArrow() {
        this.nearbyEnemies = this.getNearbyEnemies(this.player);
        if (this.nearbyEnemies.length > 0) {
            if (this.currentEnemyIndex >= this.nearbyEnemies.length) {
                this.currentEnemyIndex = 0;
            }
            this.currentEnemy = this.nearbyEnemies[this.currentEnemyIndex];
            this.arrow.setPosition(
                this.currentEnemy.position.x,
                this.currentEnemy.position.y - this.currentEnemy.gameObject.height / 2,
            );
            this.arrow.setVisible(true);
        } else {
            this.arrow.setVisible(false);
        }
    }
    getNearbyEnemies = (player, range = 200) => {
        const allBodies = this.matter.world.localWorld.bodies;

        // Lọc các body có label là 'enemy'
        const enemies = allBodies.filter((body) => body.label === 'enemy');
        const nearbyEnemies = [];

        enemies.forEach((enemy) => {
            // Tính khoảng cách giữa enemy và player
            const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.position.x, enemy.position.y);

            // Nếu khoảng cách <= 200 thì thêm vào mảng nearbyEnemies
            if (distance <= range) {
                nearbyEnemies.push(enemy);
            }
        });

        return nearbyEnemies;
    };
    handleSever(socket) {
        socket.on('deletePlayer', (id) => {
            this.destroyPlayer(id);
        });
        socket.on('changePlayer', (playersData) => {
            Object.entries(playersData).forEach(([id, data]) => {
                this.playersData[id] = data;

                if (!this.players[id]) {
                    if (this.playersData[id].map === this.player.map) {
                        this.handleNewPlayer(data, id);
                    }
                } else {
                    this.players[id].body.anims.play(data.anim, true);
                    this.players[id].body.setPosition(data.position.x, data.position.y);
                    this.players[id].name.setPosition(
                        this.players[id].body.x,
                        this.players[id].body.y - this.players[id].body.height / 4 - 10,
                    );
                }
            });
        });
    }
    handleNewPlayer(data, id) {
        const pos = { x: data.position.x, y: data.position.y };
        if (id !== this.socket.id) {
            const player = this.matter.add.sprite(pos.x, pos.y, 'player');
            const name = this.add.text(pos.x, pos.y, data.name);
            name.setDepth(10);
            name.setOrigin(0.5);
            const colliderWidth = 50;
            const colliderHeight = 100;
            player.setExistingBody(
                this.matter.add.rectangle(0, 0, colliderWidth, colliderHeight, {
                    isStatic: true,
                    isSensor: true,
                    label: 'enemy',
                }),
            );
            player.setScale(0.5);
            player.setDepth(10);
            player.setFixedRotation();
            // player.body.collisionFilter = {
            //     //group: -1, // Đặt nhóm của enemy
            //     category: 0x0002, // Mã nhóm của enemy
            //     mask: 0x0001, // Không va chạm với nhóm player
            // };
            this.players[id] = { name: name, body: player };
        }
    }
    getInfoPlayer() {
        const anim = this.player.anims.currentAnim?.key;

        return {
            position: { x: this.player.x, y: this.player.y },
            anim: anim,
            map: this.player.map,
            name: this.player.name,
        };
    }
    update(time, delta) {
        this.updateArrow();
        const speed = 2; // * delta; // Tăng tốc độ dựa trên delta
        const direction = this.joystick.getDirection();

        this.socket.emit('updatePlayer', this.getInfoPlayer());
        //Cập nhật vị trí của player dựa trên joystick
        this.name.setPosition(this.player.x, this.player.y - this.player.height / 4 - 10);
        //const info = this.getInfoPlayer();
        if (direction.x !== 0 || direction.y !== 0) {
            //  anims.play(info.anims.currentAnim.key, true);
            //info.anims.currentAnim.key
            this.player.setVelocity(speed * direction.x * 2, speed * direction.y * 2); // Nhân với 2 để tăng tốc độ

            // Chọn animation phù hợp dựa trên hướng di chuyển
            this.updatePlayerAnimation(direction);
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('turn', true);
        }
        //this.player2.anims.play(info.anims.currentAnim.key, true);
    }
    handleCollision(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            if (bodyA.label === 'trigger' || bodyB.label === 'trigger') {
                const triggerBody = bodyA.label === 'trigger' ? bodyA : bodyB;
                console.log(triggerBody);

                triggerBody.event();
            }
        });
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
    destroyPlayer(id) {
        this.players[id].name.destroy();
        this.players[id].body.destroy();
        delete this.players[id];
        delete this.playersData[id];
    }
    loadMap(mapKey, [x, y]) {
        Object.entries(this.players).forEach(([id]) => {
            this.destroyPlayer(id);
        });
        this.players = {};
        this.arrow.setPosition(x, y);
        this.player.map = mapKey;

        this.isMapSwitched = false;
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
            let isMapSwitched = false;
            if (!isMapSwitched) {
                isMapSwitched = true; // Đánh dấu là đã gọi
                setTimeout(() => {
                    this.switchMap(e.mapName, [start.x, start.y]);
                }, 500);
            }
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
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                isStatic: true,
                isSensor: true,
                label: 'trigger',
                ...item,
            };
            const trigger = this.matter.add.rectangle(
                rectangle.x + rectangle.width / 2,
                rectangle.y + rectangle.height / 2,
                rectangle.width,
                rectangle.height,
                {
                    event: () => {
                        if (!this.isMapSwitched) {
                            this.isMapSwitched = true;
                            callback(item.properties);
                        }
                    },
                    isSensor: rectangle.isSensor,
                    isStatic: rectangle.isStatic,
                    label: rectangle.label,
                    restitution: rectangle.restitution,
                    friction: rectangle.friction,
                    density: rectangle.density,
                },
            );
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
