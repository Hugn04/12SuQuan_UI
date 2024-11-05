import Phaser from 'phaser';
import createInput from '../components/createInput';
import createButton from '../components/createButton';
import request from '../service/request';

class LoginForm extends Phaser.Scene {
    constructor() {
        super('RegisterScene');
    }

    preload() {
        this.load.image('bg', 'assets/images/background.png');
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(0, 0, 'bg').setOrigin(0);
        this.add.text(width / 2, height / 4, 'Đăng ký tài khoản', { fontSize: '26px', fill: '#000' }).setOrigin(0.5);

        this.userName = createInput(this, width / 2, height / 3, { placeholder: 'Nhập tên tài khoản' });
        this.password = createInput(this, width / 2, height / 2.6, { type: 'password', placeholder: 'Nhập mật khẩu' });
        this.confirmPassword = createInput(this, width / 2, height / 2.3, {
            type: 'password',
            placeholder: 'Nhập lại mật khẩu',
        });

        // Tạo nút đăng nhập
        this.rendererBtn = createButton(this, width / 2, height / 2, {
            onClick: () => {
                this.handleRegister();
            },
            title: 'Đăng ký ',
        });
        this.loginBtn = createButton(this, width / 2, height / 1.85, {
            classList: ['link'],
            onClick: () => {
                this.scene.start('LoginScene');
            },
            title: 'Tôi đã có tài khoản',
        });

        // Thông báo lỗi
        this.errorMessage = this.add
            .text(width / 2, height / 3.6, '', { fontSize: '18px', color: 'red' })
            .setOrigin(0.5);
    }

    handleRegister() {
        const userName = this.userName.node.value;
        const password = this.password.node.value;
        const confirmPassword = this.confirmPassword.node.value;

        if (!userName && !password && !confirmPassword) {
            this.errorMessage.setText('Bắt buộc nhập đầy đủ thông tin !');
        } else {
            if (password !== confirmPassword) {
                this.errorMessage.setText('Bạn nhập lại mật khẩu bị sai !');
            } else {
                request
                    .post('/register', { userName, password })
                    .then(() => {
                        this.scene.start('LoginScene');
                    })
                    .catch(() => {
                        console.log('Lỗi');
                    });
            }
        }
    }
}

export default LoginForm;
