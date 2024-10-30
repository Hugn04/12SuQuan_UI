class Joystick {
    constructor(scene, x, y, size = 200) {
        this.scene = scene;
        this.size = size;
        this.joystickArea = this.scene.add.circle(x, y, size, size, 0x666666).setOrigin(0.5).setScrollFactor(0);
        this.joystick = this.scene.add
            .circle(x, y, size / 1.5, size / 1.5, 0x666666, 0.5)
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.joystickArea.setInteractive();
        this.joystickArea.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
        this.scene.input.on('pointermove', this.onPointerMove, this);
        this.joystick.setDepth(999);
        this.joystickArea.setDepth(999);

        this.isMoving = false;
        this.direction = { x: 0, y: 0 };
    }

    onPointerDown(pointer) {
        this.isMoving = true;
        this.moveJoystick(pointer);
    }

    onPointerMove(pointer) {
        if (this.isMoving) {
            this.moveJoystick(pointer);
        }
    }

    onPointerUp() {
        this.isMoving = false;
        this.joystick.setPosition(this.joystickArea.x, this.joystickArea.y);
        this.direction = { x: 0, y: 0 };
    }

    moveJoystick(pointer) {
        const dx = pointer.x - this.joystickArea.x;
        const dy = pointer.y - this.joystickArea.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size) {
            this.joystick.setPosition(this.joystickArea.x + dx, this.joystickArea.y + dy);
            this.direction = { x: dx / distance, y: dy / distance };
        } else {
            const [x, y] = this.getPointOnCircle([this.joystickArea.x, this.joystickArea.y], this.size, [
                pointer.x,
                pointer.y,
            ]);

            this.joystick.setPosition(x, y);
            this.direction = { x: dx / distance, y: dy / distance };
        }
    }
    getPointOnCircle(circleCenter, radius, externalPoint) {
        const [a, b] = circleCenter; // Tâm hình tròn
        const [x_p, y_p] = externalPoint; // Điểm bên ngoài

        // Tính khoảng cách d từ tâm đến điểm bên ngoài
        const d = Math.sqrt((x_p - a) ** 2 + (y_p - b) ** 2);

        // Tính tọa độ điểm D trên đường tròn
        const x_d = a + (radius * (x_p - a)) / d;
        const y_d = b + (radius * (y_p - b)) / d;

        return [x_d, y_d];
    }

    getDirection() {
        return this.direction;
    }
}

export default Joystick;
