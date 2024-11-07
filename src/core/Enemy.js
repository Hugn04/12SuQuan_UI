import Phaser from 'phaser';

class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.add.existing(this);
        this.scene.matter.add.gameObject(this);
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
        this.objName = this.scene.add.text(this.x, this.y - this.height / 4 - 10, this.name);
        this.objName.setDepth(9);
        this.objName.setOrigin(0.5);

        this.setFixedRotation(); // Giữ nguyên hướng không quay
        this.createAnimations();
        this.setScale(0.5);
        this.setDepth(9);
    }
    updatePosition(x, y) {
        this.setPosition(x, y);
        this.objName.setPosition(this.x, this.y - this.height / 4 - 10);
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

        this.objName.destroy();

        super.destroy();
    }
}

export default Enemy;
