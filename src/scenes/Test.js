import Player from '../objects/Player';
import Joystick from '../helpers/joystick';

class Test extends Phaser.Scene {
    //controls;

    preload() {
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 100, frameHeight: 149 });
    }

    create() {
        this.player = new Player({ scene: this, x: 0, y: 0, key: 'player', name: 'HungKC' });
        this.joystick = new Joystick(this, 200, 600, 100);
        this.input.keyboard.on('keydown-V', () => {
            this.player.destroy();
        });
    }

    update(time, delta) {
        const direction = this.joystick.getDirection();
        this.player.move(direction);
        this.player.update();
    }
}
export default Test;
