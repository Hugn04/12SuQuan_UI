import Joystick from '../helpers/joystick';

class Test extends Phaser.Scene {
    //controls;

    preload() {}

    create() {
        this.input.keyboard.on('keydown', () => {
            this.scene.switch('GameScene');
        });
    }

    update(time, delta) {}
}
export default Test;
