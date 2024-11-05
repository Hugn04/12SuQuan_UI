import Phaser from 'phaser';
import createInput from '../components/createInput';
import createButton from '../components/createButton';
import request from '../service/request';
class LoginForm extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    preload() {
        this.load.image('bg', 'assets/images/background.png');
        request
            .get('/auth')
            .then(() => {
                this.scene.start('GameScene');
            })
            .catch((err) => {});
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(0, 0, 'bg').setOrigin(0);
        this.add.text(width / 2, height / 4, 'Đăng nhập', { fontSize: '26px', fill: '#000' }).setOrigin(0.5);

        this.userName = createInput(this, width / 2, height / 3, { placeholder: 'Nhập tên tài khoản' });
        this.password = createInput(this, width / 2, height / 2.6, { type: 'password', placeholder: 'Nhập mật khẩu' });

        // Tạo nút đăng nhập
        this.loginBtn = createButton(this, width / 2, height / 2.2, {
            onClick: () => {
                this.handleLogin();
            },
            title: 'Đăng nhập',
        });
        this.registerBtn = createButton(this, width / 2, height / 2, {
            classList: ['link'],
            onClick: () => {
                this.scene.start('RegisterScene');
            },
            title: 'Tôi chưa có tài khoản   ',
        });

        // Thông báo lỗi
        this.errorMessage = this.add
            .text(width / 2, height / 3.6, '', { fontSize: '18px', color: 'red' })
            .setOrigin(0.5);
    }

    async handleLogin() {
        const userName = this.userName.node.value;
        const password = this.password.node.value;
        if (!userName && !password) {
            this.errorMessage.setText('Bắt buộc nhập tài khoản và mật khẩu !');
        } else {
            try {
                const data = await request.post('/login', { userName, password });
                await localStorage.setItem('asset_token', data.asset_token);

                window.location.reload();
            } catch (error) {
                console.log(error.response.data?.message);
            }
        }
    }
}

export default LoginForm;
