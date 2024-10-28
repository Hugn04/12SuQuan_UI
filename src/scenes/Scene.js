import Phaser from 'phaser';
import { socket } from '../service';

class Scene extends Phaser.Scene {
    constructor(name) {
        super(name);

        this.lastTime = 0; // Lưu thời gian của khung hình trước đó
        this.fpsDisplay = null; // Đối tượng hiển thị FPS
        this.frameCount = 0; // Lưu trữ các phím điều khiển
    }

    preload() {
        this.socket = socket;
    }

    create() {
        this.time.addEvent({
            delay: 1000,
            callback: this.updatePing,
            callbackScope: this,
            loop: true,
        });

        this.fpsDisplay = this.add.text(10, 10, 'FPS: 0', {
            font: '16px Arial',
            fill: '#ffffff',
        });
        this.pingDisplay = this.add.text(this.scale.width - 100, 10, 'Ping: 0 ms', {
            font: '16px Arial',
            fill: '#ffffff',
        });
    }

    updatePing() {
        this.socket.getPing((ping) => {
            const pingText = `Ping: ${ping} ms`; // Ghi nhận FPS hiện tại
            this.pingDisplay.setText(pingText);
        });
    }
    updateFPS(time) {
        if (this.lastTime) {
            this.frameCount++;
            const deltaTime = time - this.lastTime;
            // Mỗi giây, cập nhật thông tin FPS
            if (deltaTime >= 1000) {
                const fpsText = `FPS: ${this.frameCount}`; // Ghi nhận FPS hiện tại
                this.fpsDisplay.setText(fpsText); // Cập nhật hiển thị FPS
                this.frameCount = 0; // Đặt lại đếm khung hình
                this.lastTime = time; // Cập nhật thời gian khung hình trước
            }
        } else {
            this.lastTime = time; // Lưu thời gian khung hình đầu tiên
        }
    }

    update(time) {
        this.updateFPS(time, (fps) => {
            console.log(fps);
        });
    }
}

export default Scene;
