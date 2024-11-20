class Alert extends Phaser.GameObjects.Container {
    constructor(scene, message, onAccept, onCancel) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);

        this.scene = scene;

        // Kích thước hộp thoại
        const width = scene.scale.width * 0.6;
        const height = scene.scale.height * 0.4;

        // Nền mờ
        const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.5);
        overlay.setOrigin(0.5);

        // Hộp thoại
        const box = scene.add.rectangle(0, 0, width, height, 0xffffff);
        box.setStrokeStyle(4, 0x000000);

        // Văn bản thông báo
        const text = scene.add
            .text(0, -height * 0.2, message, {
                fontSize: '24px',
                color: '#000',
                wordWrap: { width: width * 0.8 },
                align: 'center',
            })
            .setOrigin(0.5);

        // Nút Chấp nhận
        const acceptButton = scene.add.rectangle(-width * 0.2, height * 0.2, width * 0.35, height * 0.15, 0x28a745);
        acceptButton.setScrollFactor(0);
        const acceptText = scene.add
            .text(acceptButton.x, acceptButton.y, 'Accept', {
                fontSize: '20px',
                color: '#fff',
            })
            .setOrigin(0.5);

        // Nút Hủy
        const cancelButton = scene.add.rectangle(width * 0.2, height * 0.2, width * 0.35, height * 0.15, 0xdc3545);
        cancelButton.setScrollFactor(0);
        const cancelText = scene.add
            .text(cancelButton.x, cancelButton.y, 'Cancel', {
                fontSize: '20px',
                color: '#fff',
            })
            .setOrigin(0.5);

        // Tạo sự kiện nút
        acceptButton.setInteractive().on('pointerdown', () => {
            this.destroy();
            if (onAccept) onAccept();
        });

        cancelButton.setInteractive().on('pointerdown', () => {
            this.destroy();
            if (onCancel) onCancel();
        });
        // Thêm tất cả các thành phần vào Container
        this.add([overlay, box, text, acceptButton, acceptText, cancelButton, cancelText]);

        // Thêm Container vào Scene
        scene.add.existing(this);
        this.setScrollFactor(0);
        this.setDepth(1000); // Đảm bảo hộp thoại luôn ở trên
    }

    destroy() {
        super.destroy();
    }
}
export default Alert;
