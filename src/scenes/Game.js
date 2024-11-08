import Phaser from 'phaser';
import Joystick from '../helpers/joystick';
import { io } from 'socket.io-client';
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import request from '../service/request';
import createButton from '../components/createButton';
import Player from '../objects/Player';
import Enemy from '../objects/Enemy';
import InfoContainer from '../objects/InfoContainer';

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.isDataReady = false;
        this.isMapSwitched = false;
        this.arrTrigger = [];
        this.arrLayer = [];
        this.playersData = {};
        this.players = {};
        this.isComback = false;
    }

    init({ socket }) {
        if (socket) {
            this.socket = socket;
            this.isComback = true;
        } else {
            this.socket = io(import.meta.env.VITE_SOME_SERVER);
        }
    }
    preload() {
        InfoContainer.preload(this);
        this.load.image('glass', 'assets/tilemaps/tiles/Glass.png');
        this.load.image('other', 'assets/tilemaps/tiles/rock.png');
        this.load.image('full', 'assets/tilemaps/tiles/full.png');
        this.load.tilemapTiledJSON('Map1', 'assets/tilemaps/maps/Map1.json');
        this.load.tilemapTiledJSON('Map2', 'assets/tilemaps/maps/Map2.json');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });

        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    }
    async create() {
        try {
            this.dataPlayer = await request.get('/data');

            console.log(this.socket.id);
            createButton(this, 600, 100, {
                title: 'Đăng xuất',
                onClick: () => {
                    this.logout();
                },
            }).setScrollFactor(0);
            this.player = new Player({ scene: this, x: 0, y: 0, name: this.dataPlayer.userName, key: 'player' });

            this.loadMap(this.dataPlayer.map, [this.dataPlayer.position.x, this.dataPlayer.position.y]);
            this.matter.world.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(0, 0, this.currentMap.widthInPixels, this.currentMap.heightInPixels);
            this.joystick = new Joystick(this, 200, 1050, 100);
            this.input.keyboard.on('keydown-V', () => {});
            this.info = new InfoContainer({
                scene: this,
                x: this.cameras.main.width / 2,
                y: 900,
            });
            this.info.setVisible(false);
            this.handleSever(this.socket);
            this.isDataReady = true;
        } catch (error) {
            console.log(error);

            this.scene.start('LoginScene');
        }
    }
    getNearbyEnemies = (player, range = 350) => {
        const allBodies = this.matter.world.localWorld.bodies;
        const enemies = allBodies.filter((body) => body.label === 'enemy');
        const nearbyEnemies = [];

        enemies.forEach((enemy) => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.position.x, enemy.position.y);
            if (distance <= range) {
                nearbyEnemies.push(enemy.gameObject);
            }
        });
        return nearbyEnemies;
    };
    logout() {
        this.clearAllObjects();
        this.socket.close();
        this.isDataReady = false;
        localStorage.removeItem('asset_token');
        this.scene.start('LoginScene');
    }
    handleSever(socket) {
        !this.isComback && socket.emit('newPlayer', this.getInfoPlayer());

        socket.on('accecptChallenge', ({ id, name, data, status }) => {
            if (status == 0) {
                alert(`${name} muốn thách đấu với bạn`);
                this.clearAllObjects();
                this.isDataReady = false;
                this.isComback = false;
                this.scene.start('GamePlay', { self: this.dataPlayer, other: data, socket: this.socket });
                this.socket.emit('inviteChallenge', {
                    id: id,
                    data: this.dataPlayer,
                    status: 1,
                });
            } else if (status == 1) {
                alert(`${name} chấp nhận lời mời`);
                this.clearAllObjects();
                this.isDataReady = false;
                this.isComback = false;
                this.scene.start('GamePlay', { self: this.dataPlayer, other: data, socket: this.socket });
            }
        });
        socket.on('dbAccount', () => {
            this.logout();
            alert('Tài khoản của bạn hiện đang đăng nhập ở thiết bị khác !');
        });
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
                    this.players[id].anims.play(data.anim || 'turn', true);
                    this.players[id].updatePosition(data.position.x, data.position.y);
                }
            });
        });
    }
    handleNewPlayer(data, id) {
        const pos = { x: data.position.x, y: data.position.y };
        if (id !== this.socket.id) {
            const player = new Enemy({ scene: this, x: 200, y: 200, key: 'player', name: data.name });
            player.id = id;

            this.players[id] = player;
        }
    }
    getInfoPlayer() {
        const anim = this.player.anims?.currentAnim?.key;

        try {
            return {
                position: { x: this.player.x, y: this.player.y },
                anim: anim,
                map: this.player.map,
                name: this.player.name,
            };
        } catch (error) {
            return {
                position: { x: 0, y: 0 },
                anim: 'turn',
                map: 'Map1',
                name: 'this.player.name',
            };
        }
    }
    update(time, delta) {
        if (this.isDataReady && this.player) {
            this.info.update(this.getNearbyEnemies(this.player));
            const direction = this.joystick.getDirection();
            this.socket.emit('updatePlayer', this.getInfoPlayer());
            this.player.move(direction);
            this.player.update();
        }
    }
    handleCollision(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            if (bodyA.label === 'trigger' || bodyB.label === 'trigger') {
                const triggerBody = bodyA.label === 'trigger' ? bodyA : bodyB;

                triggerBody.event();
            }
        });
    }

    destroyPlayer(id) {
        this.players[id].destroy();
        delete this.players[id];
        delete this.playersData[id];
    }
    loadMap(mapKey, [x, y]) {
        Object.entries(this.players).forEach(([id]) => {
            this.destroyPlayer(id);
        });
        this.players = {};
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
        this.sys.animatedTiles.init(this.currentMap);
        this.player.setPosition(x, y);
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

    clearAllObjects() {
        this.player.destroy();
        this.players = {};
        this.arrLayer.forEach((layer) => {
            layer.forEachTile((tile) => {
                if (tile.physics && tile.physics.matterBody) {
                    this.matter.world.remove(tile.physics.matterBody);
                }
                layer.destroy();
            });
        });
        this.arrLayer = [];
        this.info.destroy();
        this.arrTrigger.forEach((trigger) => {
            this.matter.world.remove(trigger);
        });
        this.arrTrigger = [];
        this.info.destroy();
        this.joystick.destroy();
    }
}

export default Game;
