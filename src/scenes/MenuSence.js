import { socket } from '../service';
import Scene from './Scene';

class MenuScene extends Scene {
    constructor() {
        super('GameSceneas');
        this.player;
        this.stars;
        this.platforms;
        this.cursors;
        this.score = 0;
        this.scoreText;
        this.gameOver = false;
        this.socket;
        this.others = [];
        this.othersprite = [];
        this.lastSentPosition = { x: 0, y: 0 }; // Lưu vị trí cuối cùng đã gửi
        this.lastUpdateTime = 0; // Thời gian lần cuối cùng gửi vị trí
        this.sendInterval = 50; // Chỉ gửi dữ liệu mỗi 50ms
        this.pingText;
    }

    preload() {
        super.preload();
        this.socket = socket;
        this.load.image('sky', 'assets/images/sky.png');
        this.load.image('ground', 'assets/images/platform.png');
        this.load.image('star', 'assets/images/star.png');
        this.load.image('bomb', 'assets/images/bomb.png');
        this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.add.image(400, 300, 'sky');

        // this.Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        // Add this.player sprite
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Set animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        // this.Stars - dynamic group as we need them to move and bounce.
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
        });

        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Add star physics
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // this.Bombs - dynamic group
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // Set key controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Set up scoring
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Hiển thị ping

        // Cập nhật ping mỗi giây

        super.create();
    }

    update(time) {
        super.update(time);

        // Dự đoán di chuyển của nhân vật (Client-side Prediction)
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Chỉ gửi vị trí nếu có thay đổi đáng kể
        const positionChanged =
            Math.abs(this.player.x - this.lastSentPosition.x) > 5 ||
            Math.abs(this.player.y - this.lastSentPosition.y) > 5;

        if (positionChanged && time - this.lastUpdateTime > this.sendInterval) {
            socket.emit('updatePlayerPosition', { x: this.player.x, y: this.player.y });
            this.lastSentPosition = { x: this.player.x, y: this.player.y };
            this.lastUpdateTime = time;
        }

        // Điều chỉnh lại vị trí khi nhận phản hồi từ server
        socket.on('syncPlayerPosition', (data) => {
            if (data.id === this.socket.id) {
                this.player.x = data.x;
                this.player.y = data.y;
            }
        });

        // Cập nhật vị trí người chơi khác
        this.updateOtherPlayers();
    }

    updateOtherPlayers() {
        // Xóa các sprite người chơi khác trước đó
        if (this.othersprite.length > 0) {
            this.othersprite.forEach((sprite) => sprite.destroy());
            this.othersprite = [];
        }

        // Vẽ lại các người chơi khác dựa trên dữ liệu từ server
        this.others.forEach((other) => {
            if (other.id !== this.socket.id) {
                let otherPlayerSprite = this.physics.add.sprite(other.x, other.y, 'dude');
                this.othersprite.push(otherPlayerSprite);

                // Nội suy di chuyển
                this.physics.moveTo(otherPlayerSprite, other.x, other.y, 120); // Di chuyển từ từ với tốc độ 120
            }
        });
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.gameOver = true;
    }
}

export default MenuScene;
