import Player from '../core/Player.js';
import Scene from './Scene';
import Phaser from 'phaser';

class Test extends Phaser.Scene {
    constructor() {
        super({ key: 'MyGame' });
        this.player;
        this.monsters = [];
        this.chairs = [];
        this.cursors;
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;
        this.PLAYER_SPEED = 100; // Tốc độ di chuyển của nhân vật
        this.MONSTER_NAMES = ['Goblin', 'Orc', 'Troll']; // Tên quái vật
        this.selectedMonsterIndex = -1; // Chỉ số quái vật được chọn
        this.indicator; // Mũi tên chỉ định
        this.monsterPresent = 0;
        this.monstersNear = []; // Lưu danh sách các quái vật gần
        this.currentMonsterIndex = 0; // Quái vật đang được chọn
        this.monsterSelectedManually = false;
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('monster', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('chair', 'https://labs.phaser.io/assets/sprites/arrow.png');
        this.load.image('arrow', 'https://labs.phaser.io/assets/sprites/arrow.png'); // Mũi tên chỉ định
    }

    create() {
        // Tạo nhân vật
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.chairs, this.stopPlayer);

        // Tạo quái vật
        for (let i = 0; i < this.MONSTER_NAMES.length; i++) {
            const monster = this.physics.add.sprite(100 + 20 * i, 100 + 20 * i, 'monster');
            // monster.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
            monster.setBounce(1);
            monster.setCollideWorldBounds(true);
            this.monsters.push(monster);

            // Thêm tên cho quái vật
            const nameText = this.add.text(monster.x, monster.y - 25, this.MONSTER_NAMES[i], {
                fontSize: '16px',
                fill: '#fff',
            });
            monster.nameText = nameText; // Lưu tên vào quái vật
        }

        // Tạo ghế cố định
        for (let i = 0; i < 3; i++) {
            const chair = this.physics.add.staticSprite(200 + i * 200, 400, 'chair');
            this.chairs.push(chair);
        }

        // Thiết lập điều khiển
        this.cursors = this.input.keyboard.createCursorKeys();

        // Va chạm giữa quái vật và ghế
        this.monsters.forEach((monster) => {
            this.chairs.forEach((chair) => {
                this.physics.add.collider(monster, chair);
            });
        });

        // Mũi tên chỉ định
        this.indicator = this.add.image(0, 0, 'arrow').setOrigin(0.5, 0.5).setVisible(false);

        // Chuyển đổi giữa các quái vật
        this.input.keyboard.on('keydown-SPACE', () => {
            console.log('haha');
            this.currentMonsterIndex = (this.currentMonsterIndex + 1) % this.monstersNear.length;
            this.monsterPresent = this.monstersNear[this.currentMonsterIndex];
            this.monsterSelectedManually = true; // Ghi nhớ rằng người chơi đã chọn thủ công
        });
    }

    update(time) {
        if (this.cursors.left.isDown) {
            this.playerVelocityX = -this.PLAYER_SPEED;
            this.playerVelocityY = 0;
        } else if (this.cursors.right.isDown) {
            this.playerVelocityX = this.PLAYER_SPEED;
            this.playerVelocityY = 0;
        } else if (this.cursors.up.isDown) {
            this.playerVelocityY = -this.PLAYER_SPEED;
            this.playerVelocityX = 0;
        } else if (this.cursors.down.isDown) {
            this.playerVelocityY = this.PLAYER_SPEED;
            this.playerVelocityX = 0;
        } else {
            this.playerVelocityX = 0;
            this.playerVelocityY = 0;
        }

        // Áp dụng vận tốc cho nhân vật
        this.player.setVelocity(this.playerVelocityX, this.playerVelocityY);

        // Kiểm tra khoảng cách gần quái vật
        // selectedMonsterIndex = -1; // Reset chỉ số quái vật đã chọn
        let previousMonstersNear = [...this.monstersNear]; // Lưu lại danh sách trước đó để so sánh
        this.monstersNear = [];
        this.monsters.forEach((monster, index) => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y);
            monster.nameText.setPosition(monster.x, monster.y - 25); // Cập nhật vị trí tên quái vật

            if (distance < 100) {
                // Khoảng cách để chọn quái vật
                // Cập nhật vị trí mũi tên chỉ định
                // selectedMonsterIndex = index; // Chọn quái vật

                this.monstersNear.push(monster);
            }
        });

        // Nếu danh sách quái vật gần thay đổi và không có hành động chuyển quái vật
        if (
            this.monstersNear.length > 0 &&
            (!this.monsterSelectedManually || this.monstersNear !== previousMonstersNear)
        ) {
            // Kiểm tra và điều chỉnh this.currentMonsterIndex
            if (this.currentMonsterIndex >= this.monstersNear.length) {
                this.currentMonsterIndex = 0; // Đặt lại chỉ số về 0 nếu vượt quá
            }
            this.monsterPresent = this.monstersNear[this.currentMonsterIndex];
            this.indicator.setVisible(true);
            this.indicator.setPosition(this.monsterPresent.x, this.monsterPresent.y - 25);
        }

        // Nếu không có quái vật gần, ẩn mũi tên chỉ định
        if (this.monstersNear.length === 0) {
            this.indicator.setVisible(false);

            this.monsterSelectedManually = false; // Reset lại trạng thái chuyển thủ công
            this.currentMonsterIndex = 0;
        }
    }
    stopPlayer() {
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;
    }
}

export default Test;
