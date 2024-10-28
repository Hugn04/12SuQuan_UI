import Human from './Human';
class Player extends Human {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(texture, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    update(keys) {
        // Kiểm tra input từ bàn phím và điều khiển player
        if (keys.A.isDown) {
            this.setVelocityX(-160);
            this.anims.play('left', true);
        } else if (keys.D.isDown) {
            this.setVelocityX(160); // Di chuyển sang phải
        } else {
            this.setVelocityX(0); // Dừng lại nếu không có input
        }

        // Kiểm tra nhảy bằng phím 'W'
        if (keys.W.isDown && this.body.touching.down) {
            setVelocityY(-330); // Nhảy lên khi đang trên mặt đất
        }
    }
    // Khởi tạo nhiều phím trong hàm create
}
export default Player;
