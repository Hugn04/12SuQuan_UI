class Human extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        // Gọi hàm tạo của lớp cha (Phaser.Physics.Arcade.Sprite)
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
    }
    static preload() {
        this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
    }
}
export default Human;
