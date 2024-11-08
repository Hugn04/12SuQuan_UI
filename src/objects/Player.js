import Phaser from 'phaser';

class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        this.name = config.name;
        this.scene.matter.add.gameObject(this);
        this.createAnimations();
        this.setScale(0.8);
        this.setDepth(11);
        this.setExistingBody(
            this.scene.matter.add.circle(0, 100, (this.width * this.scale) / 3.5, {
                isStatic: false,
                label: 'player',
            }),
        );
        this.setFixedRotation();

        this.setOrigin(0.5, 0.8);
        this.objName = this.scene.add.text(0, 0, this.name, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: 'red',
            fontStyle: 'bold',
        });
        this.objName.setDepth(this.depth);
        this.objName.setOrigin(0.5);
        this.objName.setScale(this.scale);
    }

    update() {
        this.objName.setPosition(this.x, this.y - this.height * this.scaleY * 0.8);
    }

    move(direction) {
        const speed = 2; // Định nghĩa tốc độ di chuyển của player
        if (direction.x !== 0 || direction.y !== 0) {
            this.setVelocity(speed * direction.x * 2, speed * direction.y * 2); // Tăng tốc độ

            // Chọn animation phù hợp dựa trên hướng di chuyển
            this.updateAnimation(direction);
        } else {
            this.setVelocity(0, 0);
            this.anims.play('turn', true);
        }
    }

    updateAnimation(direction) {
        const absX = Math.abs(direction.x);
        const absY = Math.abs(direction.y);

        if (direction.x < 0) {
            if (direction.y < 0) {
                if (absX < absY) {
                    this.anims.play('up', true);
                } else {
                    this.anims.play('left', true);
                }
            } else {
                if (absX > absY) {
                    this.anims.play('left', true);
                } else {
                    this.anims.play('down', true);
                }
            }
        } else {
            if (direction.y < 0) {
                if (absX > absY) {
                    this.anims.play('right', true);
                } else {
                    this.anims.play('up', true);
                }
            } else {
                if (absX > absY) {
                    this.anims.play('right', true);
                } else {
                    this.anims.play('down', true);
                }
            }
        }
    }

    createAnimations() {
        this.scene.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 0 }], frameRate: 20 });
        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 12, end: 13 }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: 'down',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: 'up',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });
    }
    destroy() {
        this.setActive(false);

        this.objName.destroy();

        super.destroy();
    }
}

export default Player;
