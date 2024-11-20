class InfoContainer extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene, config.x, config.y);
        config.scene.add.existing(this);
        this.nearbyEnemies = [];
        this.currentEnemy = null;
        this.currentEnemyIndex = 0;

        this.arrow = this.scene.add.sprite(0, 0, 'arrow');
        this.arrow.setScale(0.17);
        this.arrow.setDepth(11);
        this.arrow.setVisible(true);

        this.background = this.scene.add.rectangle(0, 0, 200, 50, 0x333333, 0.8);
        this.background.setOrigin(0.5);

        this.name = this.scene.add.text(0, 0, 'Người chơi', {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial',
        });
        this.name.setOrigin(0.5);

        this.level = this.scene.add.text(this.background.width / 2 - 8, 0, 'LV1', {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial',
        });
        this.level.setOrigin(1, 0.5);

        this.btnChange = this.scene.add.text(0, -this.background.height / 2 - 20, 'Đổi', {
            fontSize: '24px',
            color: '#ffcc00',
            fontFamily: 'Arial',
            backgroundColor: '#444444',
            padding: { x: 8, y: 8 },
            align: 'center',
        });
        this.btnChange.setOrigin(0.5, 1);
        this.btnChange.setScrollFactor(0);
        this.btnChange.setInteractive({
            useHandCursor: true,
        });
        this.btnChange.on('pointerdown', () => {
            if (this.nearbyEnemies.length > 0) {
                this.currentEnemyIndex = (this.currentEnemyIndex + 1) % this.nearbyEnemies.length;
            }
        });

        this.btnFight = this.scene.add.text(this.background.width / 2 + 20, 0, 'Thách đấu', {
            fontSize: '24px',
            color: '#ffcc00',
            fontFamily: 'Arial',
            backgroundColor: '#444444',
            padding: { x: 8, y: 8 },
            align: 'center',
        });
        this.btnFight.setOrigin(0, 0.5);
        this.btnFight.setScrollFactor(0);
        this.btnFight.setInteractive({
            useHandCursor: true,
        });

        this.btnFight.on('pointerdown', () => {
            this.scene.socket.emit('invitePlayer', {
                invitedPlayerID: this.currentEnemy.id,
                data: this.scene.dataPlayer,
                status: 0,
            });
        });
        this.add([this.background, this.name, this.btnChange, this.btnFight, this.level]);
        this.setScrollFactor(0);
        this.setDepth(100);
    }
    static preload(scene) {
        scene.load.image('arrow', 'assets/images/arrow.png');
    }
    update(nearbyEnemies) {
        this.nearbyEnemies = nearbyEnemies;
        if (this.nearbyEnemies.length > 1) {
            this.btnChange.setVisible(true);
        } else {
            this.btnChange.setVisible(false);
        }
        if (this.nearbyEnemies.length > 0) {
            if (this.currentEnemyIndex >= this.nearbyEnemies.length) {
                this.currentEnemyIndex = 0;
            }

            this.currentEnemy = this.nearbyEnemies[this.currentEnemyIndex];

            this.arrow.setPosition(
                this.currentEnemy.x,
                this.currentEnemy.y - (this.currentEnemy.height * this.currentEnemy.scale) / 2 - 36,
            );
            this.name.setText(this.currentEnemy.name);
            this.setVisible(true);
            this.arrow.setVisible(true);
        } else {
            this.setVisible(false);
            this.arrow.setVisible(false);
        }
    }
    destroy() {
        this.name.destroy();
        this.arrow.destroy();
        this.level.destroy();
        super.destroy();
    }
}

export default InfoContainer;
