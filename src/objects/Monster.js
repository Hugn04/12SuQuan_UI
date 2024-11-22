import Phaser from 'phaser';

class Monster extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        if (this.scene.matter) {
            this.scene.matter.add.gameObject(this);
        } else {
            console.error('Matter.js chưa được cấu hình trong Scene.');
        }
        this.name = config.name;

        const colliderWidth = 50;
        const colliderHeight = 100;
        this.setExistingBody(
            this.scene.matter.add.rectangle(this.x, this.y, colliderWidth, colliderHeight, {
                isStatic: true,
                isSensor: true,
                label: 'enemy',
            }),
        );
        this.setFixedRotation(); // Giữ nguyên hướng không quay
        this.createAnimations();
        this.setScale(0.8);
        this.setDepth(9);

        this.objName = this.scene.add.text(this.x, this.y, this.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold',
        });
        this.objName.setDepth(this.depth);
        this.objName.setOrigin(0.5);
    }
    updatePosition(x, y) {
        this.setPosition(x, y);
        this.objName.setPosition(this.x, this.y - (this.height * this.scaleY) / 2);
    }

    update() {}

    updateAnimation(type) {
        this.anims.play(type, true);
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
        if (this.objName) {
            this.objName.destroy();
        }

        super.destroy();
    }
}

export default Monster;
